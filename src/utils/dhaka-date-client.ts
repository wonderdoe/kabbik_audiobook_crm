const DHAKA_TZ = 'Asia/Dhaka';

export function dhakaTodayYmd(now = new Date()): string {
	return new Intl.DateTimeFormat('en-CA', { timeZone: DHAKA_TZ }).format(now);
}

export function dhakaMonthStartYmd(anchorYmd?: string): string {
	const ymd = anchorYmd ?? dhakaTodayYmd();
	return `${ymd.slice(0, 7)}-01`;
}

export function defaultRentReportRangeClient(): { startDate: string; endDate: string } {
	const endDate = dhakaTodayYmd();
	return { startDate: dhakaMonthStartYmd(endDate), endDate };
}

export function defaultPackageWiseReportRangeClient(): { startDate: string; endDate: string } {
	return defaultRentReportRangeClient();
}

/** Fraction of the current Dhaka calendar day that has elapsed (0–1). */
export function dhakaDayFractionElapsed(now = new Date()): number {
	const parts = new Intl.DateTimeFormat('en-GB', {
		timeZone: DHAKA_TZ,
		hour: 'numeric',
		minute: 'numeric',
		hour12: false,
	}).formatToParts(now);
	const hour = Number(parts.find(p => p.type === 'hour')?.value ?? 0);
	const minute = Number(parts.find(p => p.type === 'minute')?.value ?? 0);
	const minutesElapsed = hour * 60 + minute;
	const fraction = minutesElapsed / (24 * 60);
	return Math.min(0.98, Math.max(0.02, fraction));
}
