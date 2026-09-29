import SubscriptionUserModel from '../models/subscription-user-model';

class SubscriptionUserController {
	async getSubList(offset, limit) {
		try {
			const results = await SubscriptionUserModel.userlist(offset, limit);

			return { results, message: 'Subscription Data Fetched', statusCode: 200 };
		} catch (error) {
			return error;
		}
	}

	async getSubsUser(searchkey, offset, limit) {
		try {
			const results = await SubscriptionUserModel.searchUser(searchkey, offset, limit);
			return {
				results,
				message: 'Data Retrieved Successfully',
				statusCode: 200,
				count: results.length,
			};
		} catch (error) {
			return error;
		}
	}

	async getSubsUserDetails(id) {
		try {
			const results = await SubscriptionUserModel.detailsList(id);
			return { results: results, message: 'Subscription User Data Fetched', statusCode: 200 };
		} catch (error) {
			return error;
		}
	}

	async getSubcribedUser(date) {
		try {
			const result = await SubscriptionUserModel.getSubcribedUser(date);
			return { result, message: 'Subscription User Data Fetched', statusCode: 200 };
		} catch (error) {
			return error;
		}
	}

	async getPlayCount() {
		try {
			const results = await SubscriptionUserModel.getPlayCount();
			return results;
		} catch (error) {
			return error;
		}
	}

	//

	async getPlayCountReport() {
		try {
			const results = await SubscriptionUserModel.getPlayCountReport();
			return results;
		} catch (error) {
			throw error;
		}
	}

	async getManuallySubscribedUsers(offset, limit) {
		try {
			const results = await SubscriptionUserModel.getManuallySubscribedUsers(offset, limit);
			return results;
		} catch (error) {
			return error;
		}
	}

	async searchManuallySubscribedUsers(offset, limit, searchkey) {
		try {
			const results = await SubscriptionUserModel.searchManuallySubscribedUser(
				offset,
				limit,
				searchkey,
			);
			return results;
		} catch (error) {
			return error;
		}
	}

	async giveSubscriptionToUser(body) {
		try {
			const results = await SubscriptionUserModel.giveSubscriptionToUser(body);
			return results;
		} catch (error) {
			return error;
		}
	}

	async getRentCount(body) {
		try {
			const result = await SubscriptionUserModel.getRentCount(body);
			return {result};
		} catch (error) {
			return error;
		}
	}
}
export default new SubscriptionUserController();
