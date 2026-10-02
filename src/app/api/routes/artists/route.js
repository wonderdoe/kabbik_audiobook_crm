import { NextResponse } from 'next/server';
import ArtistController from '../../controllers/artists-controller';

export const dynamic = 'force-dynamic';

export async function GET(req) {
	try {
		const offset = req.nextUrl.searchParams.get('offset') ?? 0;
		const limit = req.nextUrl.searchParams.get('limit') ?? 1000;
		const search = req.nextUrl.searchParams.get('search') ?? '';
		const data = await ArtistController.getArtists(offset, limit, search);
		return NextResponse.json(data);
	} catch (error) {
		console.error('[artists GET]', error);
		return NextResponse.json(
			{ message: error?.message ?? 'Internal server error' },
			{ status: 500 },
		);
	}
}

export async function POST(req) {
	try {
		let passedValue = await new NextResponse(req.body).text();
		let bodyreq = JSON.parse(passedValue);
		const { name, en_name, imageUrl } = bodyreq;
		const data = await ArtistController.addArtist(name, en_name, imageUrl);
		return NextResponse.json(data);
	} catch (error) {
		console.error('[artists POST]', error);
		return NextResponse.json(
			{ message: error?.message ?? 'Internal server error' },
			{ status: 500 },
		);
	}
}
