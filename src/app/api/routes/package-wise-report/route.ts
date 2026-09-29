import { NextRequest, NextResponse } from 'next/server';
import revenueController from '../../controllers/revenue-controller';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const startDate = req.nextUrl.searchParams.get('startDate');
	const endDate = req.nextUrl.searchParams.get('endDate');
	try {
		const data = await revenueController.getPackageWiseRevenue(startDate, endDate);
		return NextResponse.json(data);
	} catch (err) {
		console.error(err);
		return NextResponse.json({ message: err }, { status: 500 });
	}
}
