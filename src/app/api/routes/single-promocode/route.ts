import { NextRequest, NextResponse } from 'next/server';
import PromocodeController from '../../controllers/promocode-controller';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const promocode = req.nextUrl.searchParams.get('promocode');
	try {
		const data = await PromocodeController.searchPromocodeGroupwise(promocode);
		return NextResponse.json(data);
	} catch (err) {
		console.error(err);
		return NextResponse.json({ message: err }, { status: 500 });
	}
}
