import { NextResponse } from 'next/server';
import SubscriptionUserController from '../../controllers/subscription-user-controller';

export const dynamic = 'force-dynamic';

export async function GET(req) {
	const payerNo = req.nextUrl.searchParams.get('payerNo');
	if (!payerNo?.trim()) {
		return NextResponse.json({ message: 'payerNo is required' }, { status: 400 });
	}
	try {
		const data = await SubscriptionUserController.getPaymentLogByPayerNo(payerNo.trim());
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
