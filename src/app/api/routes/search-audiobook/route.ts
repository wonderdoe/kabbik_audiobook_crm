import { NextRequest, NextResponse } from 'next/server';
import audiobookController from '../../controllers/audiobook-controller';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const searchQuery = req.nextUrl.searchParams.get('search');
	try {
		const data = await audiobookController.getSearchedAudiobooks(searchQuery);
		return NextResponse.json({ data, success: true });
	} catch (err) {
		console.error(err);
		return NextResponse.json(
			{ error: 'Could not get search result', success: false },
			{ status: 500 },
		);
	}
}
