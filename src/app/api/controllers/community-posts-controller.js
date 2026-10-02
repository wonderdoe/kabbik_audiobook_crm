import CommunityPostsModel from '../models/community-posts-model.js';

function mapCommentRow(row) {
	return {
		...row,
		reply_count: Number(row.reply_count ?? 0),
		children: [],
	};
}

class CommunityPostsController {
	async listPosts(offset, limit, search) {
		try {
			return await CommunityPostsModel.listPosts(offset, limit, search);
		} catch (error) {
			console.error(error);
			return { data: [], total: 0 };
		}
	}

	async getPost(id) {
		try {
			const post = await CommunityPostsModel.getPostById(id);
			if (!post) {
				return null;
			}
			return { post };
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	async listCommentsPage(postId, parentId, offset, limit) {
		try {
			const safeOffset = Math.max(0, Number(offset) || 0);
			const safeLimit = Math.min(100, Math.max(1, Number(limit) || 25));
			const total = await CommunityPostsModel.countComments(postId, parentId);
			const rows = await CommunityPostsModel.listComments(postId, {
				parentId,
				offset: safeOffset,
				limit: safeLimit,
			});
			const data = rows.map(mapCommentRow);
			return {
				data,
				total,
				offset: safeOffset,
				limit: safeLimit,
				hasMore: safeOffset + data.length < total,
			};
		} catch (error) {
			console.error(error);
			return { data: [], total: 0, offset: 0, limit: 25, hasMore: false };
		}
	}

	async deletePost(id) {
		try {
			const result = await CommunityPostsModel.softDeletePost(id);
			if (!result?.deleted) {
				return {
					success: false,
					message: 'Post not found',
					statusCode: 404,
				};
			}
			return {
				success: true,
				message: 'Post removed from community',
				statusCode: 200,
			};
		} catch (error) {
			return {
				success: false,
				message: error?.message || 'Failed to delete post',
				statusCode: 500,
			};
		}
	}

	async deleteComment(id) {
		try {
			const result = await CommunityPostsModel.softDeleteComment(id);
			if (!result?.deleted) {
				return {
					success: false,
					message: 'Comment not found',
					statusCode: 404,
				};
			}
			return {
				success: true,
				message: 'Comment removed',
				statusCode: 200,
			};
		} catch (error) {
			return {
				success: false,
				message: error?.message || 'Failed to delete comment',
				statusCode: 500,
			};
		}
	}
}

export default new CommunityPostsController();
