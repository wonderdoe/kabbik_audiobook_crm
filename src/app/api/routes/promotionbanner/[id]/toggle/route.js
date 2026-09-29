import { NextResponse } from 'next/server';
import PromotionBannerController from '../../../../controllers/promotionbanner-controller';

export const dynamic = 'force-dynamic';

export async function PATCH(_req, { params }) {
	try {
		const data = await PromotionBannerController.toggleBanner(params.id);

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
