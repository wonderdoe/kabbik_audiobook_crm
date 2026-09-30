import { NextResponse } from 'next/server';
import { buildDailyPaymentRollup } from '../../../../server/jobs/dashboard.js';
import { buildDailySubscriptionRollup } from '../../../../server/jobs/revenue-daily-facts.js';
import { warmAllDefaultCaches } from '../../../../server/jobs/cache-warm.js';

export const dynamic = 'force-dynamic';

export async function GET(req) {
	if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
		return new Response('Unauthorized', { status: 401 });
	}
	try {
		const started = Date.now();
		console.log('[cron revenue-reports] start', new Date().toISOString());
		await buildDailyPaymentRollup();
		await buildDailySubscriptionRollup();
		await warmAllDefaultCaches();
		console.log(`[cron revenue-reports] ok ${Date.now() - started}ms`);
		return NextResponse.json({ ok: true });
	} catch (e) {
		console.error('[cron revenue-reports]', e);
		return NextResponse.json({ ok: false, message: String(e) }, { status: 500 });
	}
}
