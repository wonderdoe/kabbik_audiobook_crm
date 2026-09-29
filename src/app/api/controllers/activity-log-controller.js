import Activity_log_mdel from '../../api/models/activity-log-model.js';

class ActivityLogController {
	async createActivity(data) {
		try {
			const results = await Activity_log_mdel.creteLog(data);
			return results;
		} catch (error) {
			return error;
		}
	}

	
}

export default new ActivityLogController();

// module.exports = new RoleController();
