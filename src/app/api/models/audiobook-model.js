import DB from '../../../server/config/db.js';
import {
	BGM_SELECT,
	buildAudiobookWhereClause,
	parseAudiobookListParams,
} from '../utils/audiobook-query-schema.js';
const mysql = require('mysql2');

class AudioBookModel {
	tableName = 'audiobooks';

	async _listAudiobooks(filters, { paginate = true } = {}) {
		const { whereSql, queryParams } = buildAudiobookWhereClause(filters);

		const countSql = `SELECT COUNT(*) AS count FROM ${this.tableName} a WHERE ${whereSql}`;
		const countRows = await DB.query(countSql, queryParams);
		const total = countRows[0]?.count ?? 0;

		let dataSql = `SELECT a.*, ${BGM_SELECT} FROM ${this.tableName} a WHERE ${whereSql} ORDER BY a.created_at DESC`;
		const dataParams = [...queryParams];

		if (paginate) {
			dataSql += ` LIMIT ? OFFSET ?`;
			dataParams.push(Number(filters.limit), Number(filters.offset));
		} else {
			dataSql += ` LIMIT ?`;
			dataParams.push(Number(filters.limit));
		}

		const data = await DB.query(dataSql, dataParams);
		return { data, total };
	}

	async audioList(searchParams) {
		try {
			const parsed = parseAudiobookListParams(searchParams);
			if (parsed.error) {
				throw new Error(`Invalid audiobook list params: ${parsed.error}`);
			}
			const { data, total } = await this._listAudiobooks(parsed.filters, { paginate: true });
			return {
				data,
				total: { count: total },
			};
		} catch (error) {
			throw new Error('Error fetching audio list: ' + error.message);
		}
	}

	async audioListExport(searchParams) {
		try {
			const parsed = parseAudiobookListParams(searchParams, { forExport: true });
			if (parsed.error) {
				throw new Error(`Invalid audiobook export params: ${parsed.error}`);
			}
			const { data, total } = await this._listAudiobooks(parsed.filters, { paginate: false });
			return { data, total, capped: total > parsed.filters.limit };
		} catch (error) {
			throw new Error('Error exporting audio list: ' + error.message);
		}
	}

	async _tabList(searchParams, tab) {
		const merged = { ...searchParams, tab };
		const parsed = parseAudiobookListParams(merged);
		if (parsed.error) {
			throw new Error(`Invalid audiobook list params: ${parsed.error}`);
		}
		const { data, total } = await this._listAudiobooks(parsed.filters, { paginate: true });
		return { result: data, total };
	}

	async getPodcastList(searchParams) {
		try {
			return await this._tabList(searchParams, 'podcasts');
		} catch (error) {
			console.error('Error in getPodcastList:', error);
			throw error;
		}
	}

	async getRentAudiobooks(searchParams) {
		try {
			return await this._tabList(searchParams, 'rent');
		} catch (err) {
			console.error(err);
			throw new Error('Error in getRentAudiobooks', err);
		}
	}

	async getPendingAudioList(searchParams) {
		try {
			return await this._tabList(searchParams, 'pending');
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	async getRejectedAudioList(searchParams) {
		try {
			return await this._tabList(searchParams, 'rejected');
		} catch (err) {
			console.error(err);
			throw new Error('Error occurred when fetching rejected audiobooks');
		}
	}

	async episodeList(audiobook_id) {
		try {
			const sql = `SELECT * FROM episodes WHERE audiobook_id = ?`;
			const data = await DB.query(sql, [audiobook_id]);
			return data;
		} catch (error) {
			console.error('Error in episodeList:', error);
			throw error;
		}
	}
	async addEpisode(name, description, isfree, file_path) {
		try {
			const sql = `INSERT INTO episodes (name,description,isfree,file_path) VALUES (?, ?, ?,?)`;
			const sql1 = `INSERT INTO episodes (name,description,isfree,file_path) VALUES (${name},${description},${isfree},${file_path})`;

			return sql1;
		} catch (error) {
			console.error('Error in episodeList:', error);
			throw error;
		}
	}

	async editEpisode(bodyJSON) {
		try {
			const { name, path, bgm, audiobookId, episodeId, duration } = bodyJSON;
			const sql = `UPDATE episodes SET name = ?, file_path = ?, bgm_filepath = ?, duration = ? WHERE id = ? AND audiobook_id = ?`;
			const data = await DB.query(sql, [name, path, bgm, duration, episodeId, audiobookId]);
			return data;
		} catch (error) {
			console.error('Error in editEpisode:', error);
			throw error;
		}
	}

	async updatePremium(id, premium, for_home, isSubRestricted = 0) {
		try {
			const sql = `UPDATE audiobooks SET premium = CASE WHEN ? = '1' THEN 1 WHEN ? = '0' THEN 0 END, for_home = CASE WHEN ? = '1' THEN 1 WHEN ? = '0' THEN 0 END,
			isSubRestricted = ?  WHERE id = ?`;
			const data = await DB.query(sql, [premium, premium, for_home, for_home, isSubRestricted, id]);
			const formattedQuery = mysql.format(sql, [
				premium,
				premium,
				for_home,
				for_home,
				isSubRestricted,
				id,
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
			const parsed = parseAudiobookListParams(
				{ search: searchQuery, tab: 'all' },
				{ forExport: true },
			);
			if (parsed.error) {
				throw new Error(parsed.error);
			}
			const { data } = await this._listAudiobooks(parsed.filters, { paginate: false });
			return data;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}
}

export default new AudioBookModel();
