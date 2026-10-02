import {
	fetchActiveSubscribers,
	queryLifetimeSubscriberCounts,
} from '../../../server/jobs/user-report-queries.js';

class UserCountModel {
	async usercount(_date) {
		try {
			return await queryLifetimeSubscriberCounts();
		} catch (error) {
			console.error('Error in usercount:', error);
			throw error;
		}
	}

	async blUserCount(_date) {
		try {
			return await fetchActiveSubscribers(1);
		} catch (error) {
			console.error('Error in blUserCount:', error);
			throw error;
		}
	}
}

export default new UserCountModel();
