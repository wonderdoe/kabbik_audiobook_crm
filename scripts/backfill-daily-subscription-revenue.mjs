/**
 * Backfill daily_subscription_revenue_stats (+ pgw facts via shared builder).
 * Usage: node scripts/backfill-daily-subscription-revenue.mjs [daysBack=90]
 */
import './load-env.mjs';
import moment from 'moment';

const daysBack = Math.max(1, Number(process.argv[2]) || 90);

async function main() {
	const { buildDailyRevenueFacts } = await import('../src/server/jobs/revenue-daily-facts.js');
	const { warmDefaultRevenueReports } = await import('../src/server/jobs/cache-warm.js');

	for (let i = 1; i <= daysBack; i++) {
		const day = moment().subtract(i, 'days').format('YYYY-MM-DD');
		await buildDailyRevenueFacts(day);
		if (i % 10 === 0 || i === daysBack) {
			console.log(`[backfill-subscription] ${i}/${daysBack} through ${day}`);
		}
	}
	console.log('[backfill-subscription] done');
	await warmDefaultRevenueReports();
	console.log('[backfill-subscription] redis warm ok');
	process.exit(0);
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
