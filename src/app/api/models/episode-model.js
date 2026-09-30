import DB from '../../../server/config/db.js';

class EpisodeModel {
	toggleEpisodeIsFree = async searchParams => {
		try {
			const { episodeId, isFree } = searchParams;
			const query = `
				UPDATE episodes
				SET isfree = ?
				WHERE id = ?
			`;
			const result = await DB.query(query, [Number(isFree), Number(episodeId)]);
			return result;
		} catch (err) {
			console.error(err);
			return null;
		}
	};
}

export default new EpisodeModel();
