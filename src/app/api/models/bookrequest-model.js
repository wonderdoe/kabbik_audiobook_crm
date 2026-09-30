import DB from '../../../server/config/db.js';

class BookRequestModel {
	tableName = 'bookRequest';
	getBookList = async (offset, limit) => {
		try {
			const sql = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC
			LIMIT ${limit} OFFSET ${offset}`;

			const sql2 = `SELECT COUNT(*) as count FROM ${this.tableName}`;
			const data = await DB.query(sql);
			const sqlRresponse2 = await DB.query(sql2);

			const response = {
				data,
				total: sqlRresponse2[0],
			};
			return response;
		} catch (error) {
			console.log(error);
			return error;
		}
	};
}

export default new BookRequestModel();
