import { NextRequest, NextResponse } from 'next/server';
import userCountController from '../../controllers/user-count-controller';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const date = req.nextUrl.searchParams.get('date');
	try {
		const data = await userCountController.usercount(date);
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
