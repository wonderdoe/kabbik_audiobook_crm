import { NextResponse } from 'next/server';
import RevenueController from '../../controllers/revenue-controller';

export const dynamic = 'force-dynamic';

export async function GET(req) {
	const startDate = req.nextUrl.searchParams.get('startDate');
	const endDate = req.nextUrl.searchParams.get('endDate');
	const day = req.nextUrl.searchParams.get('day');
	const limit = req.nextUrl.searchParams.get('limit');
	const offset = req.nextUrl.searchParams.get('offset');
	try {
		const data = await RevenueController.getRentReport(startDate, endDate, day, limit, offset);
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
