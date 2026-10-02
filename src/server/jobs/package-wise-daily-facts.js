import moment from 'moment';
import DailyPackageRevenueStatsModel from '../../app/api/models/daily-package-revenue-stats.model.js';
import { enumerateDays } from './revenue-daily-facts.js';
import { queryPackageWiseDay } from './package-wise-day-query.js';

export async function buildDailyPackageWiseFacts(statDate) {
	const day = statDate;
	const rows = await queryPackageWiseDay(day);
	const factRows = rows.map(r => ({
		stat_date: day,
		package_id: r.package_id,
		raw_total: r.raw_total,
	}));
	await DailyPackageRevenueStatsModel.upsertBatch(factRows);
	return factRows;
}

export async function buildDailyPackageWiseRollup(statDate) {
	const day = statDate || moment().subtract(1, 'day').format('YYYY-MM-DD');
	await buildDailyPackageWiseFacts(day);
	return { statDate: day };
}

export async function ensurePackageWiseFactsForRange(startDate, endDate, today) {
	const days = enumerateDays(startDate, endDate);
	for (const day of days) {
		if (day === today) continue;
		const has = await DailyPackageRevenueStatsModel.hasRowsForDate(day);
		if (!has) {
			await buildDailyPackageWiseFacts(day);
		}
	}
}
