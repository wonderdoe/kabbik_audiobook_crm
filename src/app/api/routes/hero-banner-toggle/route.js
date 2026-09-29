
import { NextResponse } from 'next/server';
import HeroBannerController from '../../controllers/herobanner-controller';

export const dynamic = 'force-dynamic';
export async function POST(req) {
	 let passedValue = await new NextResponse(req.body).text();

	 let bodyreq = JSON.parse(passedValue);



    const { audiobook_id, status} = bodyreq
   

	try {
		const data = await HeroBannerController.toggleHeroBanner(audiobook_id, status);
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