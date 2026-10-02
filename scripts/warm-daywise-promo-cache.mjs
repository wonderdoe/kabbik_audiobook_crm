/**
 * Warm default daywise promo page (last 7 Dhaka days, offset 0, limit 50) into Redis.
 * Usage: node scripts/warm-daywise-promo-cache.mjs
 */
import './load-env.mjs';

async function main() {
	const started = Date.now();
	console.log('[warm-daywise-promo-cache] starting…');
	const { warmDaywisePromoCache } = await import('../src/server/jobs/cache-warm.js');
	const result = await warmDaywisePromoCache();
	const { startDate, endDate, payload } = result;
	console.log('[warm-daywise-promo-cache] done', {
		startDate,
		endDate,
		total: payload?.total,
		rows: payload?.data?.length,
		ms: Date.now() - started,
	});
	process.exit(0);
}

main().catch(err => {
	console.error('[warm-daywise-promo-cache] failed', err);
	process.exit(1);
});
