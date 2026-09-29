import { NextResponse } from 'next/server';
import AudioBookController from '../../controllers/audiobook-controller';

export const dynamic = 'force-dynamic';





export async function PATCH(req) {
	// const offset = req.nextUrl.searchParams.get('offset');
	// const limit = req.nextUrl.searchParams.get('limit');
	// const { id } = params;
	// const { id, premium } = req.body;
	    let passedValue = await new NextResponse(req.body).text();;
	    let bodyreq = JSON.parse(passedValue);


        

	const { id, for_rent } = bodyreq;

	try {
		const data = await AudioBookController.updateForRent(id, for_rent);
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




