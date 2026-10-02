import { NextResponse } from 'next/server';
import PromoController from '../../controllers/promocode-controller';
import { cacheGetEntry, cacheSet } from '../../../../server/cache/index.js';
import {
	daywisePromoCacheKey,
	daywisePromoCacheTtl,
} from '../../../../server/jobs/cache-warm.js';
import { defaultDaywisePromoRange } from '../../../../server/jobs/daywise-promo-query.js';
import { parseYmd } from '../../../../server/utils/dhaka-date.js';

export const dynamic = 'force-dynamic';

const NOT_CACHED_MESSAGE =
	'No daywise promo data in cache yet. The scheduled cache warm runs once per day at 2:00 AM Bangladesh time (Asia/Dhaka).';

export async function GET(req) {
	const offset = Number(req.nextUrl.searchParams.get('offset') ?? 0);
	const limit = Number(req.nextUrl.searchParams.get('limit') ?? 50);
	const refresh = req.nextUrl.searchParams.get('refresh') === '1';
	let startDate = req.nextUrl.searchParams.get('startDate');
	let endDate = req.nextUrl.searchParams.get('endDate');

	const legacy = process.env.DAYWISE_PROMO_LEGACY === '1';

	if (!legacy) {
		if (!startDate || !endDate) {
			({ startDate, endDate } = defaultDaywisePromoRange());
		}
		if (!parseYmd(startDate).isValid() || !parseYmd(endDate).isValid()) {
			return NextResponse.json({ message: 'Invalid startDate or endDate' }, { status: 400 });
		}
		if (startDate > endDate) {
			return NextResponse.json({ message: 'startDate must be on or before endDate' }, { status: 400 });
		}
	}

	try {
		const load = () => PromoController.dateWisePromo(offset, limit, startDate, endDate);

		if (legacy) {
			const data = await load();
			if (data) {
				return NextResponse.json(data);
			}
			return NextResponse.json({ message: 'No data' }, { status: 404 });
		}

		const cacheKey = daywisePromoCacheKey(startDate, endDate, offset, limit);
		const ttl = daywisePromoCacheTtl(endDate);

		if (refresh) {
			const data = await load();
			await cacheSet(cacheKey, data, ttl);
			return NextResponse.json(data);
		}

		const entry = await cacheGetEntry(cacheKey);
		if (entry?.payload) {
			return NextResponse.json(entry.payload, { headers: { 'Cache-Control': 'no-store' } });
		}

		return NextResponse.json(
			{
				code: 'NOT_CACHED',
				message: NOT_CACHED_MESSAGE,
				refreshSchedule: '03:00 Asia/Dhaka',
			},
			{
				status: 503,
				headers: { 'Cache-Control': 'no-store' },
			},
		);
	} catch (error) {
		return NextResponse.json(
			{
				message: error?.message ?? error,
			},
			{
				status: 500,
			},
		);
	}
}
