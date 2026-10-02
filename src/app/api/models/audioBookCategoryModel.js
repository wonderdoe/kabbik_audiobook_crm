import DB from '../../../server/config/db.js';
export const dynamic = 'force-dynamic';


class AudioBookCategoryModel {
	getCategory = async () => {
		try {
			const sql = `SELECT * FROM categories order by priority asc`;
			const sqlRresponse = await DB.query(sql);
			return sqlRresponse;
		} catch (error) {
			console.error(error);
			return [];
		}
	};

	getCategoryForSingleAudiobook = async audiobookId => {
		try {
			const query = `SELECT category_id FROM categories_audiobooks WHERE audiobook_id = ?`;
			const result = await DB.query(query, [audiobookId]);
			return result.map(item => item.category_id);
		} catch (err) {
			console.error(err);
			return undefined;
		}
	};
}

export default new AudioBookCategoryModel();
