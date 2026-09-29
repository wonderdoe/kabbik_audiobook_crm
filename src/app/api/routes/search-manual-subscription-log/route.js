import { NextResponse } from 'next/server';
import subscriptionUserController from '../../controllers/subscription-user-controller';

export const dynamic = 'force-dynamic';

export async function GET(req) {
	const searchkey = req.nextUrl.searchParams.get('searchkey');
	const offset = req.nextUrl.searchParams.get('offset');
	const limit = req.nextUrl.searchParams.get('limit');
	try {
		const data = await subscriptionUserController.searchManuallySubscribedUsers(
			offset,
			limit,
			searchkey,
		);
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json({ message: error }, { status: 500 });
	}
}
