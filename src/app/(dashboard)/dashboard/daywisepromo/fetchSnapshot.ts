export const DAYWISE_PROMO_NOT_CACHED_MESSAGE =
	'No daywise promo data in cache yet. The scheduled cache warm runs once per day at 2:00 AM Bangladesh time (Asia/Dhaka).';

export class DaywisePromoNotCachedError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'DaywisePromoNotCachedError';
	}
}

export type DaywisePromoSnapshot = {
	data?: unknown[];
	total?: number;
};

export async function fetchDaywisePromoSnapshot(
	offset: number,
	limit: number,
	startDate: string,
	endDate: string,
): Promise<DaywisePromoSnapshot> {
	const response = await fetch(
		`/api/routes/daywise-promo-active?offset=${offset}&limit=${limit}&startDate=${startDate}&endDate=${endDate}`,
		{ cache: 'no-store' },
	);

	if (response.status === 503) {
		let message = DAYWISE_PROMO_NOT_CACHED_MESSAGE;
		try {
			const body = (await response.json()) as { message?: string; code?: string };
			if (body.code === 'NOT_CACHED' && body.message) {
				message = body.message;
			} else if (body.message) {
				message = body.message;
			}
		} catch {
			/* use default */
		}
		throw new DaywisePromoNotCachedError(message);
	}

	if (!response.ok) {
		let message = `daywise-promo-active ${response.status}`;
		try {
			const body = (await response.json()) as { message?: string };
			if (body.message) message = body.message;
		} catch {
			/* ignore */
		}
		throw new Error(message);
	}

	return response.json() as Promise<DaywisePromoSnapshot>;
}
