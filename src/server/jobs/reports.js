import userCountModel from '../../app/api/models/user-count-model.js';
import SubscriptionUserModel from '../../app/api/models/subscription-user-model.js';
import TrackUserSignUpModel from '../../app/api/models/track-user-sign-up-model.js';
import { buildPackageWiseReport as buildPackageWiseReportFromRollup } from './package-wise-report.js';
import { queryRentCountAllVariants } from './user-report-queries.js';

export async function buildUserCountPayload(date) {
	const result = await userCountModel.usercount(date);
	return { result, statusCode: 200 };
}

export async function buildBlSubscriberCountPayload(date) {
	const result = await userCountModel.blUserCount(date);
	return { result, statusCode: 200 };
}

export async function buildSubscribedUserPayload(date) {
	const result = await SubscriptionUserModel.getSubcribedUser(date);
	return {
		result,
		message: 'Subscription User Data Fetched',
		statusCode: 200,
	};
}

export async function buildRentCountPayload({ isActive, isUnique }) {
	const result = await SubscriptionUserModel.getRentCount({ isActive, isUnique });
	return { result };
}

export async function buildPlayCountPayload() {
	return SubscriptionUserModel.getPlayCount();
}

export async function buildSignUpReport() {
	return TrackUserSignUpModel.getLastSevenDaysList();
}

export async function buildPlayCountReport() {
	return SubscriptionUserModel.getPlayCountReport();
}

export async function buildPackageWiseReport(startDate, endDate) {
	return buildPackageWiseReportFromRollup(startDate, endDate);
}

async function timedUserReportStep(name, fn) {
	const started = Date.now();
	const result = await fn();
	console.log(`[user-report] ${name} ${Date.now() - started}ms`);
	return result;
}

/** All user-report endpoints for a single anchor date (cron warm). */
export async function buildUserReport(date) {
	const rentVariants = [
		{ isActive: null, isUnique: null },
		{ isActive: 'true', isUnique: null },
		{ isActive: null, isUnique: 'true' },
		{ isActive: 'true', isUnique: 'true' },
	];

	const userCount = await timedUserReportStep('lifetime', () => buildUserCountPayload(date));
	const subscribedUser = await timedUserReportStep('active-kabbik', () =>
		buildSubscribedUserPayload(date),
	);
	const blSubscriber = await timedUserReportStep('active-bl', () => buildBlSubscriberCountPayload(date));
	const playCount = await timedUserReportStep('play-count', () => buildPlayCountPayload());

	const rentAll = await timedUserReportStep('rent-all-variants', () => queryRentCountAllVariants());
	const rentPayloads = [
		{ result: rentAll.total },
		{ result: rentAll.activeTotal },
		{ result: rentAll.uniqueTotal },
		{ result: rentAll.activeUnique },
	];

	return {
		userCount,
		blSubscriber,
		subscribedUser,
		playCount,
		rent: rentVariants.map((v, i) => ({ ...v, payload: rentPayloads[i] })),
	};
}

function rentResultFromBuilt(built, isActive, isUnique) {
	const entry = built.rent.find(
		r =>
			(r.isActive ?? null) === (isActive ?? null) && (r.isUnique ?? null) === (isUnique ?? null),
	);
	return entry?.payload?.result ?? [];
}

export function userReportSnapshotFromBuilt(built) {
	return {
		updatedAt: new Date().toISOString(),
		userCount: built.userCount,
		blSubscriber: built.blSubscriber,
		subscribedUser: built.subscribedUser,
		playCount: built.playCount,
		rentTotal: rentResultFromBuilt(built, null, null),
		rentActive: rentResultFromBuilt(built, 'true', null),
		rentUniqueTotal: rentResultFromBuilt(built, null, 'true'),
		rentActiveUnique: rentResultFromBuilt(built, 'true', 'true'),
	};
}

/** Single payload for user-report page + snapshot cache. */
export async function buildUserReportSnapshot(date) {
	return userReportSnapshotFromBuilt(await buildUserReport(date));
}
