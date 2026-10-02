import DB from '../../../server/config/db.js';

class DailyPackageRevenueStatsModel {
	getRange = async (startDate, endDate) => {
		return DB.query(
			`SELECT stat_date, package_id, raw_total
       FROM daily_package_revenue_stats
       WHERE stat_date >= ? AND stat_date <= ?
       ORDER BY stat_date`,
			[startDate, endDate],
		);
	};

	hasRowsForDate = async statDate => {
		const rows = await DB.query(
			`SELECT 1 FROM daily_package_revenue_stats WHERE stat_date = ? LIMIT 1`,
			[statDate],
		);
		return rows.length > 0;
	};

	upsertBatch = async rows => {
		if (!rows?.length) return;
		for (const row of rows) {
			await DB.query(
				`INSERT INTO daily_package_revenue_stats (stat_date, package_id, raw_total)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           raw_total = VALUES(raw_total),
           updated_at = CURRENT_TIMESTAMP`,
				[row.stat_date, String(row.package_id), row.raw_total],
			);
		}
	};
}

export default new DailyPackageRevenueStatsModel();
