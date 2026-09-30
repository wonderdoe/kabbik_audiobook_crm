import { NextRequest, NextResponse } from 'next/server';
import { getOrSetLocked, cacheSet } from '../../../../server/cache/index.js';
import { buildHomeSnapshot } from '../../../../server/jobs/dashboard.js';
import { decodeJwtAccessToken } from '../../utils/jwt.js';

export const dynamic = 'force-dynamic';

function tokenFromRequest(req) {
	const auth = req.headers.get('authorization');
	if (auth?.startsWith('Bearer ')) {
		return auth.slice(7).trim();
	}
	const cookie = req.headers.get('cookie') || '';
	const match = cookie.match(/(?:^|;\s*)admin_token=([^;]+)/);
	return match ? decodeURIComponent(match[1]) : null;
}

function canRefreshDashboard(req) {
	const token = tokenFromRequest(req);
	if (!token) return false;
	const payload = decodeJwtAccessToken(token);
	if (!payload?.userPermissions) return false;
	return payload.userPermissions.includes('dashboard');
}

export async function GET(req) {
	try {
		const date = req.nextUrl.searchParams.get('date') ?? undefined;
		const refresh = req.nextUrl.searchParams.get('refresh') === '1';

		if (refresh) {
			if (!canRefreshDashboard(req)) {
				return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
			}
			const snap = await buildHomeSnapshot(date ?? undefined);
			await cacheSet('dash:home', snap, 600);
			return NextResponse.json(snap, {
				headers: { 'Cache-Control': 'no-store' },
			});
		}

		const snap = await getOrSetLocked('dash:home', 600, () =>
			buildHomeSnapshot(date ?? undefined),
		);
		return NextResponse.json(snap, {
			headers: { 'Cache-Control': 'no-store' },
		});
	} catch (error) {
		console.error('[dashboard-summary GET]', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
