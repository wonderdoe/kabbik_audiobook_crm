import DB from '../../../server/config/db.js';

class FeaturedModel {
	
	tableName = 'homepage_data';
	getFeatured = async () => {
		try {
			const sql = `SELECT  audiobooks.thumb_path, audiobooks.name, audiobooks.author_name,homepage_data.audiobook_id,homepage_data.status, homepage_data.created_at
             FROM audiobooks 
             JOIN homepage_data ON audiobooks.id = homepage_data.audiobook_id
             WHERE homepage_data.track_key = "popular_book"         
             ORDER BY homepage_data.created_at DESC`;

			const data = await DB.query(sql);

			return data;
		} catch (error) {
			console.error(error);
			throw error; 
		}
	};

	addFeatureBanner = async (audiobook_id) => {
		
		
		try {
			const track_key = "popular_book";
			const sql = "INSERT INTO homepage_data (track_key, status, audiobook_id) VALUES (?, 0, ?)";
			const data = await DB.query(sql, [track_key, audiobook_id]);
			return data;
		} catch (error) {
			console.log(error);
			throw error;
		}
	};
	
	

	toggleFeatureImage = async (audiobook_id, status) => {
		
		try {
			const sql = `UPDATE homepage_data SET status = CASE WHEN status = 0 THEN 1 WHEN status = 1 THEN 0 ELSE status END WHERE audiobook_id = ?`;
			const data = await DB.query(sql, [audiobook_id]);
			return data;
		} catch (error) {
			console.log(error);
			throw error;
		}
	};
	
	
	
}

export default new FeaturedModel();
