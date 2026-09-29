import { NextResponse } from 'next/server';
import PromoController from '../../controllers/promocode-controller';

export const dynamic = 'force-dynamic';

export async function GET(req) {
	const offset = req.nextUrl.searchParams.get('offset');
	const limit = req.nextUrl.searchParams.get('limit');
	const type = req.nextUrl.searchParams.get('type');
	const startDate = req.nextUrl.searchParams.get('startDate');
	const endDate = req.nextUrl.searchParams.get('endDate');

	if (!offset && !limit) {
		try {
			
			const data = await PromoController.getAllPromocode();
			return NextResponse.json(data);
		} catch (err) {
			return NextResponse.json({ message: err }, { status: 500 });
		}
	} else {
		try {
			const data = await PromoController.getAllPromoByDateFilter(
				type,
				offset,
				limit,
				startDate,
				endDate,
			);
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
}

export async function POST(req) {
	let passedValue = await new NextResponse(req.body).text();
	let bodyreq = JSON.parse(passedValue);
	const { promocode, for_package } = bodyreq;
	try {
		const data = await PromoController.getPromoSubscriptionData(promocode, for_package);
		if (data) {
			return NextResponse.json(data);
		}
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

export async function PUT(req) {
	const id = req.nextUrl.searchParams.get('id');
	try {
		const data = await PromoController.togglePromocodeActivity(id);
		return NextResponse.json(
			{ message: 'Promocode activity updated', success: true },
			{ status: 200 },
		);
	} catch (err) {
		console.error(err);
		return NextResponse.json({ message: err, success: false }, { status: 500 });
	}
}
