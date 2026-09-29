import { NextRequest, NextResponse } from 'next/server';
import audioBookCategoryController from '../../controllers/audioBookCategoryController';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const audiobookId = req.nextUrl.searchParams.get('audiobookId');
	try {
		const data = await audioBookCategoryController.getCategoryForSingleAudiobook(audiobookId);
		return NextResponse.json(data);
	} catch (err) {
		console.error(err);
		return NextResponse.json({ message: err }, { status: 500 });
	}
}
