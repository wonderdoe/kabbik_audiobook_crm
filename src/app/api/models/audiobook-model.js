import DB from '../../../server/config/db.js';
const mysql = require('mysql2');


class AudioBookModel {
	tableName = 'audiobooks';
	async audioList(offset, limit) {
		try {
			const sql = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC
			LIMIT ${limit} OFFSET ${offset}`;

			const sql2 = `SELECT COUNT(*) as count FROM ${this.tableName}`;

			const data = await DB.query(sql);
			const sqlResponse2 = await DB.query(sql2);

			const response = {
				data,
				total: sqlResponse2[0],
			};

			return response;
		} catch (error) {
			throw new Error('Error fetching audio list: ' + error.message);
		}
	}

	async episodeList(audiobook_id) {
		try {
			const sql = `SELECT * FROM episodes WHERE audiobook_id = ?`;
			const data = await DB.query(sql, [audiobook_id]);
			return data;
		} catch (error) {
			// Handle error here if needed
			console.error('Error in episodeList:', error);
			throw error; // Rethrow error to be handled by caller
		}
	}
	async addEpisode(name, description, isfree, file_path) {
		try {
			const sql = `INSERT INTO episodes (name,description,isfree,file_path) VALUES (?, ?, ?,?)`;
			const sql1 = `INSERT INTO episodes (name,description,isfree,file_path) VALUES (${name},${description},${isfree},${file_path})`;

			// const data = await DB.query(sql, [name,description,isfree,file_path]);
			return sql1;
		} catch (error) {
			// Handle error here if needed
			console.error('Error in episodeList:', error);
			throw error; // Rethrow error to be handled by caller
		}
	}

	async editEpisode(bodyJSON) {
		try {
			const { name, path, bgm, audiobookId, episodeId, duration } = bodyJSON;
			const sql = `UPDATE episodes SET name = ?, file_path = ?, bgm_filepath = ?, duration = ? WHERE id = ? AND audiobook_id = ?`;
			const data = await DB.query(sql, [name, path, bgm, duration, episodeId, audiobookId]);
			return data;
		} catch (error) {
			// Handle error here if needed
			console.error('Error in editEpisode:', error);
			throw error; // Rethrow error to be handled by caller
		}
	}

	async updatePremium(id, premium, for_home,isSubRestricted=0) {
		try {
			const sql = `UPDATE audiobooks SET premium = CASE WHEN ? = '1' THEN 1 WHEN ? = '0' THEN 0 END, for_home = CASE WHEN ? = '1' THEN 1 WHEN ? = '0' THEN 0 END,
			isSubRestricted = ?  WHERE id = ?`;
			const data = await DB.query(sql, [premium, premium, for_home, for_home,isSubRestricted, id]);
			const formattedQuery = mysql.format(sql, [
				premium,
				premium,
				for_home,
				for_home,
				isSubRestricted,
				id
			  ]);
			  
			  console.log(formattedQuery);
			return data;
		} catch (error) {
			console.error('Error in updatePremiumAndFeatured:', error);
			throw error;
		}
	}

	async addAudiobook(name, description, author_name, price, en_name, thumb_path) {
		try {
			const sql = `INSERT INTO audiobooks (name, description, author_name, price, en_name, thumb_path) VALUES (?,?,?,?,?,?);`;
			// const data = await DB.query(sql, [
			// 	name,
			// 	description,
			// 	author_name,
			// 	price,
			// 	en_name,
			// 	thumb_path,
			// ]);

			return data;
		} catch (error) {
			console.error('Error in updatePremiumAndFeatured:', error);
			throw error;
		}
	}

	async editAudioBook(id, name, description, author_name, price, en_name, thumb_path) {
		try {
			const sql2 = `UPDATE ${this.tableName} SET name=?, description=?, author_name=?, price=?, en_name=?, thumb_path=? WHERE id=?;`;
			const data = await DB.query(sql2, [
				name,
				description,
				author_name,
				price,
				en_name,
				thumb_path,
				id,
			]);

			return data;
		} catch (error) {
			console.error('Error in updatePremiumAndFeatured:', error);
			throw error;
		}
	}

	async getFeaturedList(offset, limit) {
		try {
			const sql = `SELECT * FROM ${this.tableName} WHERE isFeatured = 1 ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

			const sql2 = `SELECT COUNT(*) as count FROM ${this.tableName}`;

			const data = await DB.query(sql);
			const sqlResponse2 = await DB.query(sql2);

			const response = {
				data,
				total: sqlResponse2[0],
			};
			return response;
		} catch (error) {
			console.error('Error in updatePremiumAndFeatured:', error);
			throw error;
		}
	}

	async getPodcastList(searchParams) {
		const { limit, offset } = searchParams;
		try {
			const sql = `SELECT * FROM ${this.tableName} WHERE podcast = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?`;
			const data = await DB.query(sql, [Number(limit), Number(offset)]);
			const totalQuery = `SELECT COUNT(*) AS total FROM ${this.tableName} WHERE podcast = 1`;
			const totalResult = await DB.query(totalQuery);
			return { result: data, total: totalResult[0].total };
		} catch (error) {
			console.error('Error in updatePremiumAndFeatured:', error);
			throw error;
		}
	}

	async getRentAudiobooks(searchParams) {
		try {
			const { limit, offset } = searchParams;
			const query = `
				SELECT * FROM audiobooks WHERE for_rent = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?
			`;
			const result = await DB.query(query, [Number(limit), Number(offset)]);
			const queryTotal = `SELECT COUNT(*) AS total FROM audiobooks WHERE for_rent = 1`;
			const resultTotal = await DB.query(queryTotal);
			return { result, total: resultTotal[0].total };
		} catch (err) {
			console.error(err);
			throw new Error('Error in model: getRentAudiobooks, ', err);
		}
	}

	async getPendingAudioList(searchParams) {
		try {
			const { limit, offset } = searchParams;
			const query = `SELECT * FROM audiobooks WHERE approval_status = 0 ORDER BY created_at DESC LIMIT ? OFFSET ?`;
			const queryTotal = `SELECT COUNT(*) AS total FROM audiobooks WHERE approval_status = 0`;
			const result = await DB.query(query, [Number(limit), Number(offset)]);
			const resultTotal = await DB.query(queryTotal);
			return { result, total: resultTotal[0].total };
		} catch (err) {
			console.error(err);
		}
	}

	async getRejectedAudioList(searchParams) {
		try {
			const { limit, offset } = searchParams;
			const query = `SELECT * FROM audiobooks WHERE approval_status = 2 ORDER BY created_at DESC LIMIT ? OFFSET ?`;
			const queryTotal = `SELECT COUNT(*) AS total FROM audiobooks WHERE approval_status = 2`;
			const result = await DB.query(query, [Number(limit), Number(offset)]);
			const resultTotal = await DB.query(queryTotal);
			return { result, total: resultTotal[0].total };
		} catch (err) {
			console.error(err);
		}
	}

	async updateForRent(id, for_rent) {
		try {
			const sql = `
				UPDATE audiobooks
				SET for_rent = CASE
						WHEN ? = '1' THEN 1
						WHEN ? = '0' THEN 0
					END
				WHERE ID = ?`;
			const data = await DB.query(sql, [for_rent, for_rent, id]);
			return data;
		} catch (error) {
			console.error('Error in updateForRent:', error);
			throw error;
		}
	}

	async updateApprovalStatus(id, action) {
		try {
			let value;
			if (action === 'approve') {
				value = 1;
			} else if (action === 'reject') {
				value = 2;
			} else {
				return null;
			}
			const query = `UPDATE audiobooks SET approval_status = ? WHERE id = ?`;
			const result = await DB.query(query, [value, id]);
			return {
				message: action === 'approve' ? 'Audiobook approved' : 'Audiobook rejected',
				status: 200,
			};
		} catch (err) {
			console.error(err);
			return false;
		}
	}

	async delete(id) {
		try {
			const query = `DELETE FROM audiobooks WHERE id = ?`;
			const result = await DB.query(query, [Number(id)]);
			return true;
		} catch (err) {
			console.error(err);
			return false;
		}
	}

	async getSearchedAudiobooks(searchQuery) {
		try {
			const query = `
				SELECT * FROM audiobooks
				WHERE name LIKE CONCAT('%', ?, '%')
					OR en_name LIKE CONCAT('%', ?, '%')
					OR description LIKE CONCAT('%', ?, '%')
					OR author_name LIKE CONCAT('%', ?, '%')
					OR contributing_artists LIKE CONCAT('%', ?, '%')
			`;
			const result = await DB.query(query, [
				searchQuery,
				searchQuery,
				searchQuery,
				searchQuery,
				searchQuery,
				searchQuery,
				searchQuery,
			]);
			return result;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}
}

export default new AudioBookModel();
