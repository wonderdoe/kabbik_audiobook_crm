import { NextResponse } from 'next/server';
import AudioBookController from '../../controllers/audiobook-controller';

export const dynamic = 'force-dynamic';
export async function POST(req) {
	let passedValue = await new NextResponse(req.body).text();
	let bodyreq = JSON.parse(passedValue);

	const { name, description, isfree, file_path } = bodyreq;

	try {
		const data = await AudioBookController.addEpisode(name, description, isfree, file_path);
		return NextResponse.json(data);
	} catch (error) {}
}
