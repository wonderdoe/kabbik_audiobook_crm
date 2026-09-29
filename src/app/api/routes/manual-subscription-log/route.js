import { NextResponse } from 'next/server';
import SubscriptionUserController from '../../controllers/subscription-user-controller';

export const dynamic = 'force-dynamic';

export async function GET(req) {
	const offset = req.nextUrl.searchParams.get('offset');
	const limit = req.nextUrl.searchParams.get('limit');
	const searchkey = req.nextUrl.searchParams.get('searchkey');
	try {
		const response = await SubscriptionUserController.getManuallySubscribedUsers(offset, limit);
		return NextResponse.json({ response });
	} catch (error) {
		return NextResponse.json(
			{
				error,
			},
			{
				status: 500,
			},
		);
	}
}
