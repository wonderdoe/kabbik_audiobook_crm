import DB from '../../../server/config/db.js';

class UpcomingModel {
	getUpcoming = async () => {
		try {
			const query = `SELECT * FROM upcoming WHERE deleted = 0 order by id desc;`;
			const result = await DB.query(query);
			return result;
		} catch (error) {
			console.log(error);
		}
	};

	addUpcoming = async bodyJSON => {
		try {
			const { name, description, authorName, price, imagePath } = bodyJSON;
			const query = `INSERT INTO upcoming (name, description, author, price, thumbPath, deleted) VALUES (?, ?, ?, ?, ?, 0)`;
			const result = await DB.query(query, [name, description, authorName, price, imagePath]);
			if (result.affectedRows === 1) {
				return { message: 'Added upcoming audiobook', statusCode: 201 };
			}
			return { message: "Couldn't add upcoming audiobook", statusCode: 400 };
		} catch (error) {
			console.log(error);
			throw error;
		}
	};

	updateUpcoming = async bodyJSON => {
		try {
			const { id, name, description, authorName, price, imagePath } = bodyJSON;
			const query = `UPDATE upcoming SET name = ?, description = ?, author = ?, price = ?, thumbPath = ? WHERE id = ?`;
			const result = await DB.query(query, [name, description, authorName, price, imagePath, id]);
			if (result.affectedRows === 1) {
				return { message: 'Updated upcoming audiobook', statusCode: 200 };
			}
			return { message: "Couldn't update upcoming audiobook", statusCode: 400 };
		} catch (error) {
			console.erroror(error);
			throw error;
		}
	};

	deleteUpcoming = async id => {
		try {
			const sql = `UPDATE upcoming SET deleted = 1 WHERE id = ?`;
			const sqlRresponse = await DB.query(sql, [id]);
			if (sqlRresponse.affectedRows === 1) {
				return { message: 'Deleted upcoming audiobook', statusCode: 200 };
			}
			return { message: "Couldn't delete upcoming audiobook", statusCode: 400 };
		} catch (error) {
			console.log(error);
			throw error;
		}
	};
}

export default new UpcomingModel();
