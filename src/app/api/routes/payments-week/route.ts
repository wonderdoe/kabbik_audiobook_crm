import { NextRequest, NextResponse } from 'next/server';
import RevenueController from '../../controllers/revenue-controller';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const anchor = req.nextUrl.searchParams.get('date') ?? undefined;
	try {
		const days = await RevenueController.getPaymentsWeek(anchor ?? undefined);
		return NextResponse.json({ days }, { status: 200 });
	} catch (err) {
		console.error('[payments-week GET]', err);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
