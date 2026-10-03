const dhakaFormatter = new Intl.DateTimeFormat('en-GB', {
	timeZone: 'Asia/Dhaka',
	year: 'numeric',
	month: 'short',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	hour12: true,
});

export function formatDateDhaka(isoOrDate: string | Date | null | undefined) {
	if (!isoOrDate) return '—';
	const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
	if (Number.isNaN(d.getTime())) return '—';
	return dhakaFormatter.format(d);
}

export function isExpired(isoOrDate: string | Date | null | undefined) {
	if (!isoOrDate) return false;
	return new Date(isoOrDate).getTime() < Date.now();
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Local picker instant → `YYYY-MM-DD HH:mm:ss` in UTC (API contract). */
export function formatDateTimeUtcNaiveForApi(date: Date): string {
	return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())} ${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:${pad2(date.getUTCSeconds())}`;
}

/** Picker instant → naive wall time in Asia/Dhaka. */
export function formatDateTimeDhakaNaiveForApi(date: Date): string {
	const parts = new Intl.DateTimeFormat('en-GB', {
		timeZone: 'Asia/Dhaka',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
		hourCycle: 'h23',
	}).formatToParts(date);
	const get = (type: Intl.DateTimeFormatPartTypes) =>
		parts.find(p => p.type === type)?.value ?? '00';
	return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
}

/** Parse API `YYYY-MM-DD HH:mm:ss` stored as UTC without offset. */
export function parseApiUtcNaiveDateTime(dateTime: string): Date {
	return new Date(dateTime.trim().replace(' ', 'T') + 'Z');
}

/** Parse API `YYYY-MM-DD HH:mm:ss` stored as Asia/Dhaka wall time. */
export function parseApiDhakaNaiveDateTime(dateTime: string): Date {
	const [datePart, timePart = '00:00:00'] = dateTime.trim().split(' ');
	return new Date(`${datePart}T${timePart}+06:00`);
}
