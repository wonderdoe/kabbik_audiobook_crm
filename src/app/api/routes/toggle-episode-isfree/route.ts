import { NextRequest, NextResponse } from 'next/server';
import EpisodeController from '../../controllers/episode-controller';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
	const searchParams = Object.fromEntries(req.nextUrl.searchParams);
	try {
		const data = await EpisodeController.toggleEpisodeIsFree(searchParams);
		if (!data) {
			return NextResponse.json(
				{ success: false, message: 'Something went wrong' },
				{ status: 500 },
			);
		}
		return NextResponse.json({ success: true, message: 'Episode updated' }, { status: 200 });
	} catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: 'An error occured' }, { status: 500 });
	}
}
