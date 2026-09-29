import { NextResponse } from 'next/server';
import UserAdminController from '../../controllers/useradmin-controller';
import { cookies } from 'next/headers';

export async function POST(req) {
	// let passedValue = await new NextResponse(req.body).text();

	// let bodyreq = JSON.parse(passedValue);

	const cookieStore = cookies();
	const name = cookieStore.get('access-token').value;
	//     const requestHeaders = new Headers(req.headers);
	// const accessTokenFromHeader = requestHeaders.get('access-token');
	//

	try {
		const data = await UserAdminController.logOut(name);

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
