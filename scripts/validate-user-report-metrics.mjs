/**
 * Compare user-report active subscriber strategies (legacy log vs optimized log vs users).
 * Usage: node scripts/validate-user-report-metrics.mjs
 */
import './load-env.mjs';
import {
	queryActiveLatestLegacy,
	queryActiveLatestOptimized,
	queryActiveFromUsers,
	queryLifetimeSubscriberCounts,
	countActiveCreatedAtTies,
	describeUsersColumns,
	sumMappedCounts,
} from '../src/server/jobs/user-report-queries.js';

async function timed(label, fn) {
	const start = Date.now();
	const result = await fn();
	return { label, ms: Date.now() - start, rows: result, total: sumMappedCounts(result) };
}

function pctDelta(a, b) {
	if (a === 0 && b === 0) return 0;
	if (a === 0) return 100;
	return Math.abs((b - a) / a) * 100;
}

function printSection(title, runs) {
	console.log(`\n=== ${title} ===`);
	for (const r of runs) {
		console.log(`  ${r.label}: total=${r.total} ms=${r.ms}`);
	}
	const baseline = runs[0]?.total ?? 0;
	for (let i = 1; i < runs.length; i += 1) {
		console.log(`  delta vs baseline (${runs[0].label}): ${pctDelta(baseline, runs[i].total).toFixed(2)}%`);
	}
}

async function main() {
	console.log('[validate-user-report] starting');
	const userCols = await describeUsersColumns();
	console.log('[validate-user-report] users columns:', userCols.join(', '));

	const kabbikRuns = [];
	kabbikRuns.push(await timed('legacy_window_non_bl', () => queryActiveLatestLegacy(0)));
	kabbikRuns.push(await timed('optimized_log_non_bl', () => queryActiveLatestOptimized(0)));
	kabbikRuns.push(await timed('users_non_bl', () => queryActiveFromUsers({ banglalink: false })));
	printSection('Active Kabbik (getSubcribedUser)', kabbikRuns);

	const blRuns = [];
	blRuns.push(await timed('legacy_window_bl', () => queryActiveLatestLegacy(1)));
	blRuns.push(await timed('optimized_log_bl', () => queryActiveLatestOptimized(1)));
	blRuns.push(await timed('users_bl', () => queryActiveFromUsers({ banglalink: true })));
	printSection('Active Banglalink (blUserCount)', blRuns);

	const lifetime = await timed('lifetime_usercount', () => queryLifetimeSubscriberCounts());
	console.log(`\n=== Lifetime (usercount) ===\n  total=${lifetime.total} ms=${lifetime.ms}`);

	const tieGroupsNonBl = await countActiveCreatedAtTies(0);
	const tieGroupsBl = await countActiveCreatedAtTies(1);
	console.log(`\n=== created_at tie groups (duplicate rows per user+timestamp) ===`);
	console.log(`  non_bl=${tieGroupsNonBl} bl=${tieGroupsBl}`);

	const legacyK = kabbikRuns[0].total;
	const usersK = kabbikRuns[2].total;
	const optK = kabbikRuns[1].total;
	console.log('\n=== Active vs lifetime (Kabbik) ===');
	if (optK > lifetime.total) {
		console.log(
			`  WARNING: optimized active (${optK}) > lifetime (${lifetime.total}) — snapshot cards will look wrong`,
		);
	} else {
		console.log(`  OK: optimized active (${optK}) <= lifetime (${lifetime.total})`);
	}

	console.log('\n=== Suggested decision ===');
	if (pctDelta(legacyK, optK) < 0.5) {
		console.log('  Optimized log matches legacy Kabbik total — safe default: USER_REPORT_ACTIVE_SOURCE=log');
	} else {
		console.log('  WARNING: optimized log differs from legacy — investigate before deploy');
	}
	if (pctDelta(legacyK, usersK) <= 0.5) {
		console.log('  Users table matches legacy within 0.5% — optional: USER_REPORT_ACTIVE_SOURCE=users');
	} else {
		console.log(`  Users table drift ${pctDelta(legacyK, usersK).toFixed(2)}% — prefer log path unless product accepts`);
	}
	console.log('\nRecord decision in docs/perf/user-report-baseline.md');
}

main().catch(err => {
	console.error('[validate-user-report] failed', err);
	process.exit(1);
});
