import { NextResponse } from 'next/server';
import PromotionBannerController from '../../../controllers/promotionbanner-controller';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
	try {
		const data = await PromotionBannerController.getBanner(params.id);

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

export async function PATCH(req, { params }) {
	try {
		const body = await req.json();
		const data = await PromotionBannerController.updateBanner(params.id, body);

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

export async function DELETE(_req, { params }) {
	try {
		const data = await PromotionBannerController.deleteBanner(params.id);

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
