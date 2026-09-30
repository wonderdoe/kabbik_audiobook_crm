import DB from '../../../server/config/db.js';

class UserAdminModel {
	async findAdminByEmail(email) {
		try {
			const sql = 'SELECT * FROM user_admin WHERE email = ?';
			const sqlRresponse = await DB.query(sql, [email]);
			const response = sqlRresponse[0];
			const permissionsSql = 'SELECT * FROM user_permission WHERE userId = ?;';
			const permissionsResponse = await DB.query(permissionsSql, [sqlRresponse[0].id]);
			if (permissionsResponse && permissionsResponse.length > 0) {
				response.permissions = permissionsResponse[0];
			}
			return response;
		} catch (error) {}
	}

	async createUser(payload) {
		
		try {
			const sql = 'INSERT INTO user_admin (name, email, password,phone_no,role_id) VALUES (?,?,?,?,?);';
			const sqlRresponse = await DB.query(sql, [payload.name, payload.email, payload.password,payload.phone_no,payload.role_id]);
			const response = sqlRresponse;
			return response;
		} catch (error) {
			return error
		}
	}
	async getUser(){
		try {
			 const sql = 'SELECT *, NULL AS password FROM user_admin';
			 const sqlRresponse = await DB.query(sql);

			const response = sqlRresponse;
			return response;
		} catch (error) {
			return error.sqlMessage
		}
	}

	async logOut(cookie){

		try {
			
			return cookie;
		} catch (error) {
			return error.sqlMessage
		}
	}
}

export default new UserAdminModel();
