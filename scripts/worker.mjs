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
} from '../src/server/jobs/cache-warm.js';

const TZ = { timezone: 'Asia/Dhaka' };

function cronTimestamp() {
	return new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' });
}

async function withLock(name, ttlSeconds, fn) {
	console.log(`[cron:${name}] tick ${cronTimestamp()}`);
	if (!(await ensureRedisReady())) {
		console.warn(`[cron:${name}] redis unavailable, skipping`);
		return;
	}
	const ok = await redis.set(`cron:lock:${name}`, '1', 'EX', ttlSeconds, 'NX');
	if (ok !== 'OK') {
		console.log(`[cron:${name}] skipped (lock held by another run)`);
		return;
	}
	const started = Date.now();
	console.log(`[cron:${name}] start`);
	try {
		await fn();
		console.log(`[cron:${name}] ok ${Date.now() - started}ms`);
	} catch (e) {
		console.error(`[cron:${name}] failed after ${Date.now() - started}ms`, e);
	}
}

cron.schedule(
	'*/2 * * * *',
	() => withLock('home', 90, () => warmDashboardHome()),
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
	'*/5 * * * *',
	() => withLock('revenue-warm', 240, () => warmDefaultRevenueReports()),
	TZ,
);

console.log('[worker] started (Asia/Dhaka)');

console.log('[worker] startup warm begin');
warmAllDefaultCaches()
	.then(() => console.log('[worker] startup warm ok'))
	.catch(err => {
		console.error('[worker] startup warm failed', err);
	});
