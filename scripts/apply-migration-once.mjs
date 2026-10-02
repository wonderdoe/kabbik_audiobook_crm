import '../scripts/load-env.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import DB from '../src/server/config/db.js';

const file = process.argv[2];
if (!file) {
	console.error('Usage: node scripts/apply-migration-once.mjs <path-to.sql>');
	process.exit(1);
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const sqlPath = path.isAbsolute(file) ? file : path.join(root, file);
const sql = fs.readFileSync(sqlPath, 'utf8');
const stmt = sql.replace(/--[^\n]*/g, '').trim();

console.log('[migrate] host', process.env.DB_HOST, 'db', process.env.DB_DATABASE);
console.log('[migrate] applying', path.basename(sqlPath));
await DB.query(stmt);
const rows = await DB.query('SHOW TABLES LIKE ?', ['daily_package_revenue_stats']);
console.log('[migrate] OK', rows);
process.exit(0);
