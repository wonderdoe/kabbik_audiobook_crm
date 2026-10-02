import userCountModel from '../../app/api/models/user-count-model.js';
import SubscriptionUserModel from '../../app/api/models/subscription-user-model.js';
import TrackUserSignUpModel from '../../app/api/models/track-user-sign-up-model.js';
import RevenueModel from '../../app/api/models/revenue-model.js';

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
	return RevenueModel.getPackageWiseRevenue(startDate, endDate);
}

/** All user-report endpoints for a single anchor date (cron warm). */
export async function buildUserReport(date) {
	const rentVariants = [
		{ isActive: null, isUnique: null },
		{ isActive: 'true', isUnique: null },
		{ isActive: null, isUnique: 'true' },
		{ isActive: 'true', isUnique: 'true' },
	];

	const [userCount, blSubscriber, subscribedUser, playCount, ...rentPayloads] = await Promise.all([
		buildUserCountPayload(date),
		buildBlSubscriberCountPayload(date),
		buildSubscribedUserPayload(date),
		buildPlayCountPayload(),
		...rentVariants.map(v => buildRentCountPayload(v)),
	]);

	return {
		userCount,
		blSubscriber,
		subscribedUser,
		playCount,
		rent: rentVariants.map((v, i) => ({ ...v, payload: rentPayloads[i] })),
	};
}
