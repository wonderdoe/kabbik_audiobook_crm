import DB from '../../../server/config/db.js';

class DailySubscriptionRevenueStatsModel {
	getRange = async (segment, startDate, endDate) => {
		return DB.query(
			`SELECT stat_date, segment, payment_method, is_recurring, rent_payment, raw_total
       FROM daily_subscription_revenue_stats
       WHERE segment = ? AND stat_date >= ? AND stat_date <= ?
       ORDER BY stat_date DESC`,
			[segment, startDate, endDate],
		);
	};

	hasRowsForDate = async statDate => {
		const rows = await DB.query(
			`SELECT 1 FROM daily_subscription_revenue_stats WHERE stat_date = ? LIMIT 1`,
			[statDate],
		);
		return rows.length > 0;
	};

	upsertBatch = async rows => {
		if (!rows?.length) return;
		for (const row of rows) {
			await DB.query(
				`INSERT INTO daily_subscription_revenue_stats
          (stat_date, segment, payment_method, is_recurring, rent_payment, raw_total)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           raw_total = VALUES(raw_total),
           updated_at = CURRENT_TIMESTAMP`,
				[
					row.stat_date,
					row.segment,
					row.payment_method,
					row.is_recurring,
					row.rent_payment,
					row.raw_total,
				],
			);
		}
	};
}

export default new DailySubscriptionRevenueStatsModel();
