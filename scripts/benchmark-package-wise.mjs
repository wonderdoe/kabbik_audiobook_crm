import './load-env.mjs';
import moment from 'moment';
import RevenueModel from '../src/app/api/models/revenue-model.js';
import { dhakaMonthStartYmd, dhakaTodayYmd } from '../src/server/utils/dhaka-date.js';

async function timed(label, fn) {
	const start = Date.now();
	const result = await fn();
	const ms = Date.now() - start;
	const total = result?.total ?? 0;
	const rows = result?.list?.length ?? 0;
	console.log(`[benchmark] ${label}: ${ms}ms total=${total} packages=${rows}`);
	return { ms, result };
}

async function main() {
	const today = dhakaTodayYmd();
	const mStart = dhakaMonthStartYmd(today);
	const weekStart = moment(today).subtract(6, 'days').format('YYYY-MM-DD');

	console.log('[benchmark-package-wise] legacy getPackageWiseRevenue');
	await timed('today', () => RevenueModel.getPackageWiseRevenue(today, today));
	await timed('last_7d', () => RevenueModel.getPackageWiseRevenue(weekStart, today));
	await timed('mtd', () => RevenueModel.getPackageWiseRevenue(mStart, today));
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
