import moment from 'moment';

const TIME_KEY_PATTERN = /^(date|day|time|timestamp|createdAt|created_at|month)$/i;

/** True when the x-axis field is expected to represent time. */
export function isLikelyTimeSeriesKey(key: string): boolean {
	const k = key.trim();
	if (!k) return false;
	if (TIME_KEY_PATTERN.test(k)) return true;
	return k.toLowerCase().includes('date');
}

function parseTimeValue(value: unknown): number | null {
	if (value == null) return null;
	if (value instanceof Date) return value.getTime();
	if (typeof value === 'number' && Number.isFinite(value)) return value;

	const s = String(value).trim();
	if (!s) return null;

	const strict = moment(
		s,
		[
			moment.ISO_8601,
			'YYYY-MM-DD',
			'YYYY-MM-DD HH:mm:ss',
			'Do MMM, YYYY',
			'Do MMM YYYY',
			'Do MMM',
			'D MMM YYYY',
			'D MMM',
		],
		true,
	);
	if (strict.isValid()) return strict.valueOf();

	const loose = moment(s);
	return loose.isValid() ? loose.valueOf() : null;
}

/**
 * Sort chart rows oldest → newest (left → right on x-axis).
 * Stable when timestamps tie. Leaves order unchanged if dates cannot be parsed.
 */
export function sortChartDataChronologically<T extends Record<string, unknown>>(
	data: T[],
	timeKey: string,
): T[] {
	if (!data?.length || data.length < 2) return data;

	const keyed = data.map((row, index) => ({
		row,
		index,
		t: parseTimeValue(row[timeKey]),
	}));

	const parseable = keyed.filter(entry => entry.t != null);
	if (parseable.length < 2) return data;

	const sorted = [...keyed].sort((a, b) => {
		if (a.t == null && b.t == null) return a.index - b.index;
		if (a.t == null) return 1;
		if (b.t == null) return -1;
		if (a.t !== b.t) return a.t - b.t;
		return a.index - b.index;
	});

	return sorted.map(entry => entry.row);
}
