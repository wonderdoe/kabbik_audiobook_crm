import { NextResponse } from 'next/server';
import SubscriptionUserController from '../../controllers/subscription-user-controller';

export const dynamic = 'force-dynamic';

export async function GET(req) {
	const offset = req.nextUrl.searchParams.get('offset');
	const limit = req.nextUrl.searchParams.get('limit');
	try {
		const response = await SubscriptionUserController.getSubList(offset, limit);
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

export async function POST(req) {
	console.log("from routes")
	let passedValue = await new NextResponse(req.body).text();
	let body = JSON.parse(passedValue);
	try {
		const data = await SubscriptionUserController.giveSubscriptionToUser(body);
		if (data.response1.changedRows === 1 && data.response2?.affectedRows === 1) {
			return NextResponse.json({ message: 'Subscription provided' }, { status: 201 });
		} else if (data.response1.changedRows === 0 && data.response2 === undefined) {
			return NextResponse.json({ message: 'Already subscribed' }, { status: 200 });
		}
		return NextResponse.json({ message: 'Subscription failed' }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
