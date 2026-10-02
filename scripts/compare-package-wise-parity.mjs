import './load-env.mjs';
import moment from 'moment';
import RevenueModel from '../src/app/api/models/revenue-model.js';
import { assemblePackageWiseReport } from '../src/server/jobs/package-wise-report.js';
import { dhakaMonthStartYmd, dhakaTodayYmd } from '../src/server/utils/dhaka-date.js';

function mapByName(list) {
	const m = new Map();
	for (const row of list || []) {
		m.set(row.name, Number(row.total) || 0);
	}
	return m;
}

function compare(label, legacy, rollup) {
	const a = mapByName(legacy.list);
	const b = mapByName(rollup.list);
	const names = new Set([...a.keys(), ...b.keys()]);
	let ok = true;
	for (const name of names) {
		const d = Math.abs((a.get(name) || 0) - (b.get(name) || 0));
		if (d > 1) {
			ok = false;
			console.log(`  mismatch ${name}: legacy=${a.get(name)} rollup=${b.get(name)} delta=${d}`);
		}
	}
	const totalDelta = Math.abs((legacy.total || 0) - (rollup.total || 0));
	if (totalDelta > 1) {
		ok = false;
		console.log(`  total mismatch: legacy=${legacy.total} rollup=${rollup.total}`);
	}
	console.log(`[parity] ${label}: ${ok ? 'OK' : 'FAIL'}`);
	return ok;
}

async function main() {
	const today = dhakaTodayYmd();
	const yesterday = moment(today).subtract(1, 'day').format('YYYY-MM-DD');
	const mStart = dhakaMonthStartYmd(today);

	for (const [label, start, end] of [
		['yesterday', yesterday, yesterday],
		['mtd', mStart, yesterday],
		['today', today, today],
	]) {
		const legacy = await RevenueModel.getPackageWiseRevenue(start, end);
		const rollup = await assemblePackageWiseReport(start, end);
		compare(label, legacy, rollup);
	}
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
