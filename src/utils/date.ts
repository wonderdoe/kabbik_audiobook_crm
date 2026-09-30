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
