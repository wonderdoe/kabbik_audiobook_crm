import { dhakaDayFractionElapsed } from '@/utils/dhaka-date-client';

export type PredictTodayParams = {
	seriesNewestFirst: number[];
	todayValue: number;
};

function mean(values: number[]): number {
	if (values.length === 0) return 0;
	return values.reduce((a, b) => a + b, 0) / values.length;
}

/** End-of-day estimate: blend intraday pace with recent daily trend from the chart series. */
export function predictTodayEndOfDay({ seriesNewestFirst, todayValue }: PredictTodayParams): number {
	const fractionElapsed = dhakaDayFractionElapsed();
	const paceForecast = todayValue / fractionElapsed;

	const prior = seriesNewestFirst.slice(1).map(v => Number(v) || 0);
	const avg = mean(prior);
	const trend = prior.length >= 2 ? prior[0] - prior[1] : 0;
	const trendForecast = avg + trend;

	const blended = 0.4 * paceForecast + 0.6 * trendForecast;
	const prediction = Math.round(blended);
	return Math.max(prediction, Math.round(todayValue));
}
