import { NextRequest, NextResponse } from 'next/server';
import { CacheStampedeError, getOrSetLocked } from '../../../../server/cache/index.js';
import {
	USER_REPORT_TTL,
	userReportSnapshotCacheKey,
} from '../../../../server/jobs/cache-warm.js';
import { buildUserReportSnapshot } from '../../../../server/jobs/reports.js';
import { dhakaTodayYmd, parseYmd } from '../../../../server/utils/dhaka-date.js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const dateParam = req.nextUrl.searchParams.get('date');
	const date = dateParam && parseYmd(dateParam).isValid() ? dateParam : dhakaTodayYmd();

	try {
		const payload = await getOrSetLocked(
			userReportSnapshotCacheKey(date),
			USER_REPORT_TTL,
			() => buildUserReportSnapshot(date),
		);
		return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
	} catch (error) {
		if (error instanceof CacheStampedeError) {
			return NextResponse.json(
				{ message: 'Report is being prepared; retry shortly' },
				{
					status: 503,
					headers: {
						'Cache-Control': 'no-store',
						'Retry-After': '10',
					},
				},
			);
		}
		console.error('[user-report-snapshot GET]', error);
		return NextResponse.json(
			{ message: error instanceof Error ? error.message : 'Internal server error' },
			{ status: 500 },
		);
	}
}
