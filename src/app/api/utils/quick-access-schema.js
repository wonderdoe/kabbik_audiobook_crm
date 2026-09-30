const VALID_AUDIENCES = ['all', 'free', 'premium'];

const CONTROL_CHAR_RE = /[\x00-\x1F\x7F]/;

function trimString(value) {
	if (value === undefined || value === null) return '';
	return String(value).trim();
}

function parseBoolean(value, defaultValue) {
	if (value === undefined || value === null) return defaultValue;
	if (typeof value === 'boolean') return value;
	if (value === 1 || value === '1' || value === 'true') return true;
	if (value === 0 || value === '0' || value === 'false') return false;
	return defaultValue;
}

function parseSortOrder(value, defaultValue = 0) {
	if (value === undefined || value === null || value === '') return defaultValue;
	const n = Number(value);
	if (!Number.isInteger(n)) return null;
	return n;
}

/**
 * @param {Record<string, unknown>} body
 * @param {{ partial?: boolean }} options
 * @returns {{ ok: true, data: object } | { ok: false, message: string, errors: Record<string, string> }}
 */
export function validateQuickAccessBody(body, options = {}) {
	const { partial = false } = options;
	const errors = {};

	const has = key => body[key] !== undefined;

	if (!partial || has('enName')) {
		const enName = trimString(body.enName);
		if (!enName) errors.enName = 'English name is required';
		else if (enName.length > 100) errors.enName = 'English name must be at most 100 characters';
	}

	if (!partial || has('bnName')) {
		const bnName = trimString(body.bnName);
		if (!bnName) errors.bnName = 'Bangla name is required';
		else if (bnName.length > 100) errors.bnName = 'Bangla name must be at most 100 characters';
	}

	if (!partial || has('gotoPage')) {
		const raw = body.gotoPage;
		if (raw === undefined || raw === null || String(raw).trim() === '') {
			errors.gotoPage = 'Go to page is required';
		} else {
			const gotoPage = String(raw).trim();
			if (!gotoPage.startsWith('/')) {
				errors.gotoPage = 'Go to page must start with /';
			} else if (gotoPage.length > 150) {
				errors.gotoPage = 'Go to page must be at most 150 characters';
			} else if (CONTROL_CHAR_RE.test(gotoPage)) {
				errors.gotoPage = 'Go to page contains invalid characters';
			}
		}
	}

	if (!partial || has('audience')) {
		const audience = body.audience;
		if (!audience) errors.audience = 'Audience is required';
		else if (!VALID_AUDIENCES.includes(audience)) {
			errors.audience = 'Audience must be one of: all, free, premium';
		}
	}

	if (has('sortOrder')) {
		const sortOrder = parseSortOrder(body.sortOrder, 0);
		if (sortOrder === null) errors.sortOrder = 'Sort order must be an integer';
	}

	if (Object.keys(errors).length > 0) {
		return {
			ok: false,
			message: 'Validation failed',
			errors,
		};
	}

	const data = {};
	if (!partial || has('enName')) data.enName = trimString(body.enName);
	if (!partial || has('bnName')) data.bnName = trimString(body.bnName);
	if (!partial || has('gotoPage')) data.gotoPage = String(body.gotoPage).trim();
	if (!partial || has('audience')) data.audience = body.audience;
	if (has('isActive')) data.isActive = parseBoolean(body.isActive, true);
	else if (!partial) data.isActive = parseBoolean(body.isActive, true);
	if (has('sortOrder')) data.sortOrder = parseSortOrder(body.sortOrder, 0);
	else if (!partial) data.sortOrder = parseSortOrder(body.sortOrder, 0);

	return { ok: true, data };
}

export function parseListParams(searchParams) {
	const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
	const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10) || 25));
	const audience = searchParams.get('audience');
	const isActiveRaw = searchParams.get('isActive');
	const search = searchParams.get('search')?.trim() || '';

	let isActive = undefined;
	if (isActiveRaw === 'true' || isActiveRaw === '1') isActive = 1;
	if (isActiveRaw === 'false' || isActiveRaw === '0') isActive = 0;

	return {
		page,
		limit,
		offset: (page - 1) * limit,
		audience: audience && VALID_AUDIENCES.includes(audience) ? audience : undefined,
		isActive,
		search,
	};
}

export { VALID_AUDIENCES };
