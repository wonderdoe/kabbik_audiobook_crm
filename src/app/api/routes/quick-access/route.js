import { NextResponse } from 'next/server';
import quickAccessController from '../../controllers/quick-access-controller';
import { getAdminFromRequest, unauthorizedResponse } from '../../utils/require-admin';

export const dynamic = 'force-dynamic';

export async function GET(req) {
	const admin = getAdminFromRequest(req);
	if (!admin) return unauthorizedResponse();

	try {
		const data = await quickAccessController.list(req.nextUrl.searchParams);
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{ success: false, message: error.message || 'Internal Server Error' },
			{ status: 500 },
		);
	}
}

export async function POST(req) {
	const admin = getAdminFromRequest(req);
	if (!admin) return unauthorizedResponse();

	try {
		const body = await req.json();
		const data = await quickAccessController.create(body, admin.id);
		return NextResponse.json(data, { status: data.statusCode || 200 });
	} catch (error) {
		return NextResponse.json(
			{ success: false, message: error.message || 'Internal Server Error' },
			{ status: 500 },
		);
	}
}
