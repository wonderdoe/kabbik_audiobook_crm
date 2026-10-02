import BookRequestModel from '../models/bookrequest-model';
class BookRequestController {
	async getBookList(offset, limit, search = '') {
		try {
			const results = await BookRequestModel.getBookList(offset, limit, search);
			return results;
		} catch (error) {
			return error;
		}
	}
}

export default new BookRequestController();

// module.exports = new RoleController();
