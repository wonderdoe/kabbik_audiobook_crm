import DB from '../config/db.js';
import {
	getMaintenanceEnvironmentLabel,
	getMaintenancePublicReadBaseUrl,
} from './maintenance-config.js';
import {
	crmPayloadToPublicDocument,
	historyEntryFromDocument,
	publicDocumentToAuditPayload,
	publicDocumentToCrmDto,
	toLogEntryShape,
} from './maintenance-json.js';
import { getObject, getObjectVersion, listVersions, putObject } from './maintenance-storage.js';

const PLATFORMS = ['app', 'website'];
const TITLE_MAX = 150;
const MESSAGE_MAX = 500;

function parseOptionalIso(field, raw) {
	if (raw === null || raw === undefined || raw === '') return { value: null };
	const d = new Date(raw);
	if (Number.isNaN(d.getTime())) {
		return { error: { field, message: 'Invalid date format' } };
	}
	return { value: d.toISOString() };
}

export function validatePlatform(platform) {
	if (!PLATFORMS.includes(platform)) {
		return { field: 'platform', message: 'Platform must be app or website' };
	}
	return null;
}

export function validateMaintenancePutBody(body) {
	if (typeof body?.isUnderMaintenance !== 'boolean') {
		return { field: 'isUnderMaintenance', message: 'isUnderMaintenance must be a boolean' };
	}

	const isOn = body.isUnderMaintenance;
	const titleEn = typeof body.titleEn === 'string' ? body.titleEn.trim() : body.titleEn == null ? '' : String(body.titleEn).trim();
	const titleBn = typeof body.titleBn === 'string' ? body.titleBn.trim() : body.titleBn == null ? '' : String(body.titleBn).trim();
	const messageEn =
		typeof body.messageEn === 'string' ? body.messageEn.trim() : body.messageEn == null ? '' : String(body.messageEn).trim();
	const messageBn =
		typeof body.messageBn === 'string' ? body.messageBn.trim() : body.messageBn == null ? '' : String(body.messageBn).trim();

	const startsParsed = parseOptionalIso('startsAt', body.startsAt);
	if (startsParsed.error) return startsParsed.error;
	const endsParsed = parseOptionalIso('endsAt', body.endsAt);
	if (endsParsed.error) return endsParsed.error;

	const startsAt = startsParsed.value;
	const endsAt = endsParsed.value;

	if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
		return { field: 'endsAt', message: 'End must be after start' };
	}

	if (titleEn.length > TITLE_MAX) {
		return { field: 'titleEn', message: `Title must be at most ${TITLE_MAX} characters` };
	}
	if (titleBn.length > TITLE_MAX) {
		return { field: 'titleBn', message: `Title must be at most ${TITLE_MAX} characters` };
	}
	if (messageEn.length > MESSAGE_MAX) {
		return { field: 'messageEn', message: `Message must be at most ${MESSAGE_MAX} characters` };
	}
	if (messageBn.length > MESSAGE_MAX) {
		return { field: 'messageBn', message: `Message must be at most ${MESSAGE_MAX} characters` };
	}

	if (isOn) {
		if (!titleEn) {
			return { field: 'titleEn', message: 'English title is required when maintenance is on' };
		}
		if (!messageEn) {
			return { field: 'messageEn', message: 'English message is required when maintenance is on' };
		}
		if (endsAt && new Date(endsAt) <= new Date()) {
			return { field: 'endsAt', message: 'End time cannot be in the past when turning maintenance on' };
		}
	}

	return {
		isUnderMaintenance: isOn,
		titleEn,
		titleBn,
		messageEn,
		messageBn,
		startsAt,
		endsAt,
	};
}

async function insertAuditLogBestEffort(platform, doc, changedBy) {
	const audit = publicDocumentToAuditPayload(platform, doc);
	const by = String(changedBy).slice(0, 100);
	try {
		await DB.query(
			`INSERT INTO app_maintenance_status_log
         (platform, is_under_maintenance, title_en, title_bn, message_en, message_bn,
          starts_at, ends_at, changed_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				platform,
				audit.isUnderMaintenance ? 1 : 0,
				audit.titleEn || null,
				audit.titleBn || null,
				audit.messageEn || null,
				audit.messageBn || null,
				audit.startsAtMysql,
				audit.endsAtMysql,
				by,
			],
		);
	} catch (error) {
		console.error('[maintenance] audit log insert failed', platform, error);
	}
}

export async function getMaintenanceStatus() {
	const [appResult, websiteResult] = await Promise.all([
		getObject('app').catch(err => {
			if (err.name === 'NoSuchKey' || err.Code === 'NoSuchKey') return null;
			throw err;
		}),
		getObject('website').catch(err => {
			if (err.name === 'NoSuchKey' || err.Code === 'NoSuchKey') return null;
			throw err;
		}),
	]);

	return {
		environmentLabel: getMaintenanceEnvironmentLabel(),
		publicBaseUrl: getMaintenancePublicReadBaseUrl(),
		app: appResult ? publicDocumentToCrmDto(appResult.document, appResult.etag) : null,
		website: websiteResult ? publicDocumentToCrmDto(websiteResult.document, websiteResult.etag) : null,
	};
}

function etagChecksEnabled() {
	const v = process.env.MAINTENANCE_ETAG_CHECKS?.trim().toLowerCase();
	if (v === 'false' || v === '0' || v === 'no') return false;
	return true;
}

export async function updateMaintenanceStatus(platform, payload, changedBy, { ifMatch } = {}) {
	const updatedAtIso = new Date().toISOString();
	const document = crmPayloadToPublicDocument(platform, payload, changedBy, updatedAtIso);
	const useIfMatch = etagChecksEnabled() ? ifMatch : undefined;
	let putResult = await putObject(platform, document, { ifMatch: useIfMatch });

	// DigitalOcean Spaces often returns precondition failed for valid If-Match; retry without it.
	if (putResult.conflict && useIfMatch) {
		putResult = await putObject(platform, document, {});
	}

	if (putResult.conflict) {
		return { conflict: true };
	}

	await insertAuditLogBestEffort(platform, document, changedBy);

	const row = publicDocumentToCrmDto(document, putResult.etag);
	return { row };
}

export async function getMaintenanceHistory({ platform, limit }) {
	const capped = Math.min(Math.max(1, limit), 20);
	const platforms = platform ? [platform] : PLATFORMS;
	const allEntries = [];

	for (const p of platforms) {
		const versions = await listVersions(p, capped);
		for (const v of versions) {
			allEntries.push(historyEntryFromDocument(p, v.versionId, v.document, v.isLatest));
		}
	}

	allEntries.sort((a, b) => {
		const ta = a.changedAt ? new Date(a.changedAt).getTime() : 0;
		const tb = b.changedAt ? new Date(b.changedAt).getTime() : 0;
		return tb - ta;
	});

	return allEntries.slice(0, capped).map(toLogEntryShape);
}

/** @deprecated use getMaintenanceHistory — kept for log route alias */
export async function getMaintenanceLog(opts) {
	return getMaintenanceHistory(opts);
}

export async function restoreMaintenanceVersion(platform, versionId, changedBy) {
	const { document: sourceDoc } = await getObjectVersion(platform, versionId);
	const payload = {
		isUnderMaintenance: Boolean(sourceDoc.isUnderMaintenance),
		titleEn: sourceDoc.title?.en ?? '',
		titleBn: sourceDoc.title?.bn ?? '',
		messageEn: sourceDoc.message?.en ?? '',
		messageBn: sourceDoc.message?.bn ?? '',
		startsAt: sourceDoc.startsAt ?? null,
		endsAt: sourceDoc.endsAt ?? null,
	};
	const validated = validateMaintenancePutBody(payload);
	if (!('isUnderMaintenance' in validated)) {
		return { validationError: validated };
	}
	return updateMaintenanceStatus(platform, validated, changedBy, {});
}

export function actorLabelFromAdmin(admin) {
	const label = admin.email || admin.name || String(admin.id ?? admin.user_id ?? '');
	return String(label).slice(0, 100);
}

export function isMaintenanceConfigError(error) {
	return Boolean(error && typeof error === 'object' && error.code === 'MAINTENANCE_NOT_CONFIGURED');
}
