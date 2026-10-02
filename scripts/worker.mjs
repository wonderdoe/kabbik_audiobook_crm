/**

 * Background cron worker — run separately from Next.js (pm2/systemd).

 * Usage: node scripts/worker.mjs

 * PM2: pm2 start scripts/worker.mjs --name crm-worker --cwd /path/to/kabbik_audiobook_crm

 */

import './load-env.mjs';

import cron from 'node-cron';

import { redis, ensureRedisReady } from '../src/server/config/redis.js';

import { buildDailyPaymentRollup } from '../src/server/jobs/dashboard.js';

import { buildDailySubscriptionRollup } from '../src/server/jobs/revenue-daily-facts.js';
import { buildDailyPackageWiseRollup } from '../src/server/jobs/package-wise-daily-facts.js';

import {

	warmDashboardHome,

	warmDefaultRevenueReports,

	warmDefaultRentReport,

	warmDaywisePromoCache,

	warmSecondaryReportCaches,

	warmUserReport,

} from '../src/server/jobs/cache-warm.js';

import { dhakaClock } from '../src/server/utils/dhaka-date.js';



const TZ = { timezone: 'Asia/Dhaka' };

const HEARTBEAT_TTL = 120;

/** Long-running warms (home ~5–15 min); lock must outlive job to prevent overlap. */

const SCHEDULED_WARM_LOCK_TTL = 1800;

const STARTUP_WARM_LOCK_TTL = 1800;

const ROLLUP_LOCK_TTL = 1800;

/** User-report SQL can run 30+ minutes on cold DB. */

const USER_REPORT_DAILY_LOCK_TTL = 3600;



function cronTimestamp() {

	return new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' });

}



function sleep(ms) {

	return new Promise(resolve => setTimeout(resolve, ms));

}



async function touchHeartbeat() {

	if (!(await ensureRedisReady())) return;

	await redis.set('worker:heartbeat', String(Date.now()), 'EX', HEARTBEAT_TTL);

}



async function recordJobOk(name) {

	if (!(await ensureRedisReady())) return;

	await redis.set(`warm:${name}:last_ok`, String(Date.now()), 'EX', 86400);

}



/** Skip 00:00 revenue/report warm; rollup at 00:10 repopulates secondary report caches. */

function shouldSkipMidnightRevenueWarm() {

	const { hour, minute } = dhakaClock();

	return hour === 0 && minute === 0;

}



const STARTUP_WARM_LOCK_KEY = 'cron:lock:startup-warm';



async function isStartupWarmInProgress() {

	if (!(await ensureRedisReady())) return false;

	const exists = await redis.exists(STARTUP_WARM_LOCK_KEY);

	return exists === 1;

}



async function withLock(name, ttlSeconds, fn, { retries = 2 } = {}) {

	console.log(`[cron:${name}] tick ${cronTimestamp()}`);

	await touchHeartbeat();

	if (!(await ensureRedisReady())) {

		console.warn(`[cron:${name}] redis unavailable, skipping`);

		return;

	}

	const lockKey = `cron:lock:${name}`;

	const ok = await redis.set(lockKey, '1', 'EX', ttlSeconds, 'NX');

	if (ok !== 'OK') {

		console.log(`[cron:${name}] skipped (lock held by another run)`);

		return;

	}

	const started = Date.now();

	console.log(`[cron:${name}] start`);

	try {

		let lastErr;

		for (let attempt = 0; attempt <= retries; attempt += 1) {

			try {

				if (attempt > 0) {

					const backoff = 1000 * attempt;

					console.log(`[cron:${name}] retry ${attempt}/${retries} after ${backoff}ms`);

					await sleep(backoff);

				}

				await fn();

				await recordJobOk(name);

				console.log(`[cron:${name}] ok ${Date.now() - started}ms`);

				return;

			} catch (e) {

				lastErr = e;

				console.error(`[cron:${name}] attempt ${attempt} failed`, e);

			}

		}

		console.error(`[cron:${name}] failed after ${Date.now() - started}ms`, lastErr);

	} finally {

		try {

			await redis.del(lockKey);

		} catch {

			/* ignore */

		}

	}

}



/** Home → revenue → rent revenue page (no user-report — daily 03:00 only). */

async function runScheduledWarm() {

	console.log('[cron:scheduled-warm] phase home');

	await warmDashboardHome();

	await recordJobOk('home');



	if (shouldSkipMidnightRevenueWarm()) {

		console.log('[cron:scheduled-warm] midnight tick: home only (rollup at 00:10)');

		return;

	}



	console.log('[cron:scheduled-warm] phase revenue');

	await warmDefaultRevenueReports();

	await recordJobOk('revenue-warm');



	console.log('[cron:scheduled-warm] phase rent-report');

	await warmDefaultRentReport();

}



cron.schedule(

	'*/15 * * * *',

	async () => {

		if (await isStartupWarmInProgress()) {

			console.log('[cron:scheduled-warm] skipped (startup-warm in progress)');

			return;

		}

		return withLock('scheduled-warm', SCHEDULED_WARM_LOCK_TTL, runScheduledWarm);

	},

	TZ,

);



cron.schedule(

	'0 3 * * *',

	() =>

		withLock('user-report-daily', USER_REPORT_DAILY_LOCK_TTL, async () => {

			console.log('[cron:user-report-daily] warmUserReport');

			await warmUserReport();

			await recordJobOk('user-report-daily');

		}),

	TZ,

);



cron.schedule(

	'0 2 * * *',

	() =>

		withLock('daywise-promo-cache-warm', SCHEDULED_WARM_LOCK_TTL, async () => {

			console.log('[cron:daywise-promo-cache-warm] warmDaywisePromoCache');

			await warmDaywisePromoCache();

			await recordJobOk('daywise-promo-cache-warm');

		}),

	TZ,

);



cron.schedule(

	'10 0 * * *',

	() =>

		withLock('rollup-and-warm', ROLLUP_LOCK_TTL, async () => {

			await buildDailyPaymentRollup();

			await buildDailySubscriptionRollup();

			await buildDailyPackageWiseRollup();

			await warmSecondaryReportCaches();

		}),

	TZ,

);



console.log('[worker] started (Asia/Dhaka); daywise promo cache warm at 02:00; user-report at 03:00');



withLock('startup-warm', STARTUP_WARM_LOCK_TTL, async () => {

	await warmSecondaryReportCaches();

	await warmDaywisePromoCache();

}).catch(err => {

	console.error('[worker] startup warm failed', err);

});



setInterval(() => {

	void touchHeartbeat();

}, 60_000);


