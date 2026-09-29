import RoleModel from '../models/role-model';
class RoleController {
	async getRole() {
		try {
			const results = await RoleModel.roleList();
			return results;
		} catch (err) {
			throw err;
		}
	}
}

export default new RoleController();
