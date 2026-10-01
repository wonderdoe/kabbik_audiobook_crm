import moment from 'moment';

const DHAKA_TZ = 'Asia/Dhaka';

/** YYYY-MM-DD in Asia/Dhaka (matches worker cron timezone). */
export function dhakaTodayYmd(now = new Date()) {
	return new Intl.DateTimeFormat('en-CA', { timeZone: DHAKA_TZ }).format(now);
}

/** Hour (0–23) and minute in Asia/Dhaka. */
export function dhakaClock(now = new Date()) {
	const parts = new Intl.DateTimeFormat('en-GB', {
		timeZone: DHAKA_TZ,
		hour: 'numeric',
		minute: 'numeric',
		hour12: false,
	}).formatToParts(now);
	const hour = Number(parts.find(p => p.type === 'hour')?.value ?? 0);
	const minute = Number(parts.find(p => p.type === 'minute')?.value ?? 0);
	return { hour, minute };
}

export function parseYmd(ymd) {
	return moment(ymd, 'YYYY-MM-DD', true);
}
