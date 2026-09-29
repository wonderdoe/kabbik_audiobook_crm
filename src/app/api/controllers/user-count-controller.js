import userCountModel from '../models/user-count-model';
class userCountController {
	async usercount(date) {
		try {
			const result = await userCountModel.usercount(date);
			return { result, statusCode: 200 };
		} catch (error) {
			return error;
		}
	}
	async blUserCountasync (date) {
		try {
			const result = await userCountModel.blUserCount(date);
			return { result, statusCode: 200 };
		} catch (error) {
			return error;
		}
	}
}
export default new userCountController();
