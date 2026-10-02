import DB from '../../../server/config/db.js';

export const dynamic = 'force-dynamic';

class ArtistModel {
	tableName = 'cast_crew';

	getArtists = async (offset = 0, limit = 1000, search = '') => {
		try {
			let whereClause = '';
			const params = [];
			if (search) {
				whereClause = `WHERE (name LIKE ? OR en_name LIKE ?)`;
				params.push(`%${search}%`, `%${search}%`);
			}
			const sql = `SELECT * FROM ${this.tableName} ${whereClause} ORDER BY created_at DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;
			const sql2 = `SELECT COUNT(*) as count FROM ${this.tableName} ${whereClause}`;
			const data = await DB.query(sql, params);
			const total = await DB.query(sql2, params);
			return { data, total: total[0] };
		} catch (error) {
			console.log(error);
		}
	};

	addArtist = async (name, en_name, imageUrl) => {
		try {
			const sql = `INSERT INTO ${this.tableName} (name, en_name, imageUrl) VALUES (?, ?, ?)`;
			const data = await DB.query(sql, [name, en_name, imageUrl]);
			return data;
		} catch (error) {
			console.error('Error while inserting contributor:', error);
			throw error;
		}
	};

	editArtist = async (id, name, en_name, imageUrl) => {
		try {
			const sql = `UPDATE ${this.tableName} SET name=?, en_name=?, imageUrl=? WHERE id=?`;
			const data = await DB.query(sql, [name, en_name, imageUrl, id]);
			return data;
		} catch (error) {
			console.error('Error while updating contributor:', error);
			throw error;
		}
	};
}

export default new ArtistModel();
