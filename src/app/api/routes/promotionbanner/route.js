import { NextResponse } from 'next/server';
import PromotionBannerController from '../../controllers/promotionbanner-controller';

export const dynamic = 'force-dynamic';

export async function GET(req) {
	try {
		const isActive = req.nextUrl.searchParams.get('is_active');
		const data = await PromotionBannerController.listBanners(isActive);

		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: error.message || 'Internal Server Error',
			},
			{ status: 500 },
		);
	}
}

export async function POST(req) {
	try {
		const body = await req.json();
		const data = await PromotionBannerController.createBanner(body);

		return NextResponse.json(data, { status: data.statusCode || 200 });
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: error.message || 'Internal Server Error',
			},
			{ status: 500 },
		);
	}
}
