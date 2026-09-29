import { NextResponse } from 'next/server';
import SubscriptionUserController from '../../../controllers/subscription-user-controller';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
	const { id } = params;

	try {
		const data = await SubscriptionUserController.getSubsUserDetails(id);
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{
				message: error.message || 'Internal Server Error',
			},
			{
				status: 500,
			},
		);
	}
}
