import DB from '../../../server/config/db';


export const dynamic = 'force-dynamic';

class AuthorModel {
	tableName = 'authors';
	getAuthor = async (offset, limit) => {
		try {
			const sql = `SELECT * FROM ${this.tableName} where isActive = 1 order by created_at desc LIMIT ${limit} OFFSET ${offset} `;
			const sql2 = `SELECT COUNT(*) as count FROM ${this.tableName} where isActive = 1`;
			const data = await DB.query(sql);
			const sqlRresponse2 = await DB.query(sql2);

			const results = {
				data,
				total: sqlRresponse2[0],
			};

			return results;
		} catch (error) {
			console.log(error);
		}
	};

	getAuthorList = async () => {
		try {
			const sql = `SELECT * FROM ${this.tableName} where isActive = 1 order by created_at desc limit 1000`;		
			const data = await DB.query(sql);
			console.log('Author data:', data.length);
			return data;
		} catch (error) {
			console.log(error);
		}
	};
	addAuthor = async (name, description, imageUrl, en_name) => {
		try {
			const sql = `INSERT INTO ${this.tableName} (name, description, en_name, imageUrl, isActive) VALUES (?, ?, ?, ?, 1);`;
			const data = await DB.query(sql, [name, description, en_name, imageUrl]);

			return data;
		} catch (error) {
			console.error('Error while inserting data:', error);
			throw error; // Re-throw the error to handle it in the caller function if needed
		}
	};

	editAuthor = async (name, description, imageUrl, en_name, id) => {
		try {
			const sql = `UPDATE ${this.tableName} SET name=?, description=?, en_name=?, imageUrl=?, isActive=1 WHERE id = ?`;
			const data = await DB.query(sql, [name, description, en_name, imageUrl, id]);
			return data;
		} catch (error) {
			console.error('Error while updating data:', error);
			throw error;
		}
	};
	
}

export default new AuthorModel();
