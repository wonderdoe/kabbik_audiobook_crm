import AudioBookCategoryModel from '../models/audioBookCategoryModel';
export const dynamic = 'force-dynamic';
class AudioBookCategoryController {
	async getCategory() {
		try {
			const results = await AudioBookCategoryModel.getCategory();
			return results;
		} catch (error) {
			console.error(error);
			return [];
		}
	}

	async getCategoryForSingleAudiobook(audiobookId) {
		const data = await AudioBookCategoryModel.getCategoryForSingleAudiobook(audiobookId);
		return data;
	}
}

export default new AudioBookCategoryController();

// module.exports = new RoleController();
