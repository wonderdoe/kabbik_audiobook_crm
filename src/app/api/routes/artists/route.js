import { NextResponse } from 'next/server';
import ArtistController from '../../controllers/artists-controller';

export const dynamic = 'force-dynamic';

export async function GET() {
	try {
		const data = await ArtistController.getArtists();
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{
				message: error,
			},

			{
				status: 500,
			},
		);
	}
}
