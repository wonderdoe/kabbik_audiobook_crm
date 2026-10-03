import mysql from 'mysql2';

class DB {
	constructor() {
		this.db = mysql.createPool({
			host: process.env.DB_HOST,
			port: process.env.DB_PORT,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_DATABASE,
		});

		this.db.getConnection((error, connection) => {
			if (error) {
				if (error.code === 'PROTOCOL_CONNECTION_LOST') {
					console.error('Database connection was closed.');
				}
				if (error.code === 'ER_CON_COUNT_ERROR') {
					console.error('Database has too many connections.');
				}
				if (error.code === 'ECONNREFUSED') {
					console.error('Database connection was refused.');
				}
			}
			if (connection) connection.release();
			return;
		});
	}
	query = async (sql, values) => {
		return new Promise((resolve, reject) => {
			const callback = (error, result) => {
				if (error) {
					reject(error);
					return;
				}
				resolve(result);
			};
			this.db.query(sql, values, callback);
		}).catch(err => {
			throw err;
		});
	};

	withTransaction = async fn => {
		const connection = await new Promise((resolve, reject) => {
			this.db.getConnection((error, conn) => {
				if (error) reject(error);
				else resolve(conn);
			});
		});

		const queryOnConnection = (sql, values) =>
			new Promise((resolve, reject) => {
				connection.query(sql, values, (error, result) => {
					if (error) reject(error);
					else resolve(result);
				});
			});

		try {
			await new Promise((resolve, reject) => {
				connection.beginTransaction(error => {
					if (error) reject(error);
					else resolve();
				});
			});
			const result = await fn(queryOnConnection);
			await new Promise((resolve, reject) => {
				connection.commit(error => {
					if (error) reject(error);
					else resolve();
				});
			});
			return result;
		} catch (error) {
			await new Promise(resolve => {
				connection.rollback(() => resolve());
			});
			throw error;
		} finally {
			connection.release();
		}
	};
}

export default new DB();
