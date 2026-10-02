/**
 * Smoke-test worker static import graph without starting cron.
 * Usage: node scripts/verify-worker-imports.mjs
 */
import './load-env.mjs';

const modules = [
	'../src/server/jobs/dashboard.js',
	'../src/server/jobs/revenue-daily-facts.js',
	'../src/server/jobs/package-wise-daily-facts.js',
	'../src/server/jobs/cache-warm.js',
];

for (const spec of modules) {
	await import(spec);
	console.log('[verify-worker-imports] ok', spec);
}

console.log('[verify-worker-imports] all imports resolved');
process.exit(0);
