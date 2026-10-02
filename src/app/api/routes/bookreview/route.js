import { NextResponse } from 'next/server';
import ReviewController from '../../controllers/bookreview-controller'

export const dynamic = 'force-dynamic';

export async function GET(req) {
	const offset = req.nextUrl.searchParams.get('offset');
	const limit = req.nextUrl.searchParams.get('limit');
	const search = req.nextUrl.searchParams.get('search') ?? '';
	try {
		const data = await ReviewController.getReview(offset, limit, search);
		if (data && typeof data === 'object' && !data.message) {
			return NextResponse.json({
				data: data.data ?? [],
				total: data.total ?? 0,
			});
		}
		return NextResponse.json({ data: [], total: 0 });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ message: error?.message || 'Failed to load reviews', data: [], total: 0 },
			{ status: 500 },
		);
	}
}


