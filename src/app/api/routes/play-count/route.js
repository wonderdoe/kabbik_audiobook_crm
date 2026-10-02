import { NextResponse } from 'next/server';
import { getOrSetLocked } from '../../../../server/cache/index.js';
import { PLAYCOUNT_TTL, playCountCacheKey } from '../../../../server/jobs/cache-warm.js';
import { buildPlayCountPayload } from '../../../../server/jobs/reports.js';

export const dynamic = 'force-dynamic';

export async function GET() {
	try {
		const data = await getOrSetLocked(playCountCacheKey(), PLAYCOUNT_TTL, () =>
			buildPlayCountPayload(),
		);
		if (data) {
			return NextResponse.json(data);
		}
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
