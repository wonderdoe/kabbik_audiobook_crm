import BookRequestModel from '../models/bookrequest-model';
class BookRequestController {
	async getBookList(offset, limit) {
		try {
			const results = await BookRequestModel.getBookList(offset, limit);
			return results;
		} catch (error) {
			return error;
		}
	}
}

export default new BookRequestController();

// module.exports = new RoleController();
