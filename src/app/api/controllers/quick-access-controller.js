import QuickAccessModel from '../models/quick-access-model';
import { parseListParams, validateQuickAccessBody } from '../utils/quick-access-schema';

class QuickAccessController {
	async list(searchParams) {
		const params = parseListParams(searchParams);
		const result = await QuickAccessModel.list(params);
		return {
			success: true,
			data: result.data,
			total: result.total,
			message: 'Quick access items retrieved',
		};
	}

	async create(body, adminId) {
		const validated = validateQuickAccessBody(body, { partial: false });
		if (!validated.ok) {
			return {
				success: false,
				message: validated.message,
				errors: validated.errors,
				statusCode: 400,
			};
		}

		const { enName, bnName, gotoPage, audience, isActive, sortOrder } = validated.data;
		const data = await QuickAccessModel.create({
			enName,
			bnName,
			gotoPage,
			audience,
			isActive: isActive ?? true,
			sortOrder: sortOrder ?? 0,
			createdBy: adminId,
		});

		return {
			success: true,
			data,
			message: 'Quick access item created',
			statusCode: 201,
		};
	}

	async update(id, body, adminId) {
		const existing = await QuickAccessModel.getById(id);
		if (!existing) {
			return {
				success: false,
				message: 'Quick access item not found',
				statusCode: 404,
			};
		}

		const validated = validateQuickAccessBody(body, { partial: true });
		if (!validated.ok) {
			return {
				success: false,
				message: validated.message,
				errors: validated.errors,
				statusCode: 400,
			};
		}

		if (Object.keys(validated.data).length === 0) {
			return {
				success: false,
				message: 'No fields to update',
				statusCode: 400,
			};
		}

		const data = await QuickAccessModel.update(id, validated.data, adminId);
		return {
			success: true,
			data,
			message: 'Quick access item updated',
		};
	}

	async replace(id, body, adminId) {
		const existing = await QuickAccessModel.getById(id);
		if (!existing) {
			return {
				success: false,
				message: 'Quick access item not found',
				statusCode: 404,
			};
		}

		const validated = validateQuickAccessBody(body, { partial: false });
		if (!validated.ok) {
			return {
				success: false,
				message: validated.message,
				errors: validated.errors,
				statusCode: 400,
			};
		}

		const data = await QuickAccessModel.update(id, validated.data, adminId);
		return {
			success: true,
			data,
			message: 'Quick access item updated',
		};
	}

	async toggle(id, body, adminId) {
		const existing = await QuickAccessModel.getById(id);
		if (!existing) {
			return {
				success: false,
				message: 'Quick access item not found',
				statusCode: 404,
			};
		}

		let data;
		if (body?.isActive !== undefined) {
			data = await QuickAccessModel.setActive(id, Boolean(body.isActive), adminId);
		} else {
			data = await QuickAccessModel.toggle(id, adminId);
		}

		return {
			success: true,
			data,
			message: 'Quick access item updated',
		};
	}

	async reorder(body, adminId) {
		const items = body?.items;
		if (!Array.isArray(items) || items.length === 0) {
			return {
				success: false,
				message: 'items array is required',
				statusCode: 400,
			};
		}

		const normalized = [];
		for (const item of items) {
			const id = Number(item.id);
			const sortOrder = Number(item.sortOrder);
			if (!Number.isInteger(id) || id < 1) {
				return {
					success: false,
					message: 'Each item must have a valid id',
					statusCode: 400,
				};
			}
			if (!Number.isInteger(sortOrder)) {
				return {
					success: false,
					message: 'Each item must have an integer sortOrder',
					statusCode: 400,
				};
			}
			normalized.push({ id, sortOrder });
		}

		await QuickAccessModel.reorder(normalized, adminId);
		return {
			success: true,
			message: 'Order updated',
		};
	}

	async delete(id) {
		const existing = await QuickAccessModel.getById(id);
		if (!existing) {
			return {
				success: false,
				message: 'Quick access item not found',
				statusCode: 404,
			};
		}

		await QuickAccessModel.delete(id);
		return {
			success: true,
			message: 'Quick access item deleted',
		};
	}
}

export default new QuickAccessController();
