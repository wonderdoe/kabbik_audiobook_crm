import UpcomingModel from '../models/upcoming-audio-model';

class UpcomingController {
	async getUpcoming() {
		try {
			const results = await UpcomingModel.getUpcoming();
			return results;
		} catch (err) {
			throw err;
		}
	}

	async addUpcoming(bodyJSON) {
		try {
			const data = await UpcomingModel.addUpcoming(bodyJSON);
			return data;
		} catch (err) {
			throw err;
		}
	}

	async updateUpcoming(bodyJSON) {
		try {
			const data = await UpcomingModel.updateUpcoming(bodyJSON);
			return data;
		} catch (err) {
			throw err;
		}
	}

	async deleteUpcoming(id) {
		try {
			const data = await UpcomingModel.deleteUpcoming(id);
			return data;
		} catch (err) {
			throw err;
		}
	}
}

export default new UpcomingController();
