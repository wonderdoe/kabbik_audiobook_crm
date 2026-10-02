export const dynamic = 'force-dynamic';

import ArtistModel from '../models/artists-controller';

class ArtistController {
	async getArtists(offset = 0, limit = 1000, search = '') {
		try {
			const results = await ArtistModel.getArtists(offset, limit, search);
			return results;
		} catch (error) {
			return error;
		}
	}

	async addArtist(name, en_name, imageUrl) {
		try {
			const results = await ArtistModel.addArtist(name, en_name, imageUrl);
			return { results, message: 'Contributor added successfully', statusCode: 201 };
		} catch (error) {
			return error;
		}
	}

	async editArtist(id, name, en_name, imageUrl) {
		try {
			const results = await ArtistModel.editArtist(id, name, en_name, imageUrl);
			return { results, message: 'Contributor updated successfully', statusCode: 201 };
		} catch (error) {
			return error;
		}
	}
}

export default new ArtistController();
