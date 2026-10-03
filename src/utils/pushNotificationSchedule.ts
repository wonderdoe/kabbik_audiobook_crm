import {
	formatDateDhaka,
	formatDateTimeDhakaNaiveForApi,
	parseApiDhakaNaiveDateTime,
	parseApiUtcNaiveDateTime,
} from '@/utils/date';

const SCHEDULE_TIME_KEYS = [
	'scheduleTime',
	'ScheduleTime',
	'schedule_time',
	'dateTime',
	'DateTime',
	'scheduledTime',
	'ScheduledTime',
	'startDate',
	'StartDate',
];

const SCHEDULE_EXPRESSION_KEYS = ['ScheduleExpression', 'scheduleExpression', 'expression'];

type ScheduleApiResult = {
	data?: {
		success?: boolean;
		message?: string;
	};
};

/** Backend returns success even when zero schedules were created. */
export function isScheduledPushNotificationCreated(result: unknown): boolean {
	const message = (result as ScheduleApiResult)?.data?.message;
	if (typeof message === 'string') {
		const match = message.match(/(\d+)\s+schedule/i);
		if (match) return Number.parseInt(match[1], 10) > 0;
	}
	return Boolean((result as ScheduleApiResult)?.data?.success);
}

export function getScheduledPushNotificationMessage(result: unknown): string | undefined {
	return (result as ScheduleApiResult)?.data?.message;
}

/** Picker instant → naive `YYYY-MM-DD HH:mm:ss` in Asia/Dhaka (schedule API validation). */
export function formatScheduledPushDateTimeForApi(date: Date): string {
	return formatDateTimeDhakaNaiveForApi(date);
}

export function extractScheduledNotificationList(payload: unknown): {
	items: Record<string, unknown>[];
	nextToken?: string;
} {
	if (!payload || typeof payload !== 'object') return { items: [] };
	const root = payload as Record<string, unknown>;
	const data = root.data;

	const nextToken =
		(typeof root.nextToken === 'string' ? root.nextToken : undefined) ??
		(data && typeof data === 'object' && typeof (data as Record<string, unknown>).nextToken === 'string'
			? ((data as Record<string, unknown>).nextToken as string)
			: undefined);

	const candidates = [
		root.data,
		data && typeof data === 'object' ? (data as Record<string, unknown>).data : undefined,
		root.schedules,
		data && typeof data === 'object' ? (data as Record<string, unknown>).schedules : undefined,
		root.items,
	];

	for (const candidate of candidates) {
		if (Array.isArray(candidate)) {
			return { items: candidate as Record<string, unknown>[], nextToken };
		}
	}

	return { items: [], nextToken };
}

function readScheduleTimeValue(value: unknown): string | null {
	if (typeof value === 'string' && value.trim()) return value.trim();
	if (typeof value === 'number' && Number.isFinite(value)) {
		const ms = value > 1e12 ? value : value * 1000;
		const d = new Date(ms);
		if (!Number.isNaN(d.getTime())) return d.toISOString();
	}
	return null;
}

function parseAtScheduleExpression(expression: string): string | null {
	const match = expression.trim().match(/^at\(([^)]+)\)$/i);
	if (!match) return null;
	const inner = match[1].trim();
	if (!inner) return null;
	return inner.includes('T') ? inner : inner.replace(' ', 'T');
}

/** Resolve scheduled time from list API row (field names vary). */
export function getScheduleItemDateTimeRaw(item: Record<string, unknown>): string | null {
	for (const key of SCHEDULE_TIME_KEYS) {
		const found = readScheduleTimeValue(item[key]);
		if (found) return found;
	}
	for (const key of SCHEDULE_EXPRESSION_KEYS) {
		const expr = item[key];
		if (typeof expr === 'string') {
			const at = parseAtScheduleExpression(expr);
			if (at) return at;
		}
	}
	const payload = item.payload;
	if (payload && typeof payload === 'object') {
		for (const key of SCHEDULE_TIME_KEYS) {
			const found = readScheduleTimeValue((payload as Record<string, unknown>)[key]);
			if (found) return found;
		}
	}
	return findScheduleTimeInObject(item);
}

function findScheduleTimeInObject(obj: Record<string, unknown>, depth = 0): string | null {
	if (depth > 3) return null;
	for (const [key, val] of Object.entries(obj)) {
		const k = key.toLowerCase();
		if (
			k === 'datetime' ||
			k === 'scheduledtime' ||
			k === 'scheduletime' ||
			(k.includes('schedule') && k.includes('time'))
		) {
			const found = readScheduleTimeValue(val);
			if (found) return found;
		}
		if (typeof val === 'string' && /^at\(/i.test(val)) {
			const at = parseAtScheduleExpression(val);
			if (at) return at;
		}
		if (val && typeof val === 'object' && !Array.isArray(val)) {
			const nested = findScheduleTimeInObject(val as Record<string, unknown>, depth + 1);
			if (nested) return nested;
		}
	}
	return null;
}

export function formatScheduleListDateTime(raw: string | null | undefined): string {
	if (!raw) return '—';
	const atParsed = parseAtScheduleExpression(raw);
	const value = atParsed ?? raw;
	const naive = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(value);
	const attempts: Date[] = [];
	if (naive) {
		attempts.push(parseApiDhakaNaiveDateTime(value), parseApiUtcNaiveDateTime(value));
	}
	attempts.push(new Date(value));
	for (const d of attempts) {
		if (!Number.isNaN(d.getTime())) return formatDateDhaka(d);
	}
	return value;
}

const TITLE_KEYS = ['title', 'Title', 'name', 'Name'];

export function getScheduleItemTitle(item: Record<string, unknown>): string {
	for (const key of TITLE_KEYS) {
		const v = item[key];
		if (typeof v === 'string' && v.trim()) return v.trim();
	}
	const payload = item.payload;
	if (payload && typeof payload === 'object') {
		for (const key of TITLE_KEYS) {
			const v = (payload as Record<string, unknown>)[key];
			if (typeof v === 'string' && v.trim()) return v.trim();
		}
	}
	return 'Untitled notification';
}

export function getScheduleItemName(item: Record<string, unknown>): string | undefined {
	const v = item.Name ?? item.name;
	return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

export function parseScheduleItemDate(item: Record<string, unknown>): Date | null {
	const raw = getScheduleItemDateTimeRaw(item);
	if (!raw) return null;
	const atParsed = parseAtScheduleExpression(raw);
	const value = atParsed ?? raw;
	const naive = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(value);
	const attempts: Date[] = naive
		? [parseApiDhakaNaiveDateTime(value), parseApiUtcNaiveDateTime(value), new Date(value)]
		: [new Date(value)];
	for (const d of attempts) {
		if (!Number.isNaN(d.getTime())) return d;
	}
	return null;
}
