import { NextResponse } from 'next/server';
import { getAdminFromRequest, unauthorizedResponse } from '../../app/api/utils/require-admin.js';
import { hasPermission } from '../auth/admin-token.js';

export function requireMaintenanceAccess(req) {
	const admin = getAdminFromRequest(req);
	if (!admin) {
		return { error: unauthorizedResponse() };
	}
	if (!hasPermission(req, 'assign_roles')) {
		return {
			error: NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 }),
		};
	}
	return { admin };
}
