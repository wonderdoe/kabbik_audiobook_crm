import { NextResponse } from 'next/server';
import AudioBookController from '../../controllers/audiobook-controller';

export const dynamic = 'force-dynamic';
export async function GET(req) {
	const offset = req.nextUrl.searchParams.get('offset');
	const limit = req.nextUrl.searchParams.get('limit');
	try {
		const data = await AudioBookController.getFeaturedList(offset,limit);
		if (data) {
			return NextResponse.json(data);
		}
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
