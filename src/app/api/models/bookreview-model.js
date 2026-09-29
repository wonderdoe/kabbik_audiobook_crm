import DB from '../../../server/config/db';

class ReviewModel {
	reviewList = async (offset, limit) => {
		try {
			// const sql = `select  ra.*, u.full_name from (SELECT r.*,a.name, a.thumb_path FROM ratings r left join audiobooks a on r.audiobook_id = a.id  order by r.created_at desc) ra left join users u on ra.user_id = u.id  ORDER BY ra.created_at DESC
			// LIMIT ${limit} OFFSET ${offset}`

			const sql = `SELECT ra.*, u.full_name
             FROM (
                 SELECT r.*, a.name, a.thumb_path
                 FROM ratings r
                 LEFT JOIN audiobooks a ON r.audiobook_id = a.id
                 WHERE r.review IS NOT NULL AND r.review != ''
                 ORDER BY r.created_at DESC
             ) ra
             LEFT JOIN users u ON ra.user_id = u.id
             ORDER BY ra.created_at DESC
             LIMIT ${limit} OFFSET ${offset}`;

			const sql2 = `
							SELECT COUNT(*) AS total_reviews
							FROM (
								SELECT r.*, a.name, a.thumb_path
								FROM ratings r
								LEFT JOIN audiobooks a ON r.audiobook_id = a.id
								WHERE r.review IS NOT NULL AND r.review != ''
								ORDER BY r.created_at DESC
							) ra
							LEFT JOIN users u ON ra.user_id = u.id
						`;
			const data = await DB.query(sql);
			const sqlRresponse2 = await DB.query(sql2);
			const response = {
				data,
				total: sqlRresponse2[0].total_reviews,
			};
			return response;
		} catch (error) {
			console.log(error);
		}
	};
}

export default new ReviewModel();
