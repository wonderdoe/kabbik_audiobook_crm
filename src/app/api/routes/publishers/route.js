import { NextResponse } from 'next/server';

import publisherController from '../../controllers/publisher.controller';
import { genHash } from '../../utils/bcrypt';

export const dynamic = 'force-dynamic';

export async function GET(req) {
	const offset = req.nextUrl.searchParams.get('offset');
	const limit = req.nextUrl.searchParams.get('limit');
	try {
		const data = await publisherController.getPublisher(offset, limit);
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
	// const data = await req.formData();

	// const imageUrl = data.get('imageUrl');
	// const full_name = data.get('full_name');
	// const en_name = data.get('en_name');

	// const email = data.get('email');
	// const phone = data.get('phone');

	// const address = data.get('address');
	// const password = genHash(data.get('password'));
	let passedValue = await new NextResponse(req.body).text();
    let bodyreq = JSON.parse(passedValue);

	
	

	const {imageUrl,
		full_name,
		en_name,
		email,
		phone,
		address,
		password,} =bodyreq

	try {
		const data = await publisherController.addPublisher(
			imageUrl,
			full_name,
			en_name,
			email,
			phone,
			address,
			password,
		);
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
