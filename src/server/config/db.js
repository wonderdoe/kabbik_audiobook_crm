const mysql = require('mysql2');
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
}

export default new DB();







