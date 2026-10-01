import mysql from 'mysql2';

/** @type {import('mysql2').Pool} */
const POOL_KEY = '__kabbik_mysql_pool__';

function createPool() {
	return mysql.createPool({
		host: process.env.DB_HOST,
		port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_DATABASE,
		waitForConnections: true,
		connectionLimit: Number(process.env.DB_POOL_LIMIT) || 10,
		queueLimit: 0,
		maxIdle: 10,
		idleTimeout: 60_000,
		enableKeepAlive: true,
		keepAliveInitialDelay: 0,
	});
}

function getPool() {
	if (!globalThis[POOL_KEY]) {
		globalThis[POOL_KEY] = createPool();
	}
	return globalThis[POOL_KEY];
}

class DB {
	constructor() {
		this.db = getPool();
	}

	query = async (sql, values) => {
		return new Promise((resolve, reject) => {
			this.db.query(sql, values, (error, result) => {
				if (error) {
					reject(error);
					return;
				}
				resolve(result);
			});
		});
	};
}

export default new DB();
