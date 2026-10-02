import { NextRequest, NextResponse } from 'next/server';
import { CacheStampedeError, cacheSet, getOrSetLocked } from '../../../../server/cache/index.js';
import {
	packageWiseCacheKey,
	packageWiseCacheTtl,
} from '../../../../server/jobs/cache-warm.js';
import { buildPackageWiseReport } from '../../../../server/jobs/package-wise-report.js';
import { parseYmd } from '../../../../server/utils/dhaka-date.js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const startDate = req.nextUrl.searchParams.get('startDate');
	const endDate = req.nextUrl.searchParams.get('endDate');
	const refresh = req.nextUrl.searchParams.get('refresh') === '1';

	if (!startDate || !endDate) {
		return NextResponse.json({ message: 'startDate and endDate are required' }, { status: 400 });
	}
	if (!parseYmd(startDate).isValid() || !parseYmd(endDate).isValid()) {
		return NextResponse.json({ message: 'Invalid startDate or endDate' }, { status: 400 });
	}

	try {
		const ttl = packageWiseCacheTtl(endDate);
		const cacheKey = packageWiseCacheKey(startDate, endDate);

		if (refresh) {
			const data = await buildPackageWiseReport(startDate, endDate);
			await cacheSet(cacheKey, data, ttl);
			return NextResponse.json(data);
		}

		const data = await getOrSetLocked(cacheKey, ttl, () =>
			buildPackageWiseReport(startDate, endDate),
		);
		return NextResponse.json(data);
	} catch (err) {
		if (err instanceof CacheStampedeError) {
			return NextResponse.json(
				{ message: 'Report is being prepared; retry shortly' },
				{
					status: 503,
					headers: { 'Retry-After': '30', 'Cache-Control': 'no-store' },
				},
			);
		}
		console.error(err);
		return NextResponse.json(
			{ message: err instanceof Error ? err.message : 'Internal server error' },
			{ status: 500 },
		);
	}
}
