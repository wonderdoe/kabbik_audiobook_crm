import { assemblePgwRevenueReport } from './revenue-daily-facts.js';

export async function buildPgwRevenueReport(startDate, endDate) {
	const data = await assemblePgwRevenueReport(startDate, endDate);
	return {
		updatedAt: new Date().toISOString(),
		startDate,
		endDate,
		data,
	};
}
