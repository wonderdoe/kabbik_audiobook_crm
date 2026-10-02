/**
 * Backfill daily_package_revenue_stats + warm default MTD cache.
 * Usage: node scripts/backfill-daily-package-revenue.mjs [daysBack=90]
 */
import './load-env.mjs';
import moment from 'moment';

const daysBack = Math.max(1, Number(process.argv[2]) || 90);

async function main() {
	const { buildDailyPackageWiseFacts } = await import('../src/server/jobs/package-wise-daily-facts.js');
	const { warmDefaultPackageWiseReport } = await import('../src/server/jobs/cache-warm.js');

	for (let i = 1; i <= daysBack; i++) {
		const day = moment().subtract(i, 'days').format('YYYY-MM-DD');
		await buildDailyPackageWiseFacts(day);
		if (i % 10 === 0 || i === daysBack) {
			console.log(`[backfill-package-wise] ${i}/${daysBack} through ${day}`);
		}
	}
	console.log('[backfill-package-wise] done');
	await warmDefaultPackageWiseReport();
	console.log('[backfill-package-wise] redis warm ok');
	process.exit(0);
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
