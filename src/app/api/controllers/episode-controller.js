import EpisodeModel from '../models/episode-model';

class EpisodeController {
	toggleEpisodeIsFree = async searchParams => {
		const data = await EpisodeModel.toggleEpisodeIsFree(searchParams);
		return data;
	};
}

export default new EpisodeController();
