import RevenueModel from '../../app/api/models/revenue-model.js';

export async function buildRentRevenueReport(startDate, endDate, limit, offset, day = null) {
	const data = await RevenueModel.getRentReport(startDate, endDate, day, limit, offset);
	return { ...data, updatedAt: new Date().toISOString() };
}
