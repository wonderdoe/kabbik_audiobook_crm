import { NextResponse } from 'next/server';
import quickAccessController from '../../../controllers/quick-access-controller';
import { getAdminFromRequest, unauthorizedResponse } from '../../../utils/require-admin';

export const dynamic = 'force-dynamic';

function parseId(params) {
	const id = Number(params.id);
	if (!Number.isInteger(id) || id < 1) return null;
	return id;
}

export async function PUT(req, { params }) {
	const admin = getAdminFromRequest(req);
	if (!admin) return unauthorizedResponse();

	const id = parseId(params);
	if (!id) {
		return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 });
	}

	try {
		const body = await req.json();
		const data = await quickAccessController.replace(id, body, admin.id);
		return NextResponse.json(data, { status: data.statusCode || 200 });
	} catch (error) {
		return NextResponse.json(
			{ success: false, message: error.message || 'Internal Server Error' },
			{ status: 500 },
		);
	}
}

export async function DELETE(req, { params }) {
	const admin = getAdminFromRequest(req);
	if (!admin) return unauthorizedResponse();

	const id = parseId(params);
	if (!id) {
		return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 });
	}

	try {
		const data = await quickAccessController.delete(id);
		return NextResponse.json(data, { status: data.statusCode || 200 });
	} catch (error) {
		return NextResponse.json(
			{ success: false, message: error.message || 'Internal Server Error' },
			{ status: 500 },
		);
	}
}
