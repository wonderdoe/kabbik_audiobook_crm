import { NextResponse } from 'next/server';
import { getOrSetLocked } from '../../../../server/cache/index.js';
import {
	rentRevenueCacheKey,
	reportRangeCacheTtl,
} from '../../../../server/jobs/cache-warm.js';
import { buildRentRevenueReport } from '../../../../server/jobs/rent-revenue.js';
import { parseYmd } from '../../../../server/utils/dhaka-date.js';

export const dynamic = 'force-dynamic';

function parsePositiveInt(value, name) {
	const n = Number(value);
	if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
		return { error: `${name} must be a non-negative integer` };
	}
	return { value: n };
}

export async function GET(req) {
	const startDate = req.nextUrl.searchParams.get('startDate');
	const endDate = req.nextUrl.searchParams.get('endDate');
	const day = req.nextUrl.searchParams.get('day');
	const limitRaw = req.nextUrl.searchParams.get('limit');
	const offsetRaw = req.nextUrl.searchParams.get('offset');

	if (!startDate || !endDate || limitRaw == null || offsetRaw == null) {
		return NextResponse.json(
			{ message: 'startDate, endDate, limit, and offset are required' },
			{ status: 400 },
		);
	}
	if (!parseYmd(startDate).isValid() || !parseYmd(endDate).isValid()) {
		return NextResponse.json({ message: 'Invalid startDate or endDate' }, { status: 400 });
	}

	const limitParsed = parsePositiveInt(limitRaw, 'limit');
	if (limitParsed.error) {
		return NextResponse.json({ message: limitParsed.error }, { status: 400 });
	}
	const offsetParsed = parsePositiveInt(offsetRaw, 'offset');
	if (offsetParsed.error) {
		return NextResponse.json({ message: offsetParsed.error }, { status: 400 });
	}

	const limit = limitParsed.value;
	const offset = offsetParsed.value;

	try {
		const cacheKey = rentRevenueCacheKey(startDate, endDate, limit, offset);
		const ttl = reportRangeCacheTtl(endDate);
		const data = await getOrSetLocked(cacheKey, ttl, () =>
			buildRentRevenueReport(startDate, endDate, limit, offset, day),
		);
		return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
	} catch (error) {
		return NextResponse.json(
			{
				message: error,
			},
			{
				status: 500,
			},
		);
	}
}
