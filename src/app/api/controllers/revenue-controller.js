import RevenueModel from '../models/revenue-model';
class RevenueController {
	async getReport(startDate, endDate) {
		try {
			const results = await RevenueModel.getReport(startDate, endDate);
			return results;
		} catch (error) {
			return error;
		}
	}

	async getRentReport(startDate, endDate, day, limit, offset) {
		try {
			const results = await RevenueModel.getRentReport(startDate, endDate, day, limit, offset);
			return results;
		} catch (error) {
			return error;
		}
	}

	async getRevenueReport(startDate, endDate) {
		try {
			const results = await RevenueModel.getRevenueReport(startDate, endDate);
			return results;
		} catch (error) {
			return error;
		}
	}

	async individualPaymentGateway(item) {
		try {
			const results = await RevenueModel.individualPaymentGateway(item);
			return results;
		} catch (error) {
			return error;
		}
	}

	async getSingleDayTotalPayment(day) {
		const data = await RevenueModel.getSingleDayTotalPayment(day);
		return data;
	}

	async getPackageWiseRevenue(startDate, endDate) {
		try {
			const data = await RevenueModel.getPackageWiseRevenue(startDate, endDate);
			return data;
		} catch (err) {
			throw err;
		}
	}
}

export default new RevenueController();

// module.exports = new RoleController();
