import { NextRequest, NextResponse } from 'next/server';
import { getOrSetLocked } from '../../../../server/cache/index.js';
import { USER_REPORT_TTL, rentCountCacheKey } from '../../../../server/jobs/cache-warm.js';
import { buildRentCountPayload } from '../../../../server/jobs/reports.js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const date = req.nextUrl.searchParams.get('date');
	const isActive = req.nextUrl.searchParams.get('isActive');
	const isUnique = req.nextUrl.searchParams.get('isUnique');
	try {
		const data = await getOrSetLocked(
			rentCountCacheKey(date, isActive, isUnique),
			USER_REPORT_TTL,
			() => buildRentCountPayload({ isActive, isUnique }),
		);
		return NextResponse.json(data);
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
