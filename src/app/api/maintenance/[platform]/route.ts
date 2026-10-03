import { NextRequest, NextResponse } from 'next/server';
import {
	actorLabelFromAdmin,
	updateMaintenanceStatus,
	validateMaintenancePutBody,
	validatePlatform,
} from '../../../../server/maintenance/maintenance-service.js';
import { requireMaintenanceAccess } from '../../../../server/maintenance/require-maintenance-access.js';

export const dynamic = 'force-dynamic';

type RouteContext = { params: { platform: string } };

export async function PUT(req: NextRequest, context: RouteContext) {
	const access = requireMaintenanceAccess(req);
	if (access.error) return access.error;

	const platform = context.params.platform;
	const platformError = validatePlatform(platform);
	if (platformError) {
		return NextResponse.json(platformError, { status: 400 });
	}

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ field: 'body', message: 'Invalid JSON body' }, { status: 400 });
	}

	const validated = validateMaintenancePutBody(body);
	if (!('isUnderMaintenance' in validated)) {
		return NextResponse.json(
			{ field: validated.field, message: validated.message },
			{ status: 400 },
		);
	}

	const changedBy = actorLabelFromAdmin(access.admin);

	try {
		const result = await updateMaintenanceStatus(platform, validated, changedBy);
		if (result.notFound) {
			return NextResponse.json({ message: 'Platform not found' }, { status: 404 });
		}
		return NextResponse.json(result.row, { headers: { 'Cache-Control': 'no-store' } });
	} catch (error) {
		console.error('[maintenance PUT]', access.admin?.id, platform, error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
