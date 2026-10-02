import DB from '../../../server/config/db.js';

class BookRequestModel {
	tableName = 'bookRequest';
	getBookList = async (offset, limit, search = '') => {
		try {
			const term = String(search ?? '').trim();
			const searchClause = term
				? ' WHERE (name LIKE ? OR bookname LIKE ? OR writer LIKE ? OR language LIKE ? OR category LIKE ?)'
				: '';
			const searchParams = term
				? [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]
				: [];

			const sql = `SELECT * FROM ${this.tableName}${searchClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
			const sql2 = `SELECT COUNT(*) as count FROM ${this.tableName}${searchClause}`;

			const data = await DB.query(sql, [...searchParams, Number(limit), Number(offset)]);
			const sqlRresponse2 = await DB.query(sql2, searchParams);

			return {
				data,
				total: sqlRresponse2[0]?.count ?? 0,
			};
		} catch (error) {
			console.error(error);
			return { data: [], total: 0 };
		}
	};
}

export default new BookRequestModel();
