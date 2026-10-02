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
