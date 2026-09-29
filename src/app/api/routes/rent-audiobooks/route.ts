import { NextRequest, NextResponse } from 'next/server';
import AudioBookController from '../../controllers/audiobook-controller';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const searchParams = Object.fromEntries(req.nextUrl.searchParams);
	try {
		const data = await AudioBookController.getRentAudiobooks(searchParams);
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json({ message: error }, { status: 500 });
	}
}
