import { NextResponse } from 'next/server';
import { getOrSetLocked } from '../../../../server/cache/index.js';
import { PLAYCOUNT_TTL, playCountReportCacheKey } from '../../../../server/jobs/cache-warm.js';
import { buildPlayCountReport } from '../../../../server/jobs/reports.js';

export const dynamic = 'force-dynamic';

function normalizePlayCountReportRows(data) {
	if (Array.isArray(data)) return data;
	if (data && Array.isArray(data.payload)) return data.payload;
	return [];
}

export async function GET() {
	try {
		const data = await getOrSetLocked(playCountReportCacheKey(), PLAYCOUNT_TTL, () =>
			buildPlayCountReport(),
		);
		return NextResponse.json(normalizePlayCountReportRows(data));
	} catch (error) {
		console.error('[play-count-report GET]', error);
		return NextResponse.json(
			{
				message: error instanceof Error ? error.message : 'Internal server error',
			},
			{ status: 500 },
		);
	}
}
