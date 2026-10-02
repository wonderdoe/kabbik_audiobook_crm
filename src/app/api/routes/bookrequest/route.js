import { NextResponse } from 'next/server';
import BookRequestController from '../../controllers/bookrequest-controller';

export const dynamic = 'force-dynamic';

export async function GET(req) {
	const offset = req.nextUrl.searchParams.get('offset');
	const limit = req.nextUrl.searchParams.get('limit');
	const search = req.nextUrl.searchParams.get('search') ?? '';
	try {
		const data = await BookRequestController.getBookList(offset, limit, search);
		return NextResponse.json({
			data: data?.data ?? [],
			total: data?.total ?? 0,
		});
	} catch (error) {
		return NextResponse.json(
			{ message: String(error), data: [], total: 0 },
			{ status: 500 },
		);
	}
}
