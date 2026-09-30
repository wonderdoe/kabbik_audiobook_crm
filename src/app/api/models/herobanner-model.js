import DB from '../../../server/config/db.js';

class HeroBannerModel {
	tableName = 'home_banner_controller';
	bannerList = async (offset, limit) => {
		try {
			const sql = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
			const sql2 = `SELECT COUNT(*) as count FROM ${this.tableName}`;

			const data = await DB.query(sql);
			const sqlResponse2 = await DB.query(sql2);

			const response = {
				data,
				total: sqlResponse2[0],
			};
			return response;
		} catch (error) {
			console.log(error);
		}
	};

	uploadBannerImg = async (id, image_url) => {
		try {
			const sql = `UPDATE  ${this.tableName} SET image_url = ? WHERE id = ?;`;
			const data = await DB.query(sql, [image_url, id]);
			return data;
		} catch (error) {
			console.log(error);
			throw error;
		}
	};

	deleteBannerModel = async id => {
		try {
			const sql = `DELETE FROM ${this.tableName} WHERE id=?`;
			const data = await DB.query(sql, [id]);
			return data;
		} catch (error) {
			console.log(error);
			throw error;
		}
	};

	addHeroBannerList = async (image_url, title, audiobook_id) => {
		let route;
		try {
			if (title == 'audiobook') {
				route = 'audiobook_route';
			} else {
				route = 'subscription_route';
			}
			const sql = `INSERT INTO home_banner_controller (image_url, title,route, status,version, audiobook_id) VALUES (?, ?,?, ?,2 ,?)`;
			const data = await DB.query(sql, [image_url, title, route, 0, audiobook_id]);

			return data;
		} catch (error) {
			console.log(error);
		}
	};

	toggleHeroBanner = async (audiobook_id, status) => {
		try {
			const sql = `UPDATE  ${this.tableName} SET status = ?  WHERE audiobook_id = ?;`;
			const data = await DB.query(sql, [status, audiobook_id]);
			return data;
		} catch (error) {
			console.log(error);
			throw error;
		}
	};
}

export default new HeroBannerModel();
