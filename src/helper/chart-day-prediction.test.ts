import { predictTodayEndOfDay } from './chart-day-prediction';

jest.mock('@/utils/dhaka-date-client', () => ({
	dhakaDayFractionElapsed: () => 0.5,
}));

describe('predictTodayEndOfDay', () => {
	it('uses pace when no history', () => {
		expect(predictTodayEndOfDay({ seriesNewestFirst: [100], todayValue: 100 })).toBe(200);
	});

	it('never predicts below run-rate extrapolation on a spike day', () => {
		const series = [4500, 4800, 5100, 4900, 5000, 5050, 4950];
		const pred = predictTodayEndOfDay({ seriesNewestFirst: series, todayValue: 9400 });
		expect(pred).toBeGreaterThan(9400);
	});

	it('responds to momentum vs yesterday', () => {
		const flat = predictTodayEndOfDay({
			seriesNewestFirst: [4500, 4400, 4600, 4500, 4550, 4450, 4500],
			todayValue: 3000,
		});
		const spike = predictTodayEndOfDay({
			seriesNewestFirst: [4500, 4400, 4600, 4500, 4550, 4450, 4500],
			todayValue: 6000,
		});
		expect(spike).toBeGreaterThan(flat);
	});
});
