import { NextRequest, NextResponse } from 'next/server';
import { cacheGetEntry } from '../../../../server/cache/index.js';
import { userReportSnapshotCacheKey } from '../../../../server/jobs/cache-warm.js';
import { dhakaTodayYmd, parseYmd } from '../../../../server/utils/dhaka-date.js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const dateParam = req.nextUrl.searchParams.get('date');
	const date = dateParam && parseYmd(dateParam).isValid() ? dateParam : dhakaTodayYmd();

	try {
		const key = userReportSnapshotCacheKey(date);
		const entry = await cacheGetEntry(key);
		if (entry?.payload) {
			return NextResponse.json(entry.payload, { headers: { 'Cache-Control': 'no-store' } });
		}
		return NextResponse.json(
			{
				code: 'NOT_CACHED',
				message:
					'No report data in cache yet. It refreshes automatically every day at 3:30 AM Bangladesh time (Asia/Dhaka).',
				refreshSchedule: '03:30 Asia/Dhaka',
			},
			{
				status: 503,
				headers: {
					'Cache-Control': 'no-store',
				},
			},
		);
	} catch (error) {
		console.error('[user-report-snapshot GET]', error);
		return NextResponse.json(
			{ message: error instanceof Error ? error.message : 'Internal server error' },
			{ status: 500 },
		);
	}
}
