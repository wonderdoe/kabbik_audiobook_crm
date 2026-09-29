import { NextRequest, NextResponse } from 'next/server';
import PromoController from '../../controllers/promocode-controller';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const promocode = req.nextUrl.searchParams.get('promocode');
	const packageId = req.nextUrl.searchParams.get('packageId');
	try {
		const data = await PromoController.findOne(promocode, packageId);
		return NextResponse.json(data);
	} catch (err) {
		return NextResponse.json({ message: err }, { status: 500 });
	}
}
