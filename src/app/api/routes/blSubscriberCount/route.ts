import { NextRequest, NextResponse } from 'next/server';
import { getOrSetLocked } from '../../../../server/cache/index.js';
import {
	USER_REPORT_TTL,
	blSubscriberCacheKey,
} from '../../../../server/jobs/cache-warm.js';
import { buildBlSubscriberCountPayload } from '../../../../server/jobs/reports.js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const date = req.nextUrl.searchParams.get('date');
	try {
		const data = await getOrSetLocked(blSubscriberCacheKey(date), USER_REPORT_TTL, () =>
			buildBlSubscriberCountPayload(date),
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
