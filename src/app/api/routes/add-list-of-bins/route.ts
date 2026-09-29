import { NextRequest, NextResponse } from 'next/server';
import PromoController from '../../controllers/promocode-controller';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
	const textBody = await new NextResponse(req.body).text();
	const jsonBody = JSON.parse(textBody);
	try {
		const data = await PromoController.addListOfBinsWithoutCardType(jsonBody);
		return NextResponse.json(data);
	} catch (err) {
		return NextResponse.json({ message: err }, { status: 500 });
	}
}
