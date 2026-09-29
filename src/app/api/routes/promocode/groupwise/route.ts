import { NextRequest, NextResponse } from 'next/server';
import PromoController from '../../../controllers/promocode-controller';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const searchParams = Object.fromEntries(req.nextUrl.searchParams);
	try {
		const data = await PromoController.searchPromocodeGroupwise(searchParams);
		return NextResponse.json(data, { status: 200 });
	} catch (err) {
		return NextResponse.json({ message: err }, { status: 500 });
	}
}
