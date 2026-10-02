import '../scripts/load-env.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const sqlPath = path.join(root, 'db/migrations/2026-10-03-community-posts-permissions.sql');
const sql = fs
	.readFileSync(sqlPath, 'utf8')
	.replace(/--[^\n]*/g, '')
	.trim();

const targets = [
	{
		label: 'production',
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_DATABASE,
	},
	{
		label: 'staging',
		host: '192.168.7.14',
		port: 3304,
		user: 'admin',
		password: 'Kabbik_123',
		database: 'kabbik',
	},
];

for (const t of targets) {
	console.log(`[migrate] ${t.label} host=${t.host} db=${t.database}`);
	let conn;
	try {
		conn = await mysql.createConnection({
			host: t.host,
			port: t.port,
			user: t.user,
			password: t.password,
			database: t.database,
			ssl: t.label === 'production' ? { rejectUnauthorized: false } : undefined,
		});
		const [result] = await conn.query(sql);
		console.log(`[migrate] ${t.label} OK affectedRows=${result.affectedRows ?? result.changedRows ?? 'n/a'}`);
	} catch (err) {
		console.error(`[migrate] ${t.label} FAILED`, err.message);
		process.exitCode = 1;
	} finally {
		if (conn) await conn.end();
	}
}

process.exit(process.exitCode ?? 0);
