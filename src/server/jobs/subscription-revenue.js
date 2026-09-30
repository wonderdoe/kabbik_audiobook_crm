import { assembleSubscriptionRevenueReport } from './revenue-daily-facts.js';

export async function buildSubscriptionRevenueReport(startDate, endDate) {
	const report = await assembleSubscriptionRevenueReport(startDate, endDate);
	return {
		updatedAt: new Date().toISOString(),
		startDate,
		endDate,
		...report,
	};
}
