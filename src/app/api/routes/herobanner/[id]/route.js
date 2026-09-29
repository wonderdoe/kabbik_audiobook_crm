import { NextResponse } from 'next/server';
import HeroBannerController from '../../../controllers/herobanner-controller';

export const dynamic = 'force-dynamic';

export async function PATCH(req, { params }) {
	let passedValue = await new NextResponse(req.body).text();

	let bodyreq = JSON.parse(passedValue);

	const { id } = params;
	const { image_url } = bodyreq;

	try {
		const data = await HeroBannerController.uploadBannerImg(id, image_url);
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




export async function DELETE(req, { params }) {
	

	const { id } = params;
	

	try {
		const data = await HeroBannerController.deleteBanner(id);
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

