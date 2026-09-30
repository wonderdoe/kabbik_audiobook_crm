import { z } from 'zod';

const optionalString = z
	.string()
	.optional()
	.transform(v => (v === '' || v === undefined ? undefined : v));

function buildListParamsSchema(maxPageSize) {
	return z.object({
		page: z.coerce.number().int().min(1).default(1),
		pageSize: z.coerce.number().int().min(1).max(maxPageSize).default(25),
		search: optionalString,
		claimStatus: optionalString,
		tierId: optionalString,
		isUsed: optionalString,
		dateFrom: optionalString,
		dateTo: optionalString,
		sort: z
			.enum(['created_at', 'updated_at', 'expire_at', 'usage_point'])
			.default('created_at'),
		order: z.enum(['asc', 'desc']).default('desc'),
		type: optionalString,
	});
}

function parseDateBound(value, endOfDay) {
	if (!value) return undefined;
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return undefined;
	if (endOfDay) {
		d.setUTCDate(d.getUTCDate() + 1);
	}
	return d.toISOString().slice(0, 19).replace('T', ' ');
}

export function parseRewardsListParams(searchParams, options = {}) {
	const maxPageSize = options.maxPageSize ?? 100;
	const listParamsSchema = buildListParamsSchema(maxPageSize);
	const raw = Object.fromEntries(searchParams.entries());
	const parsed = listParamsSchema.safeParse(raw);
	if (!parsed.success) {
		return { error: parsed.error.flatten() };
	}
	const p = parsed.data;
	return {
		params: {
			page: p.page,
			pageSize: p.pageSize,
			search: p.search,
			claimStatus: p.claimStatus,
			tierId: p.tierId,
			isUsed: p.isUsed,
			dateFrom: parseDateBound(p.dateFrom, false),
			dateTo: parseDateBound(p.dateTo, true),
			sort: p.sort,
			order: p.order,
			type: p.type,
		},
	};
}

export function parseRewardsIdParam(id) {
	const n = Number(id);
	if (!Number.isInteger(n) || n < 1) return { error: 'Invalid id' };
	return { id: n };
}

const claimStatusBodySchema = z.object({
	claimStatus: z.enum(['PENDING', 'CLAIMED', 'CANCELLED']),
});

export function parseClaimStatusBody(body) {
	const parsed = claimStatusBodySchema.safeParse(body);
	if (!parsed.success) {
		return { error: parsed.error.flatten() };
	}
	return { claimStatus: parsed.data.claimStatus };
}
