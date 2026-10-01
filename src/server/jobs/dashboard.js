import moment from 'moment';
import { dhakaTodayYmd } from '../utils/dhaka-date.js';
import TotalUserModel from '../../app/api/models/total-user-model.js';
import RevenueModel from '../../app/api/models/revenue-model.js';
import PromoModel from '../../app/api/models/promocode-model.js';
import DailyPaymentStatsModel from '../../app/api/models/daily-payment-stats.model.js';

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

export async function buildHomeSnapshot(anchorDate) {
	const date = anchorDate || dhakaTodayYmd();
	const yesterday = moment(date, 'YYYY-MM-DD').subtract(1, 'day').format('YYYY-MM-DD');
	const dayStrings = Array.from({ length: 7 }, (_, i) =>
		moment(date, 'YYYY-MM-DD').subtract(i, 'days').format('YYYY-MM-DD'),
	);

	const [dashboardData, topPromosToday, topPromosYesterday, paymentTotals] = await Promise.all([
		TotalUserModel.getTotal(date),
		PromoModel.getTopMostUsedPromocodes(date),
		PromoModel.getTopMostUsedPromocodes(yesterday),
		Promise.all(dayStrings.map(day => paymentTotalForDay(day, date))),
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
	};
}
