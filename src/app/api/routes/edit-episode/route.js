import { NextResponse } from 'next/server';
import AudioBookController from '../../controllers/audiobook-controller';

export const dynamic = 'force-dynamic';

export async function PUT(req) {
	let bodyText = await new NextResponse(req.body).text();
	let bodyJSON = JSON.parse(bodyText);

	try {
		const data = await AudioBookController.editEpisode(bodyJSON);
		return NextResponse.json(data);
	} catch (err) {
		return NextResponse.json({ message: err }, { status: 500 });
	}
}
