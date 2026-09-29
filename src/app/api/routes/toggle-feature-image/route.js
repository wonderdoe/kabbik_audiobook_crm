import { NextResponse } from 'next/server';
import FeaturedController from '../../controllers/featured-controller';

export const dynamic = 'force-dynamic';

export async function POST(req) {
	let passedValue = await new NextResponse(req.body).text();
	let bodyreq = JSON.parse(passedValue);

	const { audiobook_id,status } = bodyreq;

	

	try {
		const data = await FeaturedController.toggleFeatureImage(audiobook_id,status);
		return NextResponse.json(data);
	} catch (error) {}
}
