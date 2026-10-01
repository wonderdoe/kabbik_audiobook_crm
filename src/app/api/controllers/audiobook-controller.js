import audiobookModel from '../models/audiobook-model';
import AudioBookModel from '../models/audiobook-model';

class AudioBookController {
	async getAudioList(searchParams) {
		try {
			const results = await AudioBookModel.audioList(searchParams);
			return results;
		} catch (error) {
			console.error('Error in getAudioList:', error);
			throw error;
		}
	}

	async exportAudioList(searchParams) {
		try {
			return await AudioBookModel.audioListExport(searchParams);
		} catch (error) {
			console.error('Error in exportAudioList:', error);
			throw error;
		}
	}

	async getEpisode(audiobook_id) {
		try {
			const results = await AudioBookModel.episodeList(audiobook_id);
			return results;
		} catch (error) {}
	}
	async addEpisode(name, description, isfree, file_path) {
		try {
			const results = await AudioBookModel.addEpisode(name, description, isfree, file_path);
			return results;
		} catch (error) {}
	}

	async editEpisode(bodyJSON) {
		try {
			const results = await AudioBookModel.editEpisode(bodyJSON);
			return { message: 'Episode Updated Successfully', statusCode: 200 };
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async updatePremium(id, premium, for_home, isSubRestricted) {
		try {
			const results = await AudioBookModel.updatePremium(id, premium, for_home, isSubRestricted);
			return { results, message: 'Data Updated Successfully', statusCode: 200 };
		} catch (error) {
			console.error('Error in getAudioList:', error);
			throw error;
		}
	}

	async addAudiobook(name, description, author_name, price, en_name, thumb_path) {
		try {
			const results = await AudioBookModel.addAudiobook(
				name,
				description,
				author_name,
				price,
				en_name,
				thumb_path,
			);
			return { results, message: 'Data Updated Successfully', statusCode: 201 };
		} catch (error) {
			console.error('Error in getAudioList:', error);
			throw error;
		}
	}

	async editAudioBook(id, name, description, author_name, price, en_name, thumb_path) {
		try {
			const results = await AudioBookModel.editAudioBook(
				id,
				name,
				description,
				author_name,
				price,
				en_name,
				thumb_path,
			);

			return { message: 'Data Updated Successfully', statusCode: 200 };
		} catch (error) {
			console.error('Error in getAudioList:', error);
			throw error;
		}
	}

	async getFeaturedList(offset, limit) {
		try {
			const results = await AudioBookModel.getFeaturedList(offset, limit);

			return results;
		} catch (error) {
			console.error('Error in getAudioList:', error);
			throw error;
		}
	}

	async getPodcastList(searchParams) {
		try {
			const results = await AudioBookModel.getPodcastList(searchParams);
			return results;
		} catch (error) {
			console.error('Error in getAudioList:', error);
			throw error;
		}
	}

	async getRentAudiobooks(searchParams) {
		try {
			const results = await AudioBookModel.getRentAudiobooks(searchParams);
			return results;
		} catch (error) {
			throw new Error('Error in getRentAudiobooks', error);
		}
	}

	async getPendingAudioList(searchParams) {
		try {
			const data = await AudioBookModel.getPendingAudioList(searchParams);
			return data;
		} catch (err) {
			throw new Error('Error in getPendingAudioList', err);
		}
	}

	async getRejectedAudioList(searchParams) {
		try {
			const data = await AudioBookModel.getRejectedAudioList(searchParams);
			return data;
		} catch (err) {
			throw new Error(`Error occurred when fetching rejected audiobooks`);
		}
	}

	async updateForRent(id, for_rent) {
		try {
			const results = await AudioBookModel.updateForRent(id, for_rent);
			return { results, message: 'Data Updated Successfully', statusCode: 200 };
		} catch (error) {
			console.error('Error in getAudioList:', error);
			throw error;
		}
	}

	async updateApprovalStatus(id, action) {
		const data = await audiobookModel.updateApprovalStatus(id, action);
		return data;
	}

	async delete(id) {
		const data = await AudioBookModel.delete(id);
		return data;
	}

	async getSearchedAudiobooks(searchQuery) {
		const data = await audiobookModel.getSearchedAudiobooks(searchQuery);
		return data;
	}
}

export default new AudioBookController();
