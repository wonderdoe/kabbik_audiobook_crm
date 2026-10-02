import { NextResponse } from 'next/server';
import CommunityPostsController from '../../../controllers/community-posts-controller';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
	try {
		const payload = await CommunityPostsController.getPost(params.id);
		if (!payload) {
			return NextResponse.json({ message: 'Post not found' }, { status: 404 });
		}
		return NextResponse.json(payload);
	} catch (error) {
		return NextResponse.json(
			{ message: error?.message || 'Internal Server Error' },
			{ status: 500 },
		);
	}
}

export async function DELETE(_req, { params }) {
	try {
		const data = await CommunityPostsController.deletePost(params.id);
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
