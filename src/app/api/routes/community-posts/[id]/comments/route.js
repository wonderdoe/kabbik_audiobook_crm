import { NextResponse } from 'next/server';
import CommunityPostsController from '../../../../controllers/community-posts-controller';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
	const offset = Number(req.nextUrl.searchParams.get('offset') ?? 0);
	const limit = Number(req.nextUrl.searchParams.get('limit') ?? 25);
	const parentId = req.nextUrl.searchParams.get('parent_id');

	try {
		const postResult = await CommunityPostsController.getPost(params.id);
		if (!postResult?.post) {
			return NextResponse.json({ message: 'Post not found' }, { status: 404 });
		}

		const payload = await CommunityPostsController.listCommentsPage(
			params.id,
			parentId,
			offset,
			limit,
		);
		return NextResponse.json(payload);
	} catch (error) {
		return NextResponse.json(
			{ message: error?.message || 'Internal Server Error', data: [], total: 0, hasMore: false },
			{ status: 500 },
		);
	}
}
