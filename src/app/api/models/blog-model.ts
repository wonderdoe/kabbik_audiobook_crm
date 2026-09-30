import DB from '@/server/config/db.js';

class BlogModel {
	getBlogs = async () => {
		try {
			const query = `SELECT * FROM blogs ORDER BY created_at DESC`;
			const result = await DB.query(query);
			return result;
		} catch (err) {
			console.error(err);
			throw err;
		}
	};
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new BlogModel();
