import { NextResponse } from 'next/server';
import CommunityPostsController from '../../../controllers/community-posts-controller';

export const dynamic = 'force-dynamic';

export async function DELETE(_req, { params }) {
	try {
		const data = await CommunityPostsController.deleteComment(params.id);
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
