import PromotionBannerModel from '../models/promotionbanner-model';

const VALID_GOTO_PAGES = ['/audiobook', '/gamezop', '/promotion', '/category', '/subscribe'];

class PromotionBannerController {
	validateGotoPageAndPayload(goto_page, payload) {
		if (!VALID_GOTO_PAGES.includes(goto_page)) {
			return 'goto_page must be one of: /audiobook, /gamezop, /promotion, /category, /subscribe';
		}

		if (goto_page === '/audiobook') {
			if (!payload?.bookId) {
				return 'bookId is required when goto_page is /audiobook';
			}
			return null;
		}

		if (goto_page === '/category') {
			if (!payload?.categoryName) {
				return 'categoryName is required when goto_page is /category';
			}
			return null;
		}

		if (payload && Object.keys(payload).length > 0) {
			return 'payload is not allowed for the selected goto_page';
		}

		return null;
	}

	normalizePayload(goto_page, payload) {
		if (goto_page === '/audiobook') {
			return { bookId: String(payload.bookId) };
		}

		if (goto_page === '/category') {
			return { categoryName: String(payload.categoryName) };
		}

		return null;
	}
	async listBanners(isActive) {
		const data = await PromotionBannerModel.listBanners(isActive);
		return {
			success: true,
			data,
			message: 'Banners retrieved',
		};
	}

	async getBanner(id) {
		const data = await PromotionBannerModel.getBannerById(id);

		if (!data) {
			return {
				success: false,
				message: 'Banner not found',
				statusCode: 404,
			};
		}

		return {
			success: true,
			data,
			message: 'Banner retrieved',
		};
	}

	async createBanner(body) {
		const { banner_url, goto_page, is_active, payload, target_audience } = body;

		if (!banner_url || !goto_page) {
			return {
				success: false,
				message: 'banner_url and goto_page are required',
				statusCode: 400,
			};
		}

		if (target_audience && !PromotionBannerModel.isValidAudience(target_audience)) {
			return {
				success: false,
				message: 'target_audience must be one of: all, free, premium',
				statusCode: 400,
			};
		}

		const payloadError = this.validateGotoPageAndPayload(goto_page, payload);
		if (payloadError) {
			return {
				success: false,
				message: payloadError,
				statusCode: 400,
			};
		}

		const data = await PromotionBannerModel.createBanner({
			banner_url,
			goto_page,
			is_active: is_active === undefined ? 1 : is_active,
			payload: this.normalizePayload(goto_page, payload),
			target_audience: target_audience || 'all',
		});

		return {
			success: true,
			data,
			message: 'Banner created',
			statusCode: 201,
		};
	}

	async updateBanner(id, body) {
		const existing = await PromotionBannerModel.getBannerById(id);

		if (!existing) {
			return {
				success: false,
				message: 'Banner not found',
				statusCode: 404,
			};
		}

		if (body.target_audience && !PromotionBannerModel.isValidAudience(body.target_audience)) {
			return {
				success: false,
				message: 'target_audience must be one of: all, free, premium',
				statusCode: 400,
			};
		}

		const allowedFields = ['banner_url', 'goto_page', 'is_active', 'payload', 'target_audience'];
		const fields = {};

		allowedFields.forEach(field => {
			if (body[field] !== undefined) {
				fields[field] = body[field];
			}
		});

		if (Object.keys(fields).length === 0) {
			return {
				success: false,
				message: 'No fields to update',
				statusCode: 400,
			};
		}

		const nextGotoPage = fields.goto_page ?? existing.goto_page;
		const nextPayload = fields.payload !== undefined ? fields.payload : existing.payload;
		const payloadError = this.validateGotoPageAndPayload(nextGotoPage, nextPayload);

		if (payloadError) {
			return {
				success: false,
				message: payloadError,
				statusCode: 400,
			};
		}

		if (fields.payload !== undefined) {
			fields.payload = this.normalizePayload(nextGotoPage, fields.payload);
		}

		if (fields.goto_page !== undefined && fields.payload === undefined) {
			fields.payload = this.normalizePayload(nextGotoPage, nextPayload);
		}

		const data = await PromotionBannerModel.updateBanner(id, fields);

		return {
			success: true,
			data,
			message: 'Banner updated',
		};
	}

	async toggleBanner(id) {
		const data = await PromotionBannerModel.toggleBanner(id);

		if (!data) {
			return {
				success: false,
				message: 'Banner not found',
				statusCode: 404,
			};
		}

		return {
			success: true,
			data,
			message: 'Banner toggled',
		};
	}

	async deleteBanner(id) {
		const deleted = await PromotionBannerModel.softDeleteBanner(id);

		if (!deleted) {
			return {
				success: false,
				message: 'Banner not found or already deleted',
				statusCode: 404,
			};
		}

		return {
			success: true,
			message: 'Banner deleted',
		};
	}
}

export default new PromotionBannerController();
