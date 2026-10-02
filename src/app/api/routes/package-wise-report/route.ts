import { NextRequest, NextResponse } from 'next/server';
import { getOrSetLocked } from '../../../../server/cache/index.js';
import {
	packageWiseCacheKey,
	packageWiseCacheTtl,
} from '../../../../server/jobs/cache-warm.js';
import { buildPackageWiseReport } from '../../../../server/jobs/reports.js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const startDate = req.nextUrl.searchParams.get('startDate');
	const endDate = req.nextUrl.searchParams.get('endDate');
	if (!startDate || !endDate) {
		return NextResponse.json({ message: 'startDate and endDate are required' }, { status: 400 });
	}
	try {
		const ttl = packageWiseCacheTtl(endDate);
		const data = await getOrSetLocked(packageWiseCacheKey(startDate, endDate), ttl, () =>
			buildPackageWiseReport(startDate, endDate),
		);
		return NextResponse.json(data);
	} catch (err) {
		console.error(err);
		return NextResponse.json({ message: err }, { status: 500 });
	}
}
