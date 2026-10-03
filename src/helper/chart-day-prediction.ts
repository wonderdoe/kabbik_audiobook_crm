import { dhakaDayFractionElapsed } from '@/utils/dhaka-date-client';

export type PredictTodayParams = {
	seriesNewestFirst: number[];
	todayValue: number;
};

function mean(values: number[]): number {
	if (values.length === 0) return 0;
	return values.reduce((a, b) => a + b, 0) / values.length;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

/** Index 0 = most recent historical day (yesterday). */
function exponentialWeightedMean(values: number[], decay = 0.82): number {
	let weightedSum = 0;
	let weightTotal = 0;
	for (let i = 0; i < values.length; i++) {
		const w = Math.pow(decay, i);
		weightedSum += values[i] * w;
		weightTotal += w;
	}
	return weightTotal > 0 ? weightedSum / weightTotal : 0;
}

/** `values` oldest → newest; returns slope per one-day step. */
function linearRegressionSlope(values: number[]): number {
	if (values.length < 2) return 0;
	const xs = values.map((_, i) => i);
	const meanX = mean(xs);
	const meanY = mean(values);
	let num = 0;
	let den = 0;
	for (let i = 0; i < values.length; i++) {
		num += (xs[i] - meanX) * (values[i] - meanY);
		den += (xs[i] - meanX) ** 2;
	}
	return den > 0 ? num / den : 0;
}

/**
 * Linear run-rate extrapolation to end of Dhaka day.
 * Capped early in the day when a tiny fraction would explode the estimate.
 */
function paceEndOfDay(today: number, fraction: number, history: number[]): number {
	const raw = today / fraction;
	if (history.length === 0) return raw;

	const recentPeak = Math.max(exponentialWeightedMean(history), ...history.slice(0, 3));
	const softCap = Math.max(recentPeak * 2.5, today * 1.08);

	if (fraction < 0.2) {
		return Math.min(raw, softCap);
	}
	return raw;
}

/**
 * End-of-day estimate for a cumulative daily metric.
 * Always at least today's run-rate extrapolation (credit for remaining Dhaka hours).
 */
export function predictTodayEndOfDay({ seriesNewestFirst, todayValue }: PredictTodayParams): number {
	const today = Math.max(0, Number(todayValue) || 0);
	const fraction = dhakaDayFractionElapsed();

	const history = seriesNewestFirst
		.slice(1)
		.map(v => Math.max(0, Number(v) || 0));

	const paceEod = paceEndOfDay(today, fraction, history);

	if (history.length === 0) {
		return Math.round(Math.max(paceEod, today));
	}

	const ewma = exponentialWeightedMean(history);
	const windowLen = Math.min(5, history.length);
	const chron = history.slice(0, windowLen).reverse();
	const slope = linearRegressionSlope(chron);
	const trendEod = Math.max(0, ewma + slope);
	const historicalEod = 0.75 * ewma + 0.25 * trendEod;

	const yesterday = history[0] ?? ewma;
	const alreadyBeatYesterday = today >= yesterday;

	// Quiet days: let history matter more. Spike days: almost all pace (remaining hours at today's rate).
	let histWeight = clamp(0.4 * (1 - fraction), 0.05, 0.4);
	if (alreadyBeatYesterday) {
		histWeight = Math.min(histWeight, 0.08);
	}

	const paceWeight = 1 - histWeight;
	let blended = paceWeight * paceEod + histWeight * historicalEod;

	if (!alreadyBeatYesterday) {
		const recentPeak = Math.max(ewma, ...history.slice(0, 3));
		const softCap = recentPeak * 2.2;
		if (blended > softCap) {
			blended = 0.65 * softCap + 0.35 * blended;
		}
	}

	const prediction = Math.round(Math.max(blended, paceEod, today));
	return prediction;
}
