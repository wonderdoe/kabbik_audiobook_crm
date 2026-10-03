import DB from '../config/db.js';

const PLATFORMS = ['app', 'website'];
const TITLE_MAX = 150;
const MESSAGE_MAX = 500;

function datetimeToIsoUtc(value) {
	if (value == null) return null;
	if (value instanceof Date) return value.toISOString();
	const s = String(value).trim();
	if (!s) return null;
	if (s.includes('T')) {
		const d = new Date(s);
		return Number.isNaN(d.getTime()) ? null : d.toISOString();
	}
	const d = new Date(`${s.replace(' ', 'T')}Z`);
	return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function isoToMysqlUtc(iso) {
	if (iso == null) return null;
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return null;
	return d.toISOString().slice(0, 19).replace('T', ' ');
}

function mapStatusRow(row) {
	if (!row) return null;
	return {
		isUnderMaintenance: Boolean(row.is_under_maintenance),
		titleEn: row.title_en ?? '',
		titleBn: row.title_bn ?? '',
		messageEn: row.message_en ?? '',
		messageBn: row.message_bn ?? '',
		startsAt: datetimeToIsoUtc(row.starts_at),
		endsAt: datetimeToIsoUtc(row.ends_at),
		updatedBy: row.updated_by ?? null,
		updatedAt: datetimeToIsoUtc(row.updated_at),
	};
}

function mapLogRow(row) {
	return {
		platform: row.platform,
		isUnderMaintenance: Boolean(row.is_under_maintenance),
		titleEn: row.title_en ?? '',
		messageEn: row.message_en ?? '',
		startsAt: datetimeToIsoUtc(row.starts_at),
		endsAt: datetimeToIsoUtc(row.ends_at),
		changedBy: row.changed_by,
		changedAt: datetimeToIsoUtc(row.changed_at),
	};
}

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
		startsAtMysql: isoToMysqlUtc(startsAt),
		endsAtMysql: isoToMysqlUtc(endsAt),
	};
}

export async function getMaintenanceStatus() {
	const rows = await DB.query(
		`SELECT platform, is_under_maintenance, title_en, title_bn,
       message_en, message_bn, starts_at, ends_at, updated_by, updated_at
     FROM app_maintenance_status`,
	);
	const result = { app: null, website: null };
	for (const row of rows) {
		const mapped = mapStatusRow(row);
		if (row.platform === 'app') result.app = mapped;
		if (row.platform === 'website') result.website = mapped;
	}
	return result;
}

export async function updateMaintenanceStatus(platform, payload, changedBy) {
	const by = String(changedBy).slice(0, 100);

	return DB.withTransaction(async query => {
		const updateResult = await query(
			`UPDATE app_maintenance_status
       SET is_under_maintenance = ?, title_en = ?, title_bn = ?,
           message_en = ?, message_bn = ?, starts_at = ?, ends_at = ?,
           updated_by = ?
       WHERE platform = ?`,
			[
				payload.isUnderMaintenance ? 1 : 0,
				payload.titleEn || null,
				payload.titleBn || null,
				payload.messageEn || null,
				payload.messageBn || null,
				payload.startsAtMysql,
				payload.endsAtMysql,
				by,
				platform,
			],
		);

		if (!updateResult?.affectedRows) {
			return { notFound: true };
		}

		await query(
			`INSERT INTO app_maintenance_status_log
         (platform, is_under_maintenance, title_en, title_bn, message_en, message_bn,
          starts_at, ends_at, changed_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				platform,
				payload.isUnderMaintenance ? 1 : 0,
				payload.titleEn || null,
				payload.titleBn || null,
				payload.messageEn || null,
				payload.messageBn || null,
				payload.startsAtMysql,
				payload.endsAtMysql,
				by,
			],
		);

		const rows = await query(
			`SELECT platform, is_under_maintenance, title_en, title_bn,
         message_en, message_bn, starts_at, ends_at, updated_by, updated_at
       FROM app_maintenance_status WHERE platform = ?`,
			[platform],
		);
		return { row: mapStatusRow(rows[0]) };
	});
}

export async function getMaintenanceLog({ platform, limit }) {
	const capped = Math.min(Math.max(1, limit), 100);
	const rows = await DB.query(
		`SELECT platform, is_under_maintenance, title_en, message_en,
       starts_at, ends_at, changed_by, changed_at
     FROM app_maintenance_status_log
     WHERE (? IS NULL OR platform = ?)
     ORDER BY changed_at DESC
     LIMIT ?`,
		[platform ?? null, platform ?? null, capped],
	);
	return rows.map(mapLogRow);
}

export function actorLabelFromAdmin(admin) {
	const label = admin.email || admin.name || String(admin.id ?? admin.user_id ?? '');
	return String(label).slice(0, 100);
}
