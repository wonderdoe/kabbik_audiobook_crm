import { NextResponse } from 'next/server';
import { ensureRedisReady, redis } from '../../../../server/config/redis.js';
import {
	DEFAULT_RENT_REPORT_LIMIT,
	dashHomeCacheKey,
	defaultRentReportRange,
	playCountReportCacheKey,
	rentRevenueCacheKey,
	signUpReportCacheKey,
	userReportSnapshotCacheKey,
} from '../../../../server/jobs/cache-warm.js';
import { dhakaTodayYmd } from '../../../../server/utils/dhaka-date.js';

export const dynamic = 'force-dynamic';

async function readTs(key) {
	const v = await redis.get(key);
	return v ? Number(v) : null;
}

export async function GET() {
	try {
		if (!(await ensureRedisReady())) {
			return NextResponse.json(
				{ ok: false, redis: 'unavailable' },
				{ status: 503 },
			);
		}

		const today = dhakaTodayYmd();
		const { startDate: rentStart, endDate: rentEnd } = defaultRentReportRange();
		const defaultRentRevenueKey = rentRevenueCacheKey(
			rentStart,
			rentEnd,
			DEFAULT_RENT_REPORT_LIMIT,
			0,
		);
		const [
			heartbeat,
			homeOk,
			revenueOk,
			reportWarmOk,
			dashTtl,
			signupTtl,
			playReportTtl,
			userReportSnapshotTtl,
			rentRevenueDefaultPageTtl,
			redisStatus,
		] = await Promise.all([
			readTs('worker:heartbeat'),
			readTs('warm:home:last_ok'),
			readTs('warm:revenue-warm:last_ok'),
			readTs('warm:report-warm:last_ok'),
			redis.ttl(dashHomeCacheKey()),
			redis.ttl(signUpReportCacheKey()),
			redis.ttl(playCountReportCacheKey()),
			redis.ttl(userReportSnapshotCacheKey(today)),
			redis.ttl(defaultRentRevenueKey),
			Promise.resolve(redis.status),
		]);

		const now = Date.now();
		const heartbeatAgeMs = heartbeat ? now - heartbeat : null;
		const workerAlive = heartbeatAgeMs !== null && heartbeatAgeMs < 180_000;

		return NextResponse.json({
			ok: workerAlive,
			redis: redisStatus,
			worker: {
				heartbeat,
				heartbeatAgeMs,
				alive: workerAlive,
			},
			warm: {
				homeLastOk: homeOk,
				revenueLastOk: revenueOk,
				reportWarmLastOk: reportWarmOk,
			},
			keys: {
				dashHomeTtlSeconds: dashTtl,
				signUpReportTtlSeconds: signupTtl,
				playCountReportTtlSeconds: playReportTtl,
				userReportSnapshotTtlSeconds: userReportSnapshotTtl,
				rentRevenueDefaultPageTtlSeconds: rentRevenueDefaultPageTtl,
				rentRevenueDefaultPageKey: defaultRentRevenueKey,
			},
			env: {
				redisEnv: process.env.REDIS_ENV === 'production' ? 'production' : 'staging',
				cacheEnabled: process.env.CACHE_ENABLED !== 'false',
			},
		});
	} catch (error) {
		console.error('[cache-health GET]', error);
		return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 });
	}
}
