/**
 * Benchmark daywise promo legacy vs optimized queries.
 * Usage: node scripts/validate-daywise-promo.mjs
 */
import './load-env.mjs';
import moment from 'moment';
import { queryDaywisePromoLegacy } from '../src/server/jobs/daywise-promo-legacy.js';
import {
	buildDaywisePromoPage,
	countDaywisePromoActivations,
} from '../src/server/jobs/daywise-promo-query.js';
import { dhakaTodayYmd } from '../src/server/utils/dhaka-date.js';

async function timed(label, fn) {
	const start = Date.now();
	const result = await fn();
	return { label, ms: Date.now() - start, result };
}

async function main() {
	const yesterday = moment(dhakaTodayYmd(), 'YYYY-MM-DD').subtract(1, 'day').format('YYYY-MM-DD');
	console.log('[validate-daywise-promo] window (optimized):', yesterday, 'to', yesterday);

	const legacy = await timed('legacy_list_page1', () => queryDaywisePromoLegacy(0, 50));
	console.log(
		`  legacy: total=${legacy.result.total} rows=${legacy.result.data?.length ?? 0} ms=${legacy.ms}`,
	);

	const optimized = await timed('optimized_page1', () =>
		buildDaywisePromoPage({
			startDate: yesterday,
			endDate: yesterday,
			offset: 0,
			limit: 50,
		}),
	);
	console.log(
		`  optimized: total=${optimized.result.total} rows=${optimized.result.data?.length ?? 0} ms=${optimized.ms}`,
	);

	const countOnly = await timed('optimized_count_only', () =>
		countDaywisePromoActivations(yesterday, yesterday),
	);
	console.log(`  optimized count only: total=${countOnly.result} ms=${countOnly.ms}`);

	if (optimized.result.data?.length) {
		const sample = optimized.result.data[0];
		console.log('\n  sample row:', {
			id: sample.id,
			promo_code: sample.promo_code,
			payment_time: sample.payment_time,
			amount: sample.amount,
		});
	}

	const speedup =
		legacy.ms > 0 ? (((legacy.ms - optimized.ms) / legacy.ms) * 100).toFixed(1) : 'n/a';
	console.log(`\n  page build speedup vs legacy (approx): ${speedup}%`);
	console.log('\nRecord results in docs/perf/daywise-promo-baseline.md');
}

main().catch(err => {
	console.error('[validate-daywise-promo] failed', err);
	process.exit(1);
});
