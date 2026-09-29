import { NextRequest, NextResponse } from 'next/server';
import SubscriptionUserController from '../../controllers/subscription-user-controller';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const date = req.nextUrl.searchParams.get('date');
	try {
		const data = await SubscriptionUserController.getSubcribedUser(date);
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{
				message: error,
			},
			{
				status: 500,
			},
		);
	}
}
