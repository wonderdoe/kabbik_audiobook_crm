import { NextResponse } from 'next/server';
import CommunityPostsController from '../../controllers/community-posts-controller';

export const dynamic = 'force-dynamic';

export async function GET(req) {
	const offset = Number(req.nextUrl.searchParams.get('offset') ?? 0);
	const limit = Number(req.nextUrl.searchParams.get('limit') ?? 10);
	const search = req.nextUrl.searchParams.get('search') ?? '';

	try {
		const data = await CommunityPostsController.listPosts(offset, limit, search);
		return NextResponse.json({
			data: data.data ?? [],
			total: data.total ?? 0,
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ message: error?.message || 'Failed to load posts', data: [], total: 0 },
			{ status: 500 },
		);
	}
}
