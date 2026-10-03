import { NextRequest, NextResponse } from 'next/server';
import { getMaintenanceLog, validatePlatform } from '../../../../server/maintenance/maintenance-service.js';
import { requireMaintenanceAccess } from '../../../../server/maintenance/require-maintenance-access.js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const access = requireMaintenanceAccess(req);
	if (access.error) return access.error;

	const platformParam = req.nextUrl.searchParams.get('platform');
	let platform: string | null = null;
	if (platformParam) {
		const platformError = validatePlatform(platformParam);
		if (platformError) {
			return NextResponse.json(platformError, { status: 400 });
		}
		platform = platformParam;
	}

	const limitRaw = req.nextUrl.searchParams.get('limit');
	const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 20;
	if (Number.isNaN(limit) || limit < 1) {
		return NextResponse.json({ field: 'limit', message: 'limit must be a positive number' }, { status: 400 });
	}

	try {
		const entries = await getMaintenanceLog({ platform, limit });
		return NextResponse.json({ entries }, { headers: { 'Cache-Control': 'no-store' } });
	} catch (error) {
		console.error('[maintenance log GET]', access.admin?.id, error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
