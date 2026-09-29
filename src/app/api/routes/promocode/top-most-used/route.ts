import { NextRequest, NextResponse } from 'next/server';
import PromoController from '../../../controllers/promocode-controller';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const day = req.nextUrl.searchParams.get('day');
	try {
		const data = await PromoController.getTopMostUsedPromocodes(day);
		return NextResponse.json(data, { status: 200 });
	} catch (err) {
		return NextResponse.json({ message: err }, { status: 500 });
	}
}
