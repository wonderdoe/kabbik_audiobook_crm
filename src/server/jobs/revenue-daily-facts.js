import moment from 'moment';
import DB from '../config/db.js';
import DailySubscriptionRevenueStatsModel from '../../app/api/models/daily-subscription-revenue-stats.model.js';
import DailyPgwRevenueStatsModel from '../../app/api/models/daily-pgw-revenue-stats.model.js';

function calculatePercentage(value, percentage) {
	const numericValue = typeof value === 'string' ? parseFloat(value) : value;
	if (Number.isNaN(numericValue) || Number.isNaN(percentage)) return 0;
	return Math.round((numericValue * percentage) / 100);
}

export const MAX_REPORT_RANGE_DAYS = 366;

export function validateReportRange(startDate, endDate) {
	if (!startDate || !endDate) {
		throw new Error('startDate and endDate are required');
	}
	const start = moment(startDate, 'YYYY-MM-DD', true);
	const end = moment(endDate, 'YYYY-MM-DD', true);
	if (!start.isValid() || !end.isValid()) {
		throw new Error('Invalid date format');
	}
	if (start.isAfter(end)) {
		throw new Error('startDate must be on or before endDate');
	}
	const days = end.diff(start, 'days') + 1;
	if (days > MAX_REPORT_RANGE_DAYS) {
		throw new Error(`Date range cannot exceed ${MAX_REPORT_RANGE_DAYS} days`);
	}
}

export function enumerateDays(startDate, endDate) {
	const days = [];
	const cursor = moment(startDate, 'YYYY-MM-DD');
	const end = moment(endDate, 'YYYY-MM-DD');
	while (!cursor.isAfter(end)) {
		days.push(cursor.format('YYYY-MM-DD'));
		cursor.add(1, 'day');
	}
	return days;
}

export function todayDhaka() {
	return moment().format('YYYY-MM-DD');
}

async function queryKabbikLogDay(day) {
	return DB.query(
		`SELECT ROUND(SUM(spl.amount)) AS total, spl.payment_method AS payment_type,
        spl.rent_payment, spl.is_recurring
       FROM user_subscription_payment_log AS spl
       WHERE payment_status = 'SUCCEEDED_PAYMENT' AND spl.isCancelled = 0
         AND DATE(CONVERT_TZ(spl.created_at, 'UTC', '+06:00')) = ?
       GROUP BY spl.payment_method, spl.is_recurring, spl.rent_payment`,
		[day],
	);
}

async function queryMyblLogDay(day) {
	return DB.query(
		`SELECT ROUND(SUM(spl.amount)) AS total, spl.payment_method AS payment_type,
        spl.rent_payment, spl.is_recurring
       FROM user_subscription_payment_log AS spl
       WHERE payment_status = 'SUCCEEDED_PAYMENT' AND from_banglalink = 1
         AND DATE(CONVERT_TZ(spl.created_at, 'UTC', '+06:00')) = ?
       GROUP BY spl.payment_method, spl.is_recurring, spl.rent_payment`,
		[day],
	);
}

async function queryCourseDay(day) {
	return DB.query(
		`SELECT SUM(amount) AS total, LOWER(payment_method) AS payment_type
       FROM store_log
       WHERE DATE(CONVERT_TZ(created_at, 'UTC', '+06:00')) = ?
         AND purchase_type = 'course' AND is_succeed
       GROUP BY payment_type`,
		[day],
	);
}

async function queryPgwDay(day) {
	return DB.query(
		`SELECT ROUND(SUM(spl.amount)) AS total_amount, spl.is_recurring, spl.payment_method,
        SUM(CASE WHEN spl.is_first_payment = 1 AND spl.rent_payment = 0 THEN 1 ELSE 0 END) AS new_subscribers,
        SUM(CASE WHEN spl.is_first_payment = 0 AND spl.rent_payment = 0 THEN 1 ELSE 0 END) AS old_subscribers
       FROM user_subscription_payment_log AS spl
       WHERE payment_status = 'SUCCEEDED_PAYMENT' AND spl.isCancelled = 0
         AND DATE(CONVERT_TZ(spl.created_at, 'UTC', '+06:00')) = ?
       GROUP BY spl.payment_method, spl.is_recurring`,
		[day],
	);
}

export async function buildDailyRevenueFacts(statDate) {
	const day = statDate;
	const [kabbikRows, myblRows, courseRows, pgwRows] = await Promise.all([
		queryKabbikLogDay(day),
		queryMyblLogDay(day),
		queryCourseDay(day),
		queryPgwDay(day),
	]);

	const subscriptionRows = [];
	for (const row of kabbikRows) {
		subscriptionRows.push({
			stat_date: day,
			segment: 'kabbik',
			payment_method: String(row.payment_type ?? ''),
			is_recurring: row.is_recurring ? 1 : 0,
			rent_payment: Number(row.rent_payment) || 0,
			raw_total: Number(row.total) || 0,
		});
	}
	for (const row of myblRows) {
		subscriptionRows.push({
			stat_date: day,
			segment: 'mybl',
			payment_method: String(row.payment_type ?? ''),
			is_recurring: row.is_recurring ? 1 : 0,
			rent_payment: Number(row.rent_payment) || 0,
			raw_total: Number(row.total) || 0,
		});
	}
	for (const row of courseRows) {
		subscriptionRows.push({
			stat_date: day,
			segment: 'course',
			payment_method: String(row.payment_type ?? ''),
			is_recurring: 0,
			rent_payment: 0,
			raw_total: Number(row.total) || 0,
		});
	}

	const pgwFactRows = pgwRows.map(row => ({
		stat_date: day,
		payment_method: String(row.payment_method ?? ''),
		is_recurring: row.is_recurring ? 1 : 0,
		raw_total: Number(row.total_amount) || 0,
		new_subscribers: Number(row.new_subscribers) || 0,
		old_subscribers: Number(row.old_subscribers) || 0,
	}));

	await Promise.all([
		DailySubscriptionRevenueStatsModel.upsertBatch(subscriptionRows),
		DailyPgwRevenueStatsModel.upsertBatch(pgwFactRows),
	]);

	return { subscriptionRows, pgwFactRows };
}

export async function ensureFactsForRange(startDate, endDate) {
	const today = todayDhaka();
	const days = enumerateDays(startDate, endDate);
	for (const day of days) {
		if (day === today) continue;
		const [hasSub, hasPgw] = await Promise.all([
			DailySubscriptionRevenueStatsModel.hasRowsForDate(day),
			DailyPgwRevenueStatsModel.hasRowsForDate(day),
		]);
		if (!hasSub || !hasPgw) {
			await buildDailyRevenueFacts(day);
		}
	}
}

function subscriptionKey(row) {
	return `${row.payment_method}-${row.is_recurring ? 'recurring' : 'onetime'}${row.rent_payment}`;
}

function applyKabbikAmount(paymentMethod, rawTotal) {
	const method = paymentMethod?.toLowerCase?.() ?? '';
	if (method === 'bl') return calculatePercentage(rawTotal, 50);
	if (method === 'robi') return calculatePercentage(rawTotal, 49);
	if (method === 'gp') return calculatePercentage(rawTotal, 70);
	return rawTotal;
}

export async function assembleSubscriptionRevenueReport(startDate, endDate) {
	validateReportRange(startDate, endDate);
	await ensureFactsForRange(startDate, endDate);

	const today = todayDhaka();
	const [kabbikFacts, myblFacts, courseFacts] = await Promise.all([
		DailySubscriptionRevenueStatsModel.getRange('kabbik', startDate, endDate),
		DailySubscriptionRevenueStatsModel.getRange('mybl', startDate, endDate),
		DailySubscriptionRevenueStatsModel.getRange('course', startDate, endDate),
	]);

	let allFacts = [...kabbikFacts, ...myblFacts, ...courseFacts];

	if (moment(today).isBetween(startDate, endDate, 'day', '[]')) {
		const live = await buildDailyRevenueFacts(today);
		allFacts = allFacts.filter(r => r.stat_date !== today);
		allFacts = allFacts.concat(live.subscriptionRows);
	}

	const myblRevenue = {};
	const kabbikRevenue = {};
	const courseRevenue = {};

	for (const row of allFacts) {
		const date = moment(row.stat_date).format('YYYY-MM-DD');
		if (row.segment === 'mybl') {
			if (!(date in myblRevenue)) myblRevenue[date] = {};
			myblRevenue[date][subscriptionKey(row)] = Number(row.raw_total);
		} else if (row.segment === 'kabbik') {
			if (!(date in kabbikRevenue)) kabbikRevenue[date] = {};
			kabbikRevenue[date][subscriptionKey(row)] = applyKabbikAmount(
				row.payment_method,
				Number(row.raw_total),
			);
		} else if (row.segment === 'course') {
			if (!(date in courseRevenue)) courseRevenue[date] = {};
			courseRevenue[date][row.payment_method] = Number(row.raw_total);
		}
	}

	return { mybl: myblRevenue, kabbik: kabbikRevenue, course: courseRevenue };
}

export function mapPgwPaymentRow(item) {
	if (item?.payment_source === 'Bkash') {
		return {
			...item,
			image: 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713779372202.png',
			payment_source: item.is_recurring ? 'Bkash Recurring Payment' : 'Bkash Onetime Payment',
		};
	}
	if (item?.payment_source === 'NAGAD') {
		return {
			...item,
			payment_source: 'Nagad Payment',
			image: 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713779396431.png',
		};
	}
	if (item?.payment_source === 'AAMARPAY') {
		return {
			...item,
			image: 'https://kabbik-ab-bucket.s3.ap-south-1.amazonaws.com/1685361594336.png',
			payment_source: 'Aamarpay Payment',
		};
	}
	if (item?.payment_source === 'ROBI') {
		return {
			...item,
			total_amount: calculatePercentage(item.total_amount, 49),
			image: 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713779411161.png',
			payment_source: item.is_recurring ? 'Robi Payment Recurring' : 'Robi Onetime Payment',
		};
	}
	if (item?.payment_source === 'BL') {
		return {
			...item,
			total_amount: calculatePercentage(item.total_amount, 50),
			image: '/images/BLlogopng.png',
			payment_source: item.is_recurring ? 'BL Payment Recurring' : 'BL Onetime Payment',
		};
	}
	if (item?.payment_source === 'GP') {
		return {
			...item,
			total_amount: calculatePercentage(item.total_amount, 70),
			image: 'https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/grameen%20.png',
			payment_source: item.is_recurring ? 'GP Recurring Payment' : 'GP Onetime Payment',
		};
	}
	if (item?.payment_source === 'APP_STORE') {
		return {
			...item,
			image: 'https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/applepay.png',
			payment_source: item.is_recurring
				? 'Apple Pay Recurring Payment'
				: 'Apple Pay Onetime Payment',
		};
	}
	if (item?.payment_source === 'PLAY_STORE') {
		return {
			...item,
			image: 'https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/googlepay.png',
			payment_source: item.is_recurring
				? 'Google Pay Recurring Payment'
				: 'Google Pay Onetime Payment',
		};
	}
	if (item?.payment_source === 'STRIPE') {
		return {
			...item,
			image: 'https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/strip.png',
			payment_source: item.is_recurring ? 'Stripe Recurring Payment' : 'Stripe Onetime Payment',
		};
	}
	return item;
}

export async function assemblePgwRevenueReport(startDate, endDate) {
	validateReportRange(startDate, endDate);
	await ensureFactsForRange(startDate, endDate);

	const today = todayDhaka();
	let facts = await DailyPgwRevenueStatsModel.getRange(startDate, endDate);

	if (moment(today).isBetween(startDate, endDate, 'day', '[]')) {
		const live = await buildDailyRevenueFacts(today);
		facts = facts.filter(r => r.stat_date !== today);
		facts = facts.concat(live.pgwFactRows);
	}

	const aggregated = new Map();
	for (const row of facts) {
		const key = `${row.payment_method}|${row.is_recurring}`;
		const prev = aggregated.get(key) ?? {
			payment_source: row.payment_method,
			is_recurring: row.is_recurring,
			total_amount: 0,
			new_subscribers: 0,
			old_subscribers: 0,
		};
		prev.total_amount += Number(row.raw_total) || 0;
		prev.new_subscribers += Number(row.new_subscribers) || 0;
		prev.old_subscribers += Number(row.old_subscribers) || 0;
		aggregated.set(key, prev);
	}

	return Array.from(aggregated.values())
		.map(mapPgwPaymentRow)
		.filter(Boolean);
}

export async function buildDailySubscriptionRollup(statDate) {
	const day = statDate || moment().subtract(1, 'day').format('YYYY-MM-DD');
	await buildDailyRevenueFacts(day);
	return { statDate: day };
}

export async function buildDailyPgwRollup(statDate) {
	return buildDailySubscriptionRollup(statDate);
}
