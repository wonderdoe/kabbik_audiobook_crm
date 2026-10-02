export const USER_REPORT_NOT_CACHED_MESSAGE =
	'No report data in cache yet. It refreshes automatically every day at 3:30 AM Bangladesh time (Asia/Dhaka).';

export class UserReportNotCachedError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'UserReportNotCachedError';
	}
}

let inFlight: Promise<Record<string, unknown>> | null = null;

async function fetchOnce(): Promise<Record<string, unknown>> {
	const response = await fetch('/api/routes/user-report-snapshot', { cache: 'no-store' });
	if (response.status === 503) {
		let message = USER_REPORT_NOT_CACHED_MESSAGE;
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
		throw new UserReportNotCachedError(message);
	}
	if (!response.ok) {
		throw new Error(`user-report-snapshot ${response.status}`);
	}
	return response.json() as Promise<Record<string, unknown>>;
}

/** One snapshot request per tab; avoids Strict Mode / remount stampede. */
export function fetchUserReportSnapshot(): Promise<Record<string, unknown>> {
	if (!inFlight) {
		inFlight = fetchOnce().finally(() => {
			inFlight = null;
		});
	}
	return inFlight;
}
