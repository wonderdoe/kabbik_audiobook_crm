/**
 * Compare Redis-related env between local shell and worker bootstrap.
 * Usage: node scripts/check-cache-env.mjs
 */
import './load-env.mjs';

const keys = [
	'REDIS_ENV',
	'CACHE_ENABLED',
	'REDIS_HOST',
	'REDIS_PORT',
	'REDIS_DB',
	'REDIS_STAGING_HOST',
	'REDIS_STAGING_PORT',
	'REDIS_STAGING_DB',
];

console.log('[check-cache-env] Redis/cache variables (values redacted where secret):');
for (const k of keys) {
	const v = process.env[k];
	if (v === undefined) {
		console.log(`  ${k}=<unset>`);
	} else if (/PASSWORD|SECRET/i.test(k)) {
		console.log(`  ${k}=<set>`);
	} else {
		console.log(`  ${k}=${v}`);
	}
}

console.log('\nWorker: pm2 status crm-worker');
console.log('Health: GET /api/routes/cache-health');
