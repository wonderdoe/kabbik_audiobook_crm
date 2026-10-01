const EXPORT_MAX_ROWS = 10000;

const TAB_BASE_CONDITIONS = {
	all: null,
	podcasts: 'a.podcast = 1',
	rent: 'a.for_rent = 1',
	pending: 'a.approval_status = 0',
	rejected: 'a.approval_status = 2',
};

const BGM_SELECT = `
  (SELECT COUNT(*) FROM episodes e WHERE e.audiobook_id = a.id AND e.bgm_filepath IS NOT NULL AND e.bgm_filepath != '') AS bgm_episode_count,
  (SELECT COUNT(*) FROM episodes e WHERE e.audiobook_id = a.id) AS total_episode_count
`;

function emptyToNull(value) {
	if (value === null || value === undefined) return null;
	const trimmed = String(value).trim();
	return trimmed === '' ? null : trimmed;
}

function parseOptionalInt(value) {
	const v = emptyToNull(value);
	if (v === null) return null;
	const n = Number(v);
	if (!Number.isFinite(n)) return { error: 'invalid_number' };
	return { value: Math.floor(n) };
}

function parseOptionalFloat(value) {
	const v = emptyToNull(value);
	if (v === null) return null;
	const n = Number(v);
	if (!Number.isFinite(n)) return { error: 'invalid_number' };
	return { value: n };
}

function parseYesNo(value) {
	const v = emptyToNull(value);
	if (v === null) return null;
	if (v === '1' || v === 'yes' || v === 'true') return 1;
	if (v === '0' || v === 'no' || v === 'false') return 0;
	return { error: 'invalid_boolean' };
}

/**
 * @param {URLSearchParams|Record<string, string>} raw
 * @param {{ forExport?: boolean }} options
 */
export function parseAudiobookListParams(raw, options = {}) {
	const params =
		raw instanceof URLSearchParams ? Object.fromEntries(raw.entries()) : { ...raw };

	const tab = emptyToNull(params.tab) || 'all';
	if (!TAB_BASE_CONDITIONS.hasOwnProperty(tab)) {
		return { error: 'invalid_tab' };
	}

	const limitParsed = parseOptionalInt(params.limit);
	if (limitParsed?.error) return { error: 'invalid_limit' };
	const offsetParsed = parseOptionalInt(params.offset);
	if (offsetParsed?.error) return { error: 'invalid_offset' };

	const limit = options.forExport
		? EXPORT_MAX_ROWS
		: limitParsed?.value ?? 10;
	const offset = options.forExport ? 0 : offsetParsed?.value ?? 0;

	if (!options.forExport && (limit < 1 || limit > 100)) {
		return { error: 'invalid_limit' };
	}
	if (!options.forExport && offset < 0) {
		return { error: 'invalid_offset' };
	}

	const premiumParsed = parseYesNo(params.premium);
	if (premiumParsed?.error) return { error: 'invalid_premium' };
	const forRentParsed = parseYesNo(params.for_rent);
	if (forRentParsed?.error) return { error: 'invalid_for_rent' };
	const hasBgmParsed = parseYesNo(params.has_bgm);
	if (hasBgmParsed?.error) return { error: 'invalid_has_bgm' };

	const categoryParsed = parseOptionalInt(params.category);
	if (categoryParsed?.error) return { error: 'invalid_category' };

	const priceMinParsed = parseOptionalFloat(params.price_min);
	if (priceMinParsed?.error) return { error: 'invalid_price_min' };
	const priceMaxParsed = parseOptionalFloat(params.price_max);
	if (priceMaxParsed?.error) return { error: 'invalid_price_max' };

	let priceMin = priceMinParsed?.value ?? null;
	let priceMax = priceMaxParsed?.value ?? null;
	if (priceMin !== null && priceMax !== null && priceMin > priceMax) {
		[priceMin, priceMax] = [priceMax, priceMin];
	}

	const dateFrom = emptyToNull(params.date_from);
	const dateTo = emptyToNull(params.date_to);
	if (dateFrom && dateTo && dateFrom > dateTo) {
		return { error: 'invalid_date_range' };
	}

	const approvalStatusParsed = parseOptionalInt(params.approval_status);
	if (approvalStatusParsed?.error) return { error: 'invalid_approval_status' };
	const approvalStatus = approvalStatusParsed?.value ?? null;
	if (approvalStatus !== null && ![0, 1, 2].includes(approvalStatus)) {
		return { error: 'invalid_approval_status' };
	}

	const filters = {
		tab,
		limit,
		offset,
		categoryId: categoryParsed?.value ?? null,
		premium: premiumParsed?.value ?? premiumParsed ?? null,
		forRent: forRentParsed?.value ?? forRentParsed ?? null,
		hasBgm: hasBgmParsed?.value ?? hasBgmParsed ?? null,
		author: emptyToNull(params.author),
		priceMin,
		priceMax,
		dateFrom,
		dateTo,
		search: emptyToNull(params.search),
		approvalStatus,
	};

	return { filters };
}

export function buildAudiobookWhereClause(filters) {
	const conditions = [];
	const queryParams = [];

	const tabCondition = TAB_BASE_CONDITIONS[filters.tab] || TAB_BASE_CONDITIONS.all;
	if (tabCondition) {
		conditions.push(tabCondition);
	}

	if (filters.categoryId !== null) {
		conditions.push(
			`EXISTS (SELECT 1 FROM categories_audiobooks ca WHERE ca.audiobook_id = a.id AND ca.category_id = ?)`,
		);
		queryParams.push(filters.categoryId);
	}

	if (filters.premium !== null) {
		conditions.push('a.premium = ?');
		queryParams.push(filters.premium);
	}

	if (filters.forRent !== null) {
		conditions.push('a.for_rent = ?');
		queryParams.push(filters.forRent);
	}

	if (filters.approvalStatus !== null && filters.approvalStatus !== undefined) {
		conditions.push('a.approval_status = ?');
		queryParams.push(filters.approvalStatus);
	}

	if (filters.priceMin !== null && filters.priceMax !== null) {
		conditions.push('a.price BETWEEN ? AND ?');
		queryParams.push(filters.priceMin, filters.priceMax);
	} else if (filters.priceMin !== null) {
		conditions.push('a.price >= ?');
		queryParams.push(filters.priceMin);
	} else if (filters.priceMax !== null) {
		conditions.push('a.price <= ?');
		queryParams.push(filters.priceMax);
	}

	if (filters.author) {
		conditions.push('a.author_name LIKE ?');
		queryParams.push(`%${filters.author}%`);
	}

	if (filters.dateFrom && filters.dateTo) {
		conditions.push('DATE(a.created_at) BETWEEN ? AND ?');
		queryParams.push(filters.dateFrom, filters.dateTo);
	} else if (filters.dateFrom) {
		conditions.push('DATE(a.created_at) >= ?');
		queryParams.push(filters.dateFrom);
	} else if (filters.dateTo) {
		conditions.push('DATE(a.created_at) <= ?');
		queryParams.push(filters.dateTo);
	}

	if (filters.hasBgm === 1) {
		conditions.push(
			`EXISTS (SELECT 1 FROM episodes e WHERE e.audiobook_id = a.id AND e.bgm_filepath IS NOT NULL AND e.bgm_filepath != '')`,
		);
	} else if (filters.hasBgm === 0) {
		conditions.push(
			`NOT EXISTS (SELECT 1 FROM episodes e WHERE e.audiobook_id = a.id AND e.bgm_filepath IS NOT NULL AND e.bgm_filepath != '')`,
		);
	}

	if (filters.search) {
		conditions.push(
			`(a.name LIKE ? OR a.en_name LIKE ? OR a.description LIKE ? OR a.author_name LIKE ? OR a.contributing_artists LIKE ?)`,
		);
		const like = `%${filters.search}%`;
		queryParams.push(like, like, like, like, like);
	}

	const whereSql = conditions.length ? conditions.join(' AND ') : '1=1';

	return { whereSql, queryParams };
}

export { BGM_SELECT, EXPORT_MAX_ROWS, TAB_BASE_CONDITIONS };
