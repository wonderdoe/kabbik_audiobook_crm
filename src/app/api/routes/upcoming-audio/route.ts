import { NextRequest, NextResponse } from 'next/server';
import UpcomingAudioController from '../../controllers/upcoming-audio-controller';

export const dynamic = 'force-dynamic';

export async function GET() {
	try {
		const data = await UpcomingAudioController.getUpcoming();
		return NextResponse.json(data);
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

export async function POST(req: NextRequest) {
	let bodyText = await new NextResponse(req.body).text();
	let bodyJSON = JSON.parse(bodyText);
	try {
		const data = await UpcomingAudioController.addUpcoming(bodyJSON);
		return NextResponse.json(data);
	} catch (err) {
		return NextResponse.json(
			{
				message: err,
				statusCode: 500,
			},
			{
				status: 500,
			},
		);
	}
}

export async function PUT(req: NextRequest) {
	const bodyText = await new NextResponse(req.body).text();
	const bodyJSON = JSON.parse(bodyText);
	try {
		const data = await UpcomingAudioController.updateUpcoming(bodyJSON);
		return NextResponse.json(data);
	} catch (err) {
		return NextResponse.json({ message: err, statusCode: 500 }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest) {
	const id = req.nextUrl.searchParams.get('id');
	try {
		const data = await UpcomingAudioController.deleteUpcoming(id);
		return NextResponse.json(data);
	} catch (err) {
		return NextResponse.json({ message: err }, { status: 500 });
	}
}
