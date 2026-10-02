import { cacheSet } from '../cache/index.js';
import { dhakaTodayYmd, parseYmd } from '../utils/dhaka-date.js';
import { buildHomeSnapshot } from './dashboard.js';
import { buildSubscriptionRevenueReport } from './subscription-revenue.js';
import { buildPgwRevenueReport } from './pgw-revenue.js';
import { buildPlayCountPayload, buildPlayCountReport, buildSignUpReport, buildUserReport } from './reports.js';

// Logical freshness 60 min; worker warms home/revenue every 15 min (cron: Asia/Dhaka).
export const DASH_HOME_TTL = 3600;
export const REVENUE_CACHE_TTL = 3600;
export const USER_REPORT_TTL = 3600;
export const SIGNUP_REPORT_TTL = 3600;
export const PLAYCOUNT_TTL = 3600;
export const PACKAGE_WISE_TTL_LIVE = 1800;
export const PACKAGE_WISE_TTL_HIST = 86400;

export function cacheDateToken(date) {
	return date ?? 'null';
}

export function userCountCacheKey(date) {
	return `report:user-count:v1:${cacheDateToken(date)}`;
}

export function blSubscriberCacheKey(date) {
	return `report:bl-sub:v1:${cacheDateToken(date)}`;
}

export function subscribedUserCacheKey(date) {
	return `report:subscribed-user:v1:${cacheDateToken(date)}`;
}

export function rentCountCacheKey(date, isActive, isUnique) {
	return `report:rent:v1:${cacheDateToken(date)}:${isActive ?? 'null'}:${isUnique ?? 'null'}`;
}

export function playCountCacheKey() {
	return 'report:playcount:v1';
}

export function signUpReportCacheKey() {
	return 'report:signup:v1';
}

export function playCountReportCacheKey() {
	return 'report:playcount-report:v1';
}

export function packageWiseCacheKey(startDate, endDate) {
	return `report:pkg-wise:v1:${startDate}:${endDate}`;
}

export function packageWiseCacheTtl(endDate) {
	const today = dhakaTodayYmd();
	return endDate >= today ? PACKAGE_WISE_TTL_LIVE : PACKAGE_WISE_TTL_HIST;
}

export function dashHomeCacheKey(dateYmd) {
	const date = dateYmd || dhakaTodayYmd();
	return `dash:home:${date}`;
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
	const key = dashHomeCacheKey(date);
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

export async function warmUserReport(anchorDate) {
	const date = anchorDate || dhakaTodayYmd();
	const snapshot = await buildUserReport(date);
	const rentCacheTargets = [
		{ rentDate: date, isActive: null, isUnique: null, index: 0 },
		{ rentDate: null, isActive: 'true', isUnique: null, index: 1 },
		{ rentDate: null, isActive: null, isUnique: 'true', index: 2 },
		{ rentDate: null, isActive: 'true', isUnique: 'true', index: 3 },
	];

	await Promise.all([
		cacheSet(userCountCacheKey(date), snapshot.userCount, USER_REPORT_TTL),
		cacheSet(blSubscriberCacheKey(date), snapshot.blSubscriber, USER_REPORT_TTL),
		cacheSet(subscribedUserCacheKey(date), snapshot.subscribedUser, USER_REPORT_TTL),
		cacheSet(playCountCacheKey(), snapshot.playCount, PLAYCOUNT_TTL),
		...rentCacheTargets.map(({ rentDate, isActive, isUnique, index }) =>
			cacheSet(
				rentCountCacheKey(rentDate, isActive, isUnique),
				snapshot.rent[index].payload,
				USER_REPORT_TTL,
			),
		),
	]);
	return snapshot;
}

export async function warmSignUpReport() {
	const data = await buildSignUpReport();
	await cacheSet(signUpReportCacheKey(), data, SIGNUP_REPORT_TTL);
	return data;
}

export async function warmPlayCountReport() {
	const [playCount, playCountReport] = await Promise.all([
		buildPlayCountPayload(),
		buildPlayCountReport(),
	]);
	await Promise.all([
		cacheSet(playCountCacheKey(), playCount, PLAYCOUNT_TTL),
		cacheSet(playCountReportCacheKey(), playCountReport, PLAYCOUNT_TTL),
	]);
	return { playCount, playCountReport };
}

export async function warmAllDefaultCaches(anchorDate) {
	if (anchorDate && !parseYmd(anchorDate).isValid()) {
		throw new Error('Invalid anchorDate');
	}
	const started = Date.now();
	await Promise.all([
		warmDashboardHome(anchorDate),
		warmDefaultRevenueReports(anchorDate),
		warmUserReport(anchorDate),
		warmSignUpReport(),
		warmPlayCountReport(),
	]);
	console.log(`[cache-warm] warmAllDefaultCaches ok ${Date.now() - started}ms`);
}
