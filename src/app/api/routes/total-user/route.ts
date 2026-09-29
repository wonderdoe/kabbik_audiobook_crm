import { NextRequest, NextResponse } from 'next/server';
import TotalUserController from '../../controllers/total-users-controller';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const date = req.nextUrl.searchParams.get('date');
	try {
		const data = await TotalUserController.getTotal(date);
		return NextResponse.json(data, {
			headers: {
				'Cache-Control': 'no-store',
			},
		});
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
