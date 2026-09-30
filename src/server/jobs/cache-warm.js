import moment from 'moment';
import { cacheSet } from '../cache/index.js';
import { buildHomeSnapshot } from './dashboard.js';
import { buildSubscriptionRevenueReport } from './subscription-revenue.js';
import { buildPgwRevenueReport } from './pgw-revenue.js';

export const DASH_HOME_TTL = 600;
export const REVENUE_CACHE_TTL = 600;

export function defaultRevenueDateRange(anchor = moment()) {
	const m = moment.isMoment(anchor) ? anchor : moment(anchor);
	const endDate = m.format('YYYY-MM-DD');
	const startDate = m.clone().subtract(6, 'days').format('YYYY-MM-DD');
	return { startDate, endDate };
}

export async function warmDashboardHome(anchorDate) {
	const snap = await buildHomeSnapshot(anchorDate);
	await cacheSet('dash:home', snap, DASH_HOME_TTL);
	return snap;
}

export async function warmDefaultRevenueReports(anchor) {
	const { startDate, endDate } = defaultRevenueDateRange(anchor);
	const today = endDate;
	const [sub, pgw] = await Promise.all([
		buildSubscriptionRevenueReport(startDate, endDate),
		buildPgwRevenueReport(today, today),
	]);
	await Promise.all([
		cacheSet(`revenue:sub:v1:${startDate}:${endDate}`, sub, REVENUE_CACHE_TTL),
		cacheSet(`revenue:pgw:v1:${today}:${today}`, pgw, REVENUE_CACHE_TTL),
	]);
	return { startDate, endDate, today };
}

export async function warmAllDefaultCaches(anchorDate) {
	const anchor = anchorDate ? moment(anchorDate, 'YYYY-MM-DD', true) : moment();
	if (anchorDate && !anchor.isValid()) {
		throw new Error('Invalid anchorDate');
	}
	const started = Date.now();
	await Promise.all([
		warmDashboardHome(anchor.format('YYYY-MM-DD')),
		warmDefaultRevenueReports(anchor),
	]);
	console.log(`[cache-warm] warmAllDefaultCaches ok ${Date.now() - started}ms`);
}
