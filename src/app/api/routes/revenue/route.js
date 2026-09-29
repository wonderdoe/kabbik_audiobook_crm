import { NextResponse } from 'next/server';
import RevenueController from '../../controllers/revenue-controller';

export const dynamic = 'force-dynamic';

export async function GET(req) {
	const startDate = req.nextUrl.searchParams.get('startDate');
	const endDate = req.nextUrl.searchParams.get('endDate');
	try {
		const data = await RevenueController.getRevenueReport(startDate, endDate);
		if (data) {
			return NextResponse.json(data);
		}
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
