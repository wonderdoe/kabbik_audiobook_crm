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
import {
	warmAllDefaultCaches,
	warmDashboardHome,
	warmDefaultRevenueReports,
	warmDefaultRentReport,
	warmUserReport,
} from '../src/server/jobs/cache-warm.js';
import { dhakaClock } from '../src/server/utils/dhaka-date.js';

const TZ = { timezone: 'Asia/Dhaka' };
const HEARTBEAT_TTL = 120;

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

/** Skip 00:00 revenue warm; rollup-and-warm at 00:10 repopulates after daily facts. */
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

cron.schedule(
	'*/15 * * * *',
	async () => {
		if (await isStartupWarmInProgress()) {
			console.log('[cron:home] skipped (startup-warm in progress)');
			return;
		}
		return withLock('home', 300, () => warmDashboardHome());
	},
	TZ,
);

cron.schedule(
	'10 0 * * *',
	() =>
		withLock('rollup-and-warm', 600, async () => {
			await buildDailyPaymentRollup();
			await buildDailySubscriptionRollup();
			await warmAllDefaultCaches();
		}),
	TZ,
);

cron.schedule(
	'*/15 * * * *',
	async () => {
		if (shouldSkipMidnightRevenueWarm()) {
			console.log('[cron:revenue-warm] skipped (midnight; rollup-and-warm handles warm)');
			return;
		}
		if (await isStartupWarmInProgress()) {
			console.log('[cron:revenue-warm] skipped (startup-warm in progress)');
			return;
		}
		return withLock('revenue-warm', 300, () => warmDefaultRevenueReports());
	},
	TZ,
);

cron.schedule(
	'*/15 * * * *',
	async () => {
		if (shouldSkipMidnightRevenueWarm()) {
			console.log('[cron:report-warm] skipped (midnight; rollup-and-warm handles warm)');
			return;
		}
		if (await isStartupWarmInProgress()) {
			console.log('[cron:report-warm] skipped (startup-warm in progress)');
			return;
		}
		return withLock('report-warm', 600, async () => {
			await warmUserReport();
			await warmDefaultRentReport();
		});
	},
	TZ,
);

console.log('[worker] started (Asia/Dhaka)');

withLock('startup-warm', 600, () => warmAllDefaultCaches()).catch(err => {
	console.error('[worker] startup warm failed', err);
});

setInterval(() => {
	void touchHeartbeat();
}, 60_000);
