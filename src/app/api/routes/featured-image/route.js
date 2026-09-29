import { NextResponse } from 'next/server';
import FeaturedController from '../../controllers/featured-controller';

export const dynamic = 'force-dynamic';
export async function GET(req) {
	try {
		const data = await FeaturedController.getFeatured();
		return NextResponse.json(data);
	} catch (error) {}
}

export async function POST(req) {
	let passedValue = await new NextResponse(req.body).text();
	let bodyreq = JSON.parse(passedValue);

	const { audiobook_id } = bodyreq;

	try {
		const data = await FeaturedController.addFeatureBanner(audiobook_id);
		return NextResponse.json(data);
	} catch (error) {}
}
