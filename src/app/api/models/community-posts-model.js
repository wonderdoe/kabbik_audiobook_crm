import DB from '../../../server/config/db.js';

class CommunityPostsModel {
	listPosts = async (offset, limit, search = '') => {
		try {
			const term = String(search ?? '').trim();
			const searchClause = term
				? ` AND (p.title LIKE ? OR p.content LIKE ? OR u.full_name LIKE ? OR u.user_name LIKE ?)`
				: '';
			const searchParams = term ? [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`] : [];

			const baseFrom = `
				FROM posts p
				LEFT JOIN users u ON p.user_id = u.id
				LEFT JOIN audiobooks a ON p.audiobook_id = a.id
				WHERE p.deleted = 0`;

			const sql = `
				SELECT
					p.*,
					u.full_name,
					u.user_name,
					u.image_url AS user_image_url,
					a.name AS audiobook_name
				${baseFrom}${searchClause}
				ORDER BY p.created_at DESC
				LIMIT ? OFFSET ?`;

			const countSql = `SELECT COUNT(*) AS total ${baseFrom}${searchClause}`;

			const data = await DB.query(sql, [...searchParams, Number(limit), Number(offset)]);
			const countRows = await DB.query(countSql, searchParams);

			return {
				data,
				total: countRows[0]?.total ?? 0,
			};
		} catch (error) {
			console.error('[community-posts] listPosts', error);
			return { data: [], total: 0 };
		}
	};

	getPostById = async id => {
		try {
			const sql = `
				SELECT
					p.*,
					u.full_name,
					u.user_name,
					u.image_url AS user_image_url,
					a.name AS audiobook_name
				FROM posts p
				LEFT JOIN users u ON p.user_id = u.id
				LEFT JOIN audiobooks a ON p.audiobook_id = a.id
				WHERE p.id = ? AND p.deleted = 0
				LIMIT 1`;
			const rows = await DB.query(sql, [id]);
			return rows[0] ?? null;
		} catch (error) {
			console.error('[community-posts] getPostById', error);
			return null;
		}
	};

	_commentParentClause(parentId) {
		const isRoot = parentId == null || parentId === '' || parentId === 'root';
		if (isRoot) {
			return {
				clause: ' AND (c.parent_comment_id IS NULL OR c.parent_comment_id = 0)',
				params: [],
			};
		}
		return { clause: ' AND c.parent_comment_id = ?', params: [Number(parentId)] };
	}

	countComments = async (postId, parentId = null) => {
		try {
			const { clause, params } = this._commentParentClause(parentId);
			const sql = `
				SELECT COUNT(*) AS total
				FROM post_comments c
				WHERE c.post_id = ? AND c.deleted = 0${clause}`;
			const rows = await DB.query(sql, [postId, ...params]);
			return rows[0]?.total ?? 0;
		} catch (error) {
			console.error('[community-posts] countComments', error);
			return 0;
		}
	};

	listComments = async (postId, { parentId = null, offset = 0, limit = 25 } = {}) => {
		try {
			const { clause, params } = this._commentParentClause(parentId);
			const sql = `
				SELECT
					c.*,
					u.full_name,
					u.user_name,
					u.image_url AS user_image_url,
					(
						SELECT COUNT(*)
						FROM post_comments r
						WHERE r.parent_comment_id = c.id AND r.deleted = 0
					) AS reply_count
				FROM post_comments c
				LEFT JOIN users u ON c.user_id = u.id
				WHERE c.post_id = ? AND c.deleted = 0${clause}
				ORDER BY c.created_at ASC
				LIMIT ? OFFSET ?`;
			return await DB.query(sql, [postId, ...params, Number(limit), Number(offset)]);
		} catch (error) {
			console.error('[community-posts] listComments', error);
			return [];
		}
	};

	softDeletePost = async id => {
		try {
			const sql = `UPDATE posts SET deleted = 1, updated_at = NOW() WHERE id = ? AND deleted = 0`;
			const result = await DB.query(sql, [id]);
			if (!result?.affectedRows) {
				return { deleted: false };
			}
			await DB.query(
				`UPDATE post_comments SET deleted = 1, updated_at = NOW() WHERE post_id = ? AND deleted = 0`,
				[id],
			);
			return { deleted: true };
		} catch (error) {
			console.error('[community-posts] softDeletePost', error);
			throw error;
		}
	};

	softDeleteComment = async id => {
		try {
			const sql = `UPDATE post_comments SET deleted = 1, updated_at = NOW() WHERE id = ? AND deleted = 0`;
			const result = await DB.query(sql, [id]);
			if (!result?.affectedRows) {
				return { deleted: false };
			}
			return { deleted: true };
		} catch (error) {
			console.error('[community-posts] softDeleteComment', error);
			throw error;
		}
	};
}

export default new CommunityPostsModel();
