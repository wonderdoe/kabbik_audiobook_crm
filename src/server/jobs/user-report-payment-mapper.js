/** Maps raw payment_method rows to user-report card shape (shared across models). */

export function mapPaymentSourceRow(item) {
	if (!item?.payment_source) return undefined;
	const src = item.payment_source.toLowerCase();
	const recurring = Boolean(item.is_recurring);
	if (src === 'bkash') {
		return {
			...item,
			image: 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713779372202.png',
			name: 'Bkash',
		};
	}
	if (src === 'nagad') {
		return {
			...item,
			name: 'Nagad',
			image: 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713779396431.png',
		};
	}
	if (src === 'aamarpay') {
		return {
			...item,
			image: 'https://kabbik-ab-bucket.s3.ap-south-1.amazonaws.com/1685361594336.png',
			name: 'Aamarpay Payment',
		};
	}
	if (src === 'robi') {
		return {
			...item,
			image: 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713779411161.png',
			name: recurring ? 'Robi' : 'Robi',
		};
	}
	if (src === 'bl') {
		return {
			...item,
			image: '/images/BLlogopng.png',
			name: recurring ? 'BL' : 'BL',
		};
	}
	if (src === 'gp') {
		return {
			...item,
			image: 'https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/grameen%20.png',
			name: recurring ? 'GP' : 'GP',
		};
	}
	if (src === 'app_store') {
		return {
			...item,
			image: 'https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/applepay.png',
			name: recurring ? 'Apple Pay' : 'Apple Pay',
		};
	}
	if (src === 'play_store') {
		return {
			...item,
			image: 'https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/googlepay.png',
			name: recurring ? 'Google Pay' : 'Google Pay',
		};
	}
	if (src === 'stripe') {
		return {
			...item,
			image: 'https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/strip.png',
			name: recurring ? 'Stripe' : 'Stripe',
		};
	}
	if (src === 'upay') {
		return {
			...item,
			image: '/image.png',
			name: recurring ? 'Upay' : 'Upay',
		};
	}
	return undefined;
}

export function mapPaymentSourceRows(rows, { sortRent = false } = {}) {
	let mapped = rows.map(row => mapPaymentSourceRow(row)).filter(item => item !== undefined);
	if (sortRent) {
		mapped = mapped.sort((a, b) => {
			if (a.name < b.name) return -1;
			if (a.name > b.name) return 1;
			return 0;
		});
	}
	return mapped;
}

export function sumMappedCounts(rows) {
	return rows.reduce((acc, row) => acc + (Number(row.count) || 0), 0);
}
