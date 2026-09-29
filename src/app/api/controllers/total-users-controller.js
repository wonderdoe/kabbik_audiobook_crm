import TotalUserModel from '../models/total-user-model';

class TotalUserController {
	async getTotal(date) {
		try {
			const results = await TotalUserModel.getTotal(date);
			return results;
		} catch (error) {
			return error;
		}
	}

	async getNewUsers(startDate, endDate) {
		try {
			const result = await TotalUserModel.getNewUsers(startDate, endDate);
			return result;
		} catch (err) {
			return err;
		}
	}
}

export default new TotalUserController();

// module.exports = new RoleController();
