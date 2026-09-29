import DB from '../../../server/config/db';

const VALID_AUDIENCES = ['all', 'free', 'premium'];

class PromotionBannerModel {
	tableName = 'promotion_banners';

	parsePayload = row => {
		if (!row) {
			return row;
		}

		if (row.payload && typeof row.payload === 'string') {
			try {
				row.payload = JSON.parse(row.payload);
			} catch {
				row.payload = null;
			}
		}

		return row;
	};

	listBanners = async isActive => {
		let sql = `SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL`;
		const values = [];

		if (isActive !== null && isActive !== undefined && isActive !== '') {
			sql += ' AND is_active = ?';
			values.push(isActive === 'true' || isActive === '1' || isActive === 1 || isActive === true ? 1 : 0);
		}

		sql += ' ORDER BY created_at DESC';

		const data = await DB.query(sql, values);
		return data.map(this.parsePayload);
	};

	getBannerById = async id => {
		const sql = `SELECT * FROM ${this.tableName} WHERE id = ? AND deleted_at IS NULL`;
		const data = await DB.query(sql, [id]);
		return data[0] ? this.parsePayload(data[0]) : null;
	};

	createBanner = async ({ banner_url, goto_page, is_active = 1, payload = null, target_audience = 'all' }) => {
		const sql = `INSERT INTO ${this.tableName}
			(banner_url, goto_page, is_active, payload, target_audience)
			VALUES (?, ?, ?, ?, ?)`;

		const payloadValue = payload ? JSON.stringify(payload) : null;
		const result = await DB.query(sql, [banner_url, goto_page, is_active, payloadValue, target_audience]);
		return this.getBannerById(result.insertId);
	};

	updateBanner = async (id, fields) => {
		const allowedFields = ['banner_url', 'goto_page', 'is_active', 'payload', 'target_audience'];
		const updates = [];
		const values = [];

		allowedFields.forEach(field => {
			if (fields[field] !== undefined) {
				updates.push(`${field} = ?`);
				if (field === 'payload') {
					values.push(fields[field] ? JSON.stringify(fields[field]) : null);
				} else {
					values.push(fields[field]);
				}
			}
		});

		if (updates.length === 0) {
			return null;
		}

		const sql = `UPDATE ${this.tableName} SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
		values.push(id);

		await DB.query(sql, values);
		return this.getBannerById(id);
	};

	toggleBanner = async id => {
		const banner = await this.getBannerById(id);
		if (!banner) {
			return null;
		}

		const nextStatus = banner.is_active === 1 ? 0 : 1;
		const sql = `UPDATE ${this.tableName} SET is_active = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
		await DB.query(sql, [nextStatus, id]);
		return this.getBannerById(id);
	};

	softDeleteBanner = async id => {
		const sql = `UPDATE ${this.tableName} SET deleted_at = NOW(), updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
		const result = await DB.query(sql, [id]);
		return result.affectedRows > 0;
	};

	isValidAudience = value => VALID_AUDIENCES.includes(value);
}

export default new PromotionBannerModel();
