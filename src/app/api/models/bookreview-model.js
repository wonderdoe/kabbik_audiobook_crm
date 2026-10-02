import DB from '../../../server/config/db.js';

class ReviewModel {
	reviewList = async (offset, limit, search = '') => {
		try {
			const term = String(search ?? '').trim();
			const searchClause = term
				? ' WHERE (ra.name LIKE ? OR u.full_name LIKE ? OR ra.review LIKE ?)'
				: '';
			const searchParams = term ? [`%${term}%`, `%${term}%`, `%${term}%`] : [];

			const baseFrom = `
             FROM (
                 SELECT r.*, a.name, a.thumb_path
                 FROM ratings r
                 LEFT JOIN audiobooks a ON r.audiobook_id = a.id
                 WHERE r.review IS NOT NULL AND r.review != ''
             ) ra
             LEFT JOIN users u ON ra.user_id = u.id`;

			const sql = `SELECT ra.*, u.full_name${baseFrom}${searchClause} ORDER BY ra.created_at DESC LIMIT ? OFFSET ?`;
			const sql2 = `SELECT COUNT(*) AS total_reviews${baseFrom}${searchClause}`;

			const data = await DB.query(sql, [...searchParams, Number(limit), Number(offset)]);
			const sqlRresponse2 = await DB.query(sql2, searchParams);
			const response = {
				data,
				total: sqlRresponse2[0].total_reviews,
			};
			return response;
		} catch (error) {
			console.error(error);
			return { data: [], total: 0 };
		}
	};

	deleteReview = async id => {
		try {
			const sql = `DELETE FROM ratings WHERE id = ?`;
			const result = await DB.query(sql, [id]);
			if (!result?.affectedRows) {
				return { deleted: false };
			}
			return { deleted: true };
		} catch (error) {
			console.log(error);
			throw error;
		}
	};
}

export default new ReviewModel();
