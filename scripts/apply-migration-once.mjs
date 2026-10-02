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
const statements = sql
	.replace(/--[^\n]*/g, '')
	.split(';')
	.map(s => s.trim())
	.filter(Boolean);

console.log('[migrate] host', process.env.DB_HOST, 'db', process.env.DB_DATABASE);
console.log('[migrate] applying', path.basename(sqlPath), `(${statements.length} statements)`);

for (const stmt of statements) {
	try {
		await DB.query(stmt);
		console.log('[migrate] ok', stmt.slice(0, 72).replace(/\s+/g, ' ') + '…');
	} catch (err) {
		if (err.code === 'ER_DUP_KEYNAME') {
			console.log('[migrate] skip (index exists)', err.sqlMessage);
			continue;
		}
		throw err;
	}
}

console.log('[migrate] done');
process.exit(0);
