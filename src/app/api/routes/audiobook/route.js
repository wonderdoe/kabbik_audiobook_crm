import { NextResponse } from 'next/server';
import AudioBookController from '../../controllers/audiobook-controller';

export const dynamic = 'force-dynamic';

export async function GET(req) {
	const offset = req.nextUrl.searchParams.get('offset');
	const limit = req.nextUrl.searchParams.get('limit');
	try {
		const data = await AudioBookController.getAudioList(offset, limit);
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

export async function PATCH(req) {
	// const offset = req.nextUrl.searchParams.get('offset');
	// const limit = req.nextUrl.searchParams.get('limit');
	// const { id } = params;
	// const { id, premium } = req.body;
	let passedValue = await new NextResponse(req.body).text();
	let bodyreq = JSON.parse(passedValue);

	try {
		const data = await AudioBookController.checkPremium(bodyreq.id, bodyreq.premium);
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
	// const offset = req.nextUrl.searchParams.get('offset');
	// const limit = req.nextUrl.searchParams.get('limit');
	// const { id } = params;
	// const { id, premium } = req.body;
	let passedValue = await new NextResponse(req.body).text();
	let bodyreq = JSON.parse(passedValue);

	const { name, description, author_name, price, en_name, thumb_path } = bodyreq;

	try {
		const data = await AudioBookController.addAudiobook(
			name,
			description,
			author_name,
			price,
			en_name,
			thumb_path,
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

export async function DELETE(req) {
	const audiobookId = req.nextUrl.searchParams.get('audiobookId');
	try {
		const data = await AudioBookController.delete(audiobookId);
		if (!data) {
			return NextResponse.json({ success: false, message: 'Could not delete' });
		}
		return NextResponse.json({ success: true, message: 'Deleted audiobook' });
	} catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: 'Could not delete' });
	}
}
