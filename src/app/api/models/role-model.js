import DB from '../../../server/config/db';

class RoleModel {
	tableName = 'user_role';
	roleList = async () => {
		try {
			const query = `SELECT * FROM ${this.tableName}`;
			const result = await DB.query(query);
			return result;
		} catch (err) {
			throw err;
		}
	};
}

export default new RoleModel();
