import { NextResponse } from 'next/server';
import UserAdminController from '../../controllers/useradmin-controller';

export async function POST(req) {
	let passedValue = await new NextResponse(req.body).text();
	let bodyreq = JSON.parse(passedValue);

	try {
		const data = await UserAdminController.signIn(bodyreq);
		return NextResponse.json({
			data,
			status: 200,
		});
	} catch (error) {
		return NextResponse.json({
			message: error.message || 'Internal Server Error',
			status: 500,
		});
	}
}

export const dynamic = 'force-dynamic';
