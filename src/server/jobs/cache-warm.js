import { cacheSet } from '../cache/index.js';
import { ensureRedisReady, redis } from '../config/redis.js';
import { dhakaMonthStartYmd, dhakaTodayYmd, parseYmd } from '../utils/dhaka-date.js';
import { buildRentRevenueReport } from './rent-revenue.js';
import { buildHomeSnapshot } from './dashboard.js';
import { buildSubscriptionRevenueReport } from './subscription-revenue.js';
import { buildPgwRevenueReport } from './pgw-revenue.js';
import {
	buildPlayCountPayload,
	buildPlayCountReport,
	buildSignUpReport,
	buildUserReport,
	userReportSnapshotFromBuilt,
} from './reports.js';
import { buildPackageWiseReport } from './package-wise-report.js';
import { buildDaywisePromoPage, defaultDaywisePromoRange } from './daywise-promo-query.js';

// Home/revenue: 60 min refresh (scheduled-warm every 15 min). User report: daily 03:30 Dhaka only.
export const DASH_HOME_TTL = 3600;
export const REVENUE_CACHE_TTL = 3600;
/** ~25h logical freshness — survives until next 03:30 Asia/Dhaka warm. */
export const USER_REPORT_TTL = 90000;
export const SIGNUP_REPORT_TTL = 3600;
export const PLAYCOUNT_TTL = 3600;
export const PACKAGE_WISE_TTL_LIVE = 1800;
export const PACKAGE_WISE_TTL_HIST = 86400;
export const DEFAULT_RENT_REPORT_LIMIT = 10;

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

export function userReportSnapshotCacheKey(date) {
	const anchor = date || dhakaTodayYmd();
	return `report:user-report:v1:${anchor}`;
}

export function packageWiseCacheKey(startDate, endDate) {
	return `report:pkg-wise:v1:${startDate}:${endDate}`;
}

export function packageWiseCacheTtl(endDate) {
	const today = dhakaTodayYmd();
	return endDate >= today ? PACKAGE_WISE_TTL_LIVE : PACKAGE_WISE_TTL_HIST;
}

/** Shared TTL for date-range reports (package-wise, rent revenue). */
export function reportRangeCacheTtl(endDate) {
	return packageWiseCacheTtl(endDate);
}

export function rentRevenueCacheKey(startDate, endDate, limit, offset) {
	return `report:rent-revenue:v1:${startDate}:${endDate}:${limit}:${offset}`;
}

export const DAYWISE_PROMO_DEFAULT_LIMIT = 50;

export function daywisePromoCacheKey(startDate, endDate, offset, limit) {
	return `report:daywise-promo:v1:${startDate}:${endDate}:${offset}:${limit}`;
}

export function daywisePromoCacheTtl(endDate) {
	return reportRangeCacheTtl(endDate);
}

export function defaultRentReportRange(anchorYmd) {
	const endDate = anchorYmd && parseYmd(anchorYmd).isValid() ? anchorYmd : dhakaTodayYmd();
	const startDate = dhakaMonthStartYmd(endDate);
	return { startDate, endDate };
}

export function defaultPackageWiseReportRange(anchorYmd) {
	return defaultRentReportRange(anchorYmd);
}

export async function warmDefaultPackageWiseReport(anchorDate) {
	const { startDate, endDate } = defaultPackageWiseReportRange(anchorDate);
	const payload = await buildPackageWiseReport(startDate, endDate);
	const ttl = packageWiseCacheTtl(endDate);
	await cacheSet(packageWiseCacheKey(startDate, endDate), payload, ttl);
	if (await ensureRedisReady()) {
		await redis.set('warm:package-wise:last_ok', String(Date.now()), 'EX', 86400);
	}
	return { startDate, endDate, payload };
}

export async function warmDaywisePromoCache(anchorDate) {
	const { startDate, endDate } = defaultDaywisePromoRange(anchorDate);
	const limit = DAYWISE_PROMO_DEFAULT_LIMIT;
	const payload = await buildDaywisePromoPage({
		startDate,
		endDate,
		offset: 0,
		limit,
	});
	const ttl = daywisePromoCacheTtl(endDate);
	await cacheSet(daywisePromoCacheKey(startDate, endDate, 0, limit), payload, ttl);
	if (await ensureRedisReady()) {
		await redis.set('warm:daywise-promo:last_ok', String(Date.now()), 'EX', 86400);
	}
	return { startDate, endDate, payload };
}

export async function warmDefaultRentReport(anchorDate) {
	const { startDate, endDate } = defaultRentReportRange(anchorDate);
	const limit = DEFAULT_RENT_REPORT_LIMIT;
	const offset = 0;
	const payload = await buildRentRevenueReport(startDate, endDate, limit, offset);
	const ttl = reportRangeCacheTtl(endDate);
	await cacheSet(rentRevenueCacheKey(startDate, endDate, limit, offset), payload, ttl);
	return payload;
}

export function dashHomeCacheKey(dateYmd) {
	const date = dateYmd || dhakaTodayYmd();
	return `dash:home:v2:${date}`;
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
	console.log(`[cache-warm] warmUserReport building for ${date}`);
	const snapshot = await buildUserReport(date);
	const pageSnapshot = userReportSnapshotFromBuilt(snapshot);
	const rentCacheTargets = [
		{ rentDate: date, isActive: null, isUnique: null, index: 0 },
		{ rentDate: null, isActive: 'true', isUnique: null, index: 1 },
		{ rentDate: null, isActive: null, isUnique: 'true', index: 2 },
		{ rentDate: null, isActive: 'true', isUnique: 'true', index: 3 },
	];

	const hardTtl = USER_REPORT_TTL;
	await Promise.all([
		cacheSet(userReportSnapshotCacheKey(date), pageSnapshot, USER_REPORT_TTL, hardTtl),
		cacheSet(userCountCacheKey(date), snapshot.userCount, USER_REPORT_TTL, hardTtl),
		cacheSet(blSubscriberCacheKey(date), snapshot.blSubscriber, USER_REPORT_TTL, hardTtl),
		cacheSet(subscribedUserCacheKey(date), snapshot.subscribedUser, USER_REPORT_TTL, hardTtl),
		cacheSet(playCountCacheKey(), snapshot.playCount, USER_REPORT_TTL, hardTtl),
		...rentCacheTargets.map(({ rentDate, isActive, isUnique, index }) =>
			cacheSet(
				rentCountCacheKey(rentDate, isActive, isUnique),
				snapshot.rent[index].payload,
				USER_REPORT_TTL,
				hardTtl,
			),
		),
	]);
	await warmDashboardHome(date);
	return pageSnapshot;
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

/** Sign-up, play-count, rent, package-wise — daywise promo has its own 02:00 Dhaka cron. */
export async function warmSecondaryReportCaches(anchorDate) {
	if (anchorDate && !parseYmd(anchorDate).isValid()) {
		throw new Error('Invalid anchorDate');
	}
	const started = Date.now();
	await warmSignUpReport();
	await warmPlayCountReport();
	await warmDefaultRentReport(anchorDate);
	await warmDefaultPackageWiseReport(anchorDate);
	console.log(`[cache-warm] warmSecondaryReportCaches ok ${Date.now() - started}ms`);
}

export async function warmAllDefaultCaches(anchorDate) {
	if (anchorDate && !parseYmd(anchorDate).isValid()) {
		throw new Error('Invalid anchorDate');
	}
	const started = Date.now();
	console.log('[cache-warm] warmUserReport start');
	await warmUserReport(anchorDate);
	console.log('[cache-warm] warmUserReport ok');
	await warmSecondaryReportCaches(anchorDate);
	await warmDaywisePromoCache(anchorDate);
	console.log(`[cache-warm] warmAllDefaultCaches ok ${Date.now() - started}ms`);
}
