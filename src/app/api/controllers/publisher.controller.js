import PublisherModel from '../models/publisher.model';

export const dynamic = 'force-dynamic';

class PublisherController {
	async getPublisher(offset, limit) {
		try {
			const results = await PublisherModel.getPublisherList(offset, limit);
			return results;
		} catch (error) {
			return error;
		}
	}

	async getPublisherName() {
		try {
			const results = await PublisherModel.getPublisherName();
			return results;
		} catch (error) {
			return error;
		}
	}

	async addPublisher(imageUrl, full_name, en_name, email, phone, address, password) {
		try {
			const results = await PublisherModel.addPublisher(
				imageUrl,
				full_name,
				en_name,
				email,
				phone,
				address,
				password,
			);

			return results;
		} catch (error) {
			return error;
		}
	}

	async getPublisherDetails(id, full_name, en_name, email, address, phone, imageUrl) {
		try {
			const results = await PublisherModel.getPublisherDetails(
				id,
				full_name,
				en_name,
				email,
				address,
				phone,
				imageUrl,
			);

			return results;
		} catch (error) {
			return error;
		}
	}

	async getPublisherRequests(status) {
		try {
			const data = await PublisherModel.getPublisherRequests(status);
			return data;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	async acceptPublisherRequest(bodyJson) {
		try {
			const data = await PublisherModel.acceptPublisherRequest(bodyJson);
			return data;
		} catch (err) {
			throw err;
		}
	}
}

export default new PublisherController();
