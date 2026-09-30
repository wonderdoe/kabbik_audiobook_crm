import { NextResponse } from 'next/server';
import quickAccessController from '../../../controllers/quick-access-controller';
import { getAdminFromRequest, unauthorizedResponse } from '../../../utils/require-admin';

export const dynamic = 'force-dynamic';

export async function PATCH(req) {
	const admin = getAdminFromRequest(req);
	if (!admin) return unauthorizedResponse();

	try {
		const body = await req.json();
		const data = await quickAccessController.reorder(body, admin.id);
		return NextResponse.json(data, { status: data.statusCode || 200 });
	} catch (error) {
		return NextResponse.json(
			{ success: false, message: error.message || 'Internal Server Error' },
			{ status: 500 },
		);
	}
}
