import { NextResponse } from 'next/server';
import quickAccessController from '../../../../controllers/quick-access-controller';
import { getAdminFromRequest, unauthorizedResponse } from '../../../../utils/require-admin';

export const dynamic = 'force-dynamic';

export async function PATCH(req, { params }) {
	const admin = getAdminFromRequest(req);
	if (!admin) return unauthorizedResponse();

	const id = Number(params.id);
	if (!Number.isInteger(id) || id < 1) {
		return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 });
	}

	try {
		let body = {};
		try {
			body = await req.json();
		} catch {
			body = {};
		}
		const data = await quickAccessController.toggle(id, body, admin.id);
		return NextResponse.json(data, { status: data.statusCode || 200 });
	} catch (error) {
		return NextResponse.json(
			{ success: false, message: error.message || 'Internal Server Error' },
			{ status: 500 },
		);
	}
}
