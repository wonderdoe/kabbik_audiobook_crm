import { NextRequest, NextResponse } from 'next/server';
import PublisherController from '../../controllers/publisher.controller';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
	const status = req.nextUrl.searchParams.get('status');
	try {
		const data = await PublisherController.getPublisherRequests(status);
		return NextResponse.json(data);
	} catch (err) {
		return NextResponse.json({ message: err }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	const bodyText = await new NextResponse(req.body).text();
	const bodyJson = JSON.parse(bodyText);
	try {
		const data = await PublisherController.acceptPublisherRequest(bodyJson);
		return NextResponse.json(data);
	} catch (err) {
		return NextResponse.json({ message: err }, { status: 500 });
	}
}
