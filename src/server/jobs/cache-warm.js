import { cacheSet } from '../cache/index.js';
import { dhakaTodayYmd, parseYmd } from '../utils/dhaka-date.js';
import { buildHomeSnapshot } from './dashboard.js';
import { buildSubscriptionRevenueReport } from './subscription-revenue.js';
import { buildPgwRevenueReport } from './pgw-revenue.js';

// Logical freshness 60 min; worker warms home/revenue every 15 min (cron: Asia/Dhaka).
export const DASH_HOME_TTL = 3600;
export const REVENUE_CACHE_TTL = 3600;

export function dashHomeCacheKey(dateYmd) {
	return dateYmd ? `dash:home:${dateYmd}` : 'dash:home';
}

export function defaultRevenueDateRange(anchorYmd) {
	const m = anchorYmd ? parseYmd(anchorYmd) : parseYmd(dhakaTodayYmd());
	if (anchorYmd && !m.isValid()) {
		throw new Error('Invalid anchorDate');
	}
	const endDate = m.format('YYYY-MM-DD');
	const startDate = m.clone().subtract(6, 'days').format('YYYY-MM-DD');
	return { startDate, endDate };
}

export async function warmDashboardHome(anchorDate) {
	const date = anchorDate || dhakaTodayYmd();
	const snap = await buildHomeSnapshot(date);
	const key = dashHomeCacheKey(anchorDate ? date : undefined);
	await cacheSet(key, snap, DASH_HOME_TTL);
	return snap;
}

export async function warmDefaultRevenueReports(anchorYmd) {
	const { startDate, endDate } = defaultRevenueDateRange(anchorYmd);
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
	if (anchorDate && !parseYmd(anchorDate).isValid()) {
		throw new Error('Invalid anchorDate');
	}
	const started = Date.now();
	await Promise.all([
		warmDashboardHome(anchorDate),
		warmDefaultRevenueReports(anchorDate),
	]);
	console.log(`[cache-warm] warmAllDefaultCaches ok ${Date.now() - started}ms`);
}
