import DB from '../config/db.js';
import moment from 'moment';
import RevenueModel from '../../app/api/models/revenue-model.js';
import DailyPackageRevenueStatsModel from '../../app/api/models/daily-package-revenue-stats.model.js';
import { validateReportRange, todayDhaka } from './revenue-daily-facts.js';
import {
	buildDailyPackageWiseFacts,
	ensurePackageWiseFactsForRange,
} from './package-wise-daily-facts.js';
import { queryPackageWiseDay } from './package-wise-day-query.js';

function useLegacyPackageWise() {
	return process.env.PACKAGE_WISE_LEGACY === '1';
}

async function attachPackageNames(totalsByPackageId) {
	const entries = Object.entries(totalsByPackageId)
		.filter(([, total]) => total > 0)
		.map(([package_id, total]) => ({ package_id, total }));

	if (!entries.length) {
		return { list: [], total: 0 };
	}

	const placeholders = entries.map(() => '?').join(', ');
	const ids = entries.map(e => e.package_id);
	const packages = await DB.query(
		`SELECT subscriptionItemId, name, priority
     FROM subscription_packages
     WHERE subscriptionItemId IN (${placeholders})`,
		ids,
	);

	const totalMap = new Map(entries.map(e => [String(e.package_id), e.total]));
	const list = packages
		.map(sp => ({
			name: sp.name,
			total: totalMap.get(String(sp.subscriptionItemId)) ?? 0,
			priority: sp.priority,
		}))
		.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

	const total = list.reduce((acc, row) => acc + Number(row.total), 0);
	return { list, total };
}

export async function assemblePackageWiseReport(startDate, endDate) {
	validateReportRange(startDate, endDate);
	const today = todayDhaka();
	await ensurePackageWiseFactsForRange(startDate, endDate, today);

	const facts = await DailyPackageRevenueStatsModel.getRange(startDate, endDate);
	const totalsByPackageId = {};

	for (const row of facts) {
		const date = moment(row.stat_date).format('YYYY-MM-DD');
		if (date === today) continue;
		const pid = String(row.package_id);
		totalsByPackageId[pid] = (totalsByPackageId[pid] || 0) + Number(row.raw_total);
	}

	if (moment(today).isBetween(startDate, endDate, 'day', '[]')) {
		const liveRows = await queryPackageWiseDay(today);
		for (const row of liveRows) {
			const pid = String(row.package_id);
			totalsByPackageId[pid] = (totalsByPackageId[pid] || 0) + row.raw_total;
		}
	}

	const { list, total } = await attachPackageNames(totalsByPackageId);
	return {
		list,
		total,
		updatedAt: new Date().toISOString(),
		startDate,
		endDate,
	};
}

export async function buildPackageWiseReport(startDate, endDate) {
	if (useLegacyPackageWise()) {
		return RevenueModel.getPackageWiseRevenue(startDate, endDate);
	}
	return assemblePackageWiseReport(startDate, endDate);
}

export { buildDailyPackageWiseFacts };
