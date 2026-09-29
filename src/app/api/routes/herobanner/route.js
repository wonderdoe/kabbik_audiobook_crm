import { NextResponse } from 'next/server';
import HeroBannerController from '../../controllers/herobanner-controller';

export const dynamic = 'force-dynamic';

export async function GET(req) {
	const offset = req.nextUrl.searchParams.get('offset');
	const limit = req.nextUrl.searchParams.get('limit');
	try {
		const data = await HeroBannerController.getBannerList(offset, limit);
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



export async function POST(req) {
	let passedValue = await new NextResponse(req.body).text();;
	let bodyreq = JSON.parse(passedValue);

	
	const { audiobook_id, image_url, title }= bodyreq
	try {
		const data = await HeroBannerController.addHeroBannerList(image_url, title,audiobook_id);
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


