import { NextResponse } from 'next/server';
import PopupController from '../../../controllers/popup-controller';

export async function POST(req,{params}) {
	

    let passedValue = await new NextResponse(req.body).text();

	 let bodyreq = JSON.parse(passedValue);
    const {id} = params;
	
	try {
		const data = await PopupController.togglePopUp(id,bodyreq);
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

export async function PATCH(req,{params}) {


	let passedValue = await new NextResponse(req.body).text();

	let bodyreq = JSON.parse(passedValue);


	const { image_url } = bodyreq;
   
    const {id} = params;

	 
	try {
		const data = await PopupController.updatePopUpImage(id, image_url);
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
export const dynamic = "force-dynamic";

