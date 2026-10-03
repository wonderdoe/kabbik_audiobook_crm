import { NextRequest, NextResponse } from 'next/server';
import {
	actorLabelFromAdmin,
	isMaintenanceConfigError,
	restoreMaintenanceVersion,
	validatePlatform,
} from '../../../../../server/maintenance/maintenance-service.js';
import { requireMaintenanceAccess } from '../../../../../server/maintenance/require-maintenance-access.js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
	const access = requireMaintenanceAccess(req);
	if (access.error) return access.error;

	let body: { platform?: string; versionId?: string };
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ field: 'body', message: 'Invalid JSON body' }, { status: 400 });
	}

	const platform = body.platform;
	const versionId = body.versionId;
	if (!platform || !versionId) {
		return NextResponse.json(
			{ field: 'body', message: 'platform and versionId are required' },
			{ status: 400 },
		);
	}

	const platformError = validatePlatform(platform);
	if (platformError) {
		return NextResponse.json(platformError, { status: 400 });
	}

	const changedBy = actorLabelFromAdmin(access.admin);

	try {
		const result = await restoreMaintenanceVersion(platform, versionId, changedBy);
		if (result.validationError) {
			return NextResponse.json(
				{ field: result.validationError.field, message: result.validationError.message },
				{ status: 400 },
			);
		}
		if (result.conflict) {
			return NextResponse.json(
				{ field: 'etag', message: 'Someone else saved changes. Reload and try again.' },
				{ status: 409 },
			);
		}
		return NextResponse.json(result.row, { headers: { 'Cache-Control': 'no-store' } });
	} catch (error) {
		console.error('[maintenance history restore]', access.admin?.id, platform, error);
		if (isMaintenanceConfigError(error)) {
			return NextResponse.json({ message: (error as Error).message }, { status: 503 });
		}
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
