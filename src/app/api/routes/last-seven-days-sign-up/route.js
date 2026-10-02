import { NextResponse } from 'next/server';
import { getOrSetLocked } from '../../../../server/cache/index.js';
import { SIGNUP_REPORT_TTL, signUpReportCacheKey } from '../../../../server/jobs/cache-warm.js';
import { buildSignUpReport } from '../../../../server/jobs/reports.js';

export const dynamic = 'force-dynamic';

export async function POST() {
	try {
		const data = await getOrSetLocked(signUpReportCacheKey(), SIGNUP_REPORT_TTL, () =>
			buildSignUpReport(),
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
