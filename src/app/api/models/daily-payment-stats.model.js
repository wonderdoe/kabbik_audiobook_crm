import DB from '../../../server/config/db.js';

class DailyPaymentStatsModel {
	getByDate = async statDate => {
		const rows = await DB.query(
			`SELECT stat_date, total_amount, payment_count, updated_at
       FROM daily_payment_stats WHERE stat_date = ? LIMIT 1`,
			[statDate],
		);
		return rows[0] ?? null;
	};

	getByDateRange = async (startDate, endDate) => {
		return DB.query(
			`SELECT stat_date, total_amount, payment_count
       FROM daily_payment_stats
       WHERE stat_date >= ? AND stat_date <= ?
       ORDER BY stat_date DESC`,
			[startDate, endDate],
		);
	};

	upsert = async (statDate, totalAmount, paymentCount = 0) => {
		await DB.query(
			`INSERT INTO daily_payment_stats (stat_date, total_amount, payment_count)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         total_amount = VALUES(total_amount),
         payment_count = VALUES(payment_count),
         updated_at = CURRENT_TIMESTAMP`,
			[statDate, totalAmount, paymentCount],
		);
	};
}

export default new DailyPaymentStatsModel();
