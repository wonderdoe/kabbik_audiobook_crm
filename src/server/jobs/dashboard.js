import moment from 'moment';
import { dhakaTodayYmd } from '../utils/dhaka-date.js';
import TotalUserModel from '../../app/api/models/total-user-model.js';
import RevenueModel from '../../app/api/models/revenue-model.js';
import PromoModel from '../../app/api/models/promocode-model.js';
import DailyPaymentStatsModel from '../../app/api/models/daily-payment-stats.model.js';
import { cacheGet } from '../cache/index.js';
import { userReportSnapshotCacheKey } from '../jobs/cache-warm.js';

async function paymentTotalForDay(day, anchorDate) {
	const liveForToday = day === anchorDate;
	if (liveForToday) {
		const result = await RevenueModel.getSingleDayTotalPayment(day);
		return Array.isArray(result) && result[0]?.total != null ? Number(result[0].total) : 0;
	}

	const cached = await DailyPaymentStatsModel.getByDate(day);
	if (cached) {
		return Number(cached.total_amount);
	}

	const result = await RevenueModel.getSingleDayTotalPayment(day);
	const total = Array.isArray(result) && result[0]?.total != null ? Number(result[0].total) : 0;
	await DailyPaymentStatsModel.upsert(day, total, 0);
	return total;
}

function promoRowsOrEmpty(label, result) {
	if (Array.isArray(result)) return result;
	console.error(`[buildHomeSnapshot] ${label} promos failed:`, result);
	return [];
}

export async function buildDailyPaymentRollup(statDate) {
	const day =
		statDate || moment().subtract(1, 'day').format('YYYY-MM-DD');
	const result = await RevenueModel.getSingleDayTotalPayment(day);
	const total =
		Array.isArray(result) && result[0]?.total != null ? Number(result[0].total) : 0;
	await DailyPaymentStatsModel.upsert(day, total, 0);
	return { statDate: day, totalAmount: total };
}

/**
 * Extracts top-level scalar totals from a user-report snapshot.
 * Each of userCount / blSubscriber / subscribedUser is an array of
 * { payment_source, is_recurring, count } rows — we just sum them.
 */
function sumReportRows(rows) {
	if (!Array.isArray(rows)) return 0;
	return rows.reduce((acc, r) => acc + Number(r?.count ?? 0), 0);
}

function extractReportSummary(snapshot) {
	if (!snapshot) return null;
	try {
		const userCount = snapshot.userCount?.result ?? snapshot.userCount ?? null;
		const subscribedUser = snapshot.subscribedUser?.result ?? snapshot.subscribedUser ?? null;
		const blSubscriber = snapshot.blSubscriber?.result ?? snapshot.blSubscriber ?? null;
		const rentActive = snapshot.rentActive ?? null;
		const playCount = snapshot.playCount ?? null;
		return {
			lifetimeSubscribers: sumReportRows(userCount),
			activeSubscribers: sumReportRows(subscribedUser),
			blSubscribers: sumReportRows(blSubscriber),
			activeRentCount: Array.isArray(rentActive)
				? rentActive.reduce((a, r) => a + Number(r?.count ?? 0), 0)
				: 0,
			totalPlayCount: Array.isArray(playCount)
				? playCount.reduce((a, r) => a + Number(r?.count ?? 0), 0)
				: 0,
		};
	} catch {
		return null;
	}
}

export async function buildHomeSnapshot(anchorDate) {
	const date = anchorDate || dhakaTodayYmd();
	const yesterday = moment(date, 'YYYY-MM-DD').subtract(1, 'day').format('YYYY-MM-DD');
	const dayStrings = Array.from({ length: 7 }, (_, i) =>
		moment(date, 'YYYY-MM-DD').subtract(i, 'days').format('YYYY-MM-DD'),
	);

	const [dashboardData, topPromosToday, topPromosYesterday, paymentTotals, userReportSnapshot] =
		await Promise.all([
			TotalUserModel.getTotal(date),
			PromoModel.getTopMostUsedPromocodes(date),
			PromoModel.getTopMostUsedPromocodes(yesterday),
			Promise.all(dayStrings.map(day => paymentTotalForDay(day, date))),
			cacheGet(userReportSnapshotCacheKey(date)).catch(() => null),
		]);

	const recentTotalPayments = dayStrings.map((day, index) => ({
		date: moment(day, 'YYYY-MM-DD').format('Do MMM, YYYY'),
		Amount: paymentTotals[index],
	}));

	const payments7d = dayStrings.map((day, index) => ({
		date: day,
		total: paymentTotals[index],
		count: 0,
	}));

	return {
		updatedAt: new Date().toISOString(),
		dashboardData,
		recentTotalPayments,
		payments7d,
		topMostUsedPromos: {
			today: promoRowsOrEmpty('today', topPromosToday),
			yesterday: promoRowsOrEmpty('yesterday', topPromosYesterday),
		},
		reportSummary: extractReportSummary(userReportSnapshot),
	};
}
