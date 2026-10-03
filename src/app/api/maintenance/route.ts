import { NextResponse } from 'next/server';
import {
	getMaintenanceStatus,
	isMaintenanceConfigError,
} from '../../../server/maintenance/maintenance-service.js';
import { requireMaintenanceAccess } from '../../../server/maintenance/require-maintenance-access.js';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
	const access = requireMaintenanceAccess(req);
	if (access.error) return access.error;

	try {
		const data = await getMaintenanceStatus();
		return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
	} catch (error) {
		console.error('[maintenance GET]', access.admin?.id, error);
		if (isMaintenanceConfigError(error)) {
			return NextResponse.json({ message: (error as Error).message }, { status: 503 });
		}
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
