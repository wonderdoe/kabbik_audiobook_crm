/**
 * PGW facts are populated by the same builder as subscription backfill.
 * Usage: node scripts/backfill-daily-pgw-revenue.js [daysBack=90]
 */
import dotenv from 'dotenv';
import moment from 'moment';
import { buildDailyRevenueFacts } from '../src/server/jobs/revenue-daily-facts.js';

dotenv.config({ path: '.env' });

const daysBack = Math.max(1, Number(process.argv[2]) || 90);

async function main() {
	for (let i = 1; i <= daysBack; i++) {
		const day = moment().subtract(i, 'days').format('YYYY-MM-DD');
		await buildDailyRevenueFacts(day);
		if (i % 10 === 0 || i === daysBack) {
			console.log(`[backfill-pgw] ${i}/${daysBack} through ${day}`);
		}
	}
	console.log('[backfill-pgw] done');
	process.exit(0);
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
