import DB from '../../../server/config/db';

class PopupModel {
	tableName = 'homepage_data';
	popupList = async () => {
		try {
			const sql = `SELECT * FROM ${this.tableName} where track_key="home_ad"`;
			const sqlRresponse = await DB.query(sql);
			return sqlRresponse;
		} catch (error) {
			console.log(error);
		}
	};
	// const sql = `UPDATE ${this.tableName} SET status = CASE WHEN ? = '1' THEN 1 WHEN ? = '0' THEN 0 END WHERE ID = ? and track_key="home_ad"`;
			// const sql2 = `UPDATE ${this.tableName} SET status = 0 WHERE ID != ? and track_key="home_ad"`;
	togglePopUp = async (id, bodyreq) => {
		try {
			const sql3 = `UPDATE ${this.tableName} SET status = ?  WHERE track_key = "home_ad" AND id = ?`;
			const deactivateSql = `UPDATE ${this.tableName} SET status = 0  WHERE track_key = "home_ad" AND id != ?`;
			const data = await DB.query(sql3, [
				bodyreq.status,id
			]);

			const deactivate = await DB.query(deactivateSql, [
				id
			]);
			

			return data;
		} catch (error) {
			console.log(error);
		}
	};

	updatePopUpImage = async (id, image_url) => {
		try {
			const sql = `UPDATE  ${this.tableName} SET home_ad_image = ? WHERE id = ?;`;
			const data = await DB.query(sql, [image_url, id]);

			
			return data;
		} catch (error) {
			
			throw error;
		}
	};

	removePopUpImage = async (id, image_url) => {
		try {
			const sql = `UPDATE  ${this.tableName} SET home_ad_image = ? WHERE id = ?;`;
			const data = await DB.query(sql, [null, id]);

			
			return data;
		} catch (error) {
			
			throw error;
		}
	};

	addPopUp = async (home_ad_type, home_ad_image, audiobook_id) => {
		try {
			let sql;
			let params = [];

			if (home_ad_type === 'AUDIOBOOK') {
				if (!audiobook_id) {
					throw new Error('audiobook_id is required for AUDIOBOOK type');
				}
				sql = `INSERT INTO homepage_data (home_ad_type, home_ad_image, audiobook_id, status, track_key,version) VALUES (?, ?, ?, 0, 'home_ad',1)`;
				params = [home_ad_type, home_ad_image, audiobook_id];
			} else {
				sql = `INSERT INTO homepage_data (home_ad_type, home_ad_image, status, track_key,version) VALUES (?, ?, 0, 'home_ad',1)`;
				params = [home_ad_type, home_ad_image];
			}

			const sqlResponse = await DB.query(sql, params);
			return sqlResponse;
		} catch (error) {
			console.log(error);
			return error.message;
		}
	};
}

export default new PopupModel();
