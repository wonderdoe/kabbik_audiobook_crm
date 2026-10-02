import { NextResponse } from 'next/server';
import { getOrSetLocked } from '../../../../server/cache/index.js';
import { PLAYCOUNT_TTL, playCountReportCacheKey } from '../../../../server/jobs/cache-warm.js';
import { buildPlayCountReport } from '../../../../server/jobs/reports.js';

export const dynamic = 'force-dynamic';

export async function GET() {
	try {
		const data = await getOrSetLocked(playCountReportCacheKey(), PLAYCOUNT_TTL, () =>
			buildPlayCountReport(),
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
