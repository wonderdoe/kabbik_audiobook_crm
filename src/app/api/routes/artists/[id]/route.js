import { NextResponse } from 'next/server';
import ArtistController from '../../../controllers/artists-controller';

export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
	const { id } = params;
	try {
		let passedValue = await new NextResponse(req.body).text();
		let bodyreq = JSON.parse(passedValue);
		const { name, en_name, imageUrl } = bodyreq;
		const data = await ArtistController.editArtist(id, name, en_name, imageUrl);
		return NextResponse.json(data);
	} catch (error) {
		console.error('[artists PATCH]', error);
		return NextResponse.json(
			{ message: error?.message ?? 'Internal server error' },
			{ status: 500 },
		);
	}
}
