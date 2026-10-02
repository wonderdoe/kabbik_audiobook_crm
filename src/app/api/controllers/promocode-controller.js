import PromoModel from '../models/promocode-model';
class PromoController {
	async getAllPromocode() {
		try {
			const data = await PromoModel.getAllPromocode();
			return data;
		} catch (err) {
			throw err;
		}
	}

	async getAllPromo(type, offset, limit, startDate, endDate) {
		try {
			const results = await PromoModel.allPromoList(type, offset, limit, startDate, endDate);
			return results;
		} catch (err) {
			throw err;
		}
	}

	async getPromoSubscriptionData(promocode, for_package) {
		try {
			const results = await PromoModel.getPromoSubscriptionData(promocode, for_package);
			return results;
		} catch (err) {
			throw err;
		}
	}

	async deactivatedPromo() {
		try {
			const results = await PromoModel.deactivatedPromo();
			return results;
		} catch (err) {
			throw err;
		}
	}

	async dateWisePromo(offset, limit, startDate, endDate) {
		try {
			const results = await PromoModel.dateWisePromo(offset, limit, startDate, endDate);
			return results;
		} catch (err) {
			throw err;
		}
	}

	async addPromo(promocode, for_package, reduce_price, promo_type, bank_name) {
		try {
			const results = await PromoModel.addPromo(
				promocode,
				for_package,
				reduce_price,
				promo_type,
				bank_name,
			);
			return { message: 'Promo code added successfully', statusCode: 201 };
		} catch (err) {
			throw err;
		}
	}

	async togglePromocodeActivity(id) {
		try {
			const data = await PromoModel.togglePromocodeActivity(id);
			return data;
		} catch (err) {
			console.error(err);
			return err;
		}
	}

	async searchPromocodeGroupwise(searchParams) {
		try {
			const data = await PromoModel.searchPromocodeGroupwise(searchParams);
			return data;
		} catch (err) {
			throw err;
		}
	}

	async getTopMostUsedPromocodes(day) {
		try {
			const data = await PromoModel.getTopMostUsedPromocodes(day);
			return data;
		} catch (err) {
			throw err;
		}
	}

	async findOne(promocode, packageId) {
		try {
			const data = await PromoModel.findOne(promocode, packageId);
			return data;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	async addListOfBinsWithoutCardType(jsonBody) {
		try {
			const data = await PromoModel.addListOfBinsWithoutCardType(jsonBody);
			return data;
		} catch (err) {
			throw err;
		}
	}
}

export default new PromoController();
