/**
 * Backfill daily_payment_stats for the last N days (default 90).
 * Usage: node scripts/backfill-daily-payments.js [days]
 */
import './load-env.js';
import moment from 'moment';

const daysBack = Math.max(1, Number(process.argv[2]) || 90);

async function main() {
	const RevenueModel = (await import('../src/app/api/models/revenue-model.js')).default;
	const DailyPaymentStatsModel = (
		await import('../src/app/api/models/daily-payment-stats.model.js')
	).default;

	for (let i = 1; i <= daysBack; i++) {
		const day = moment().subtract(i, 'days').format('YYYY-MM-DD');
		const result = await RevenueModel.getSingleDayTotalPayment(day);
		const total =
			Array.isArray(result) && result[0]?.total != null ? Number(result[0].total) : 0;
		await DailyPaymentStatsModel.upsert(day, total, 0);
		if (i % 10 === 0 || i === daysBack) {
			console.log(`[backfill] ${i}/${daysBack} through ${day}`);
		}
	}

	console.log('[backfill] done');
	process.exit(0);
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
