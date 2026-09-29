import { NextResponse } from 'next/server';
import AudioBookController from '../../controllers/audiobook-controller';

export const dynamic = 'force-dynamic';

export async function POST(req) {
	let passedValue = await new NextResponse(req.body).text();
	let bodyreq = JSON.parse(passedValue);
	const { audiobook_id } = bodyreq;
	try {
		const data = await AudioBookController.getEpisode(audiobook_id);
		return NextResponse.json(data);
	} catch (error) {}
}
