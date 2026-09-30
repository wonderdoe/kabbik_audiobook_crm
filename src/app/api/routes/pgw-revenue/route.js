import { NextResponse } from 'next/server';
import { getOrSetLocked, cacheSet } from '../../../../server/cache/index.js';
import { buildPgwRevenueReport } from '../../../../server/jobs/pgw-revenue.js';
import { hasPermission } from '../../../../server/auth/admin-token.js';
import { REVENUE_CACHE_TTL } from '../../../../server/jobs/cache-warm.js';

export const dynamic = 'force-dynamic';

export async function GET(req) {
	const startDate = req.nextUrl.searchParams.get('startDate');
	const endDate = req.nextUrl.searchParams.get('endDate');
	const refresh = req.nextUrl.searchParams.get('refresh') === '1';

	if (!startDate || !endDate) {
		return NextResponse.json({ message: 'startDate and endDate are required' }, { status: 400 });
	}

	try {
		const cacheKey = `revenue:pgw:v1:${startDate}:${endDate}`;

		if (refresh) {
			if (!hasPermission(req, 'see_payment_gateway_wise_report')) {
				return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
			}
			const payload = await buildPgwRevenueReport(startDate, endDate);
			await cacheSet(cacheKey, payload, REVENUE_CACHE_TTL);
			return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
		}

		const payload = await getOrSetLocked(cacheKey, REVENUE_CACHE_TTL, () =>
			buildPgwRevenueReport(startDate, endDate),
		);
		return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
	} catch (error) {
		console.error('[pgw-revenue GET]', error);
		return NextResponse.json(
			{ message: error?.message || 'Internal server error' },
			{ status: 500 },
		);
	}
}
