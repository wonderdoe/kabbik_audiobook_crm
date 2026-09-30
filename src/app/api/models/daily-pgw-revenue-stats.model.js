import DB from '../../../server/config/db.js';

class DailyPgwRevenueStatsModel {
	getRange = async (startDate, endDate) => {
		return DB.query(
			`SELECT stat_date, payment_method, is_recurring, raw_total, new_subscribers, old_subscribers
       FROM daily_pgw_revenue_stats
       WHERE stat_date >= ? AND stat_date <= ?
       ORDER BY stat_date DESC`,
			[startDate, endDate],
		);
	};

	hasRowsForDate = async statDate => {
		const rows = await DB.query(
			`SELECT 1 FROM daily_pgw_revenue_stats WHERE stat_date = ? LIMIT 1`,
			[statDate],
		);
		return rows.length > 0;
	};

	upsertBatch = async rows => {
		if (!rows?.length) return;
		for (const row of rows) {
			await DB.query(
				`INSERT INTO daily_pgw_revenue_stats
          (stat_date, payment_method, is_recurring, raw_total, new_subscribers, old_subscribers)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           raw_total = VALUES(raw_total),
           new_subscribers = VALUES(new_subscribers),
           old_subscribers = VALUES(old_subscribers),
           updated_at = CURRENT_TIMESTAMP`,
				[
					row.stat_date,
					row.payment_method,
					row.is_recurring,
					row.raw_total,
					row.new_subscribers,
					row.old_subscribers,
				],
			);
		}
	};
}

export default new DailyPgwRevenueStatsModel();
