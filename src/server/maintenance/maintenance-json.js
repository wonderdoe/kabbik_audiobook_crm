export const SCHEMA_VERSION = 1;

/**
 * Compute whether maintenance is effectively active (client/server shared logic).
 * @param {object} doc - Public JSON or CRM fields with isUnderMaintenance, startsAt, endsAt
 * @param {Date|string|number} now
 */
export function computeEffectiveMaintenance(doc, now) {
	if (!doc?.isUnderMaintenance) return false;
	const t = now instanceof Date ? now.getTime() : new Date(now).getTime();
	if (Number.isNaN(t)) return Boolean(doc.isUnderMaintenance);
	if (doc.startsAt) {
		const start = new Date(doc.startsAt).getTime();
		if (!Number.isNaN(start) && t < start) return false;
	}
	if (doc.endsAt) {
		const end = new Date(doc.endsAt).getTime();
		if (!Number.isNaN(end) && t >= end) return false;
	}
	return true;
}

export function publicDocumentToCrmDto(doc, etag = null) {
	if (!doc) return null;
	const dto = {
		isUnderMaintenance: Boolean(doc.isUnderMaintenance),
		titleEn: doc.title?.en ?? '',
		titleBn: doc.title?.bn ?? '',
		messageEn: doc.message?.en ?? '',
		messageBn: doc.message?.bn ?? '',
		startsAt: doc.startsAt ?? null,
		endsAt: doc.endsAt ?? null,
		updatedBy: doc.updatedBy ?? null,
		updatedAt: doc.updatedAt ?? null,
	};
	if (etag != null) dto.etag = etag;
	return dto;
}

export function crmPayloadToPublicDocument(platform, payload, updatedBy, updatedAtIso) {
	return {
		schemaVersion: SCHEMA_VERSION,
		platform,
		isUnderMaintenance: payload.isUnderMaintenance,
		title: {
			en: payload.titleEn ?? '',
			bn: payload.titleBn ?? '',
		},
		message: {
			en: payload.messageEn ?? '',
			bn: payload.messageBn ?? '',
		},
		startsAt: payload.startsAt ?? null,
		endsAt: payload.endsAt ?? null,
		updatedBy: String(updatedBy).slice(0, 100),
		updatedAt: updatedAtIso,
	};
}

export function parsePublicDocumentJson(text, platform) {
	let parsed;
	try {
		parsed = JSON.parse(text);
	} catch {
		return { error: 'Invalid JSON in storage object' };
	}
	if (parsed.platform && parsed.platform !== platform) {
		return { error: 'Stored platform does not match key' };
	}
	return { document: parsed };
}

export function historyEntryFromDocument(platform, versionId, doc, isLatest) {
	return {
		platform,
		versionId,
		isLatest: Boolean(isLatest),
		isUnderMaintenance: Boolean(doc?.isUnderMaintenance),
		titleEn: doc?.title?.en ?? '',
		titleBn: doc?.title?.bn ?? '',
		messageEn: doc?.message?.en ?? '',
		messageBn: doc?.message?.bn ?? '',
		startsAt: doc?.startsAt ?? null,
		endsAt: doc?.endsAt ?? null,
		changedBy: doc?.updatedBy ?? 'unknown',
		changedAt: doc?.updatedAt ?? null,
	};
}

/** Map S3 history row to legacy log entry shape for UI */
export function toLogEntryShape(entry) {
	return {
		platform: entry.platform,
		versionId: entry.versionId,
		isUnderMaintenance: entry.isUnderMaintenance,
		titleEn: entry.titleEn,
		messageEn: entry.messageEn,
		startsAt: entry.startsAt,
		endsAt: entry.endsAt,
		changedBy: entry.changedBy,
		changedAt: entry.changedAt,
	};
}

export function publicDocumentToAuditPayload(platform, doc) {
	return {
		isUnderMaintenance: Boolean(doc.isUnderMaintenance),
		titleEn: doc.title?.en ?? '',
		titleBn: doc.title?.bn ?? '',
		messageEn: doc.message?.en ?? '',
		messageBn: doc.message?.bn ?? '',
		startsAt: doc.startsAt ?? null,
		endsAt: doc.endsAt ?? null,
		startsAtMysql: isoToMysqlUtc(doc.startsAt),
		endsAtMysql: isoToMysqlUtc(doc.endsAt),
	};
}

function isoToMysqlUtc(iso) {
	if (iso == null) return null;
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return null;
	return d.toISOString().slice(0, 19).replace('T', ' ');
}
