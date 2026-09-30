import DB from '../../../server/config/db.js';
export const dynamic = 'force-dynamic';
class CategotyModel {
	tableName = 'categories';
	categotyUpdate = async (id, name, thumb_path) => {
		try {
			const sql = `UPDATE ${this.tableName} SET name=?,thumb_path=? WHERE id=?`;
			const sqlRresponse = await DB.query(sql, [name, thumb_path, id]);
			return sqlRresponse;
		} catch (error) {
			console.log(error);
		}
	};
	categotyAdd = async (name, thumb_path, priority) => {
		try {
			const sql = `INSERT INTO ${this.tableName} (name,thumb_path,priority) VALUES (?,?,?)`;

			const sqlRresponse = await DB.query(sql, [name, thumb_path, priority]);
			return sqlRresponse;
		} catch (error) {
			console.log(error);
		}
	};

	// DELETE FROM `kabbik`.`categories` WHERE (`id` = '43');

	categoryDelete = async id => {
		try {
			const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
			const sqlResponse = await DB.query(sql, [id]);

			// Check if any rows were affected by the deletion
			if (sqlResponse.affectedRows > 0) {
				return sqlResponse;
			} else {
				return sqlResponse;
			}
		} catch (error) {
			console.log(error);
			return { success: false, message: 'An error occurred while deleting the category.' };
		}
	};

	priorityUpdate = async (id, priority) => {
		try {
			const sql = `UPDATE ${this.tableName} SET priority=${priority} WHERE id=${id}`;
			const sqlResponse = await DB.query(sql, [priority, id]);

			return sqlResponse;
		} catch (error) {
			console.log(error);
			return { success: false, message: 'An error occurred while deleting the category.' };
		}
	};
}

export default new CategotyModel();
