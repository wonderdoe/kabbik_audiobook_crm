import { NextResponse } from 'next/server';
import ReviewController from '../../../controllers/bookreview-controller';

export const dynamic = 'force-dynamic';

export async function DELETE(_req, { params }) {
	try {
		const data = await ReviewController.deleteReview(params.id);

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
