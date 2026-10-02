'use client';

import {
	Avatar,
	Box,
	Button,
	CircularProgress,
	IconButton,
	Stack,
	Tooltip,
	Typography,
	alpha,
	useTheme,
} from '@mui/material';
import { IconTrash } from '@tabler/icons-react';
import moment from 'moment';
import type { ReactNode } from 'react';
import { ClampableText } from './ClampableText';
import type { RepliesSlice } from './commentThreadState';

export type CommunityCommentNode = {
	id: number;
	post_id: number;
	user_id: number;
	parent_comment_id?: number | null;
	comment?: string;
	like_count?: number;
	reply_count?: number;
	created_at?: string;
	full_name?: string;
	user_name?: string;
	user_image_url?: string;
	children?: CommunityCommentNode[];
};

function initials(name?: string) {
	const parts = String(name ?? '')
		.trim()
		.split(/\s+/)
		.filter(Boolean);
	if (!parts.length) return '?';
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

type CommentRowProps = {
	node: CommunityCommentNode;
	depth: number;
	canDelete: boolean;
	onDelete: (id: number) => void;
	repliesByParentId: Record<number, RepliesSlice>;
	onLoadReplies: (parentId: number) => void;
	onLoadMoreReplies: (parentId: number) => void;
};

function CommentRow({
	node,
	depth,
	canDelete,
	onDelete,
	repliesByParentId,
	onLoadReplies,
	onLoadMoreReplies,
}: CommentRowProps) {
	const theme = useTheme();
	const spine = depth > 0;
	const replySlice = repliesByParentId[node.id];
	const replyCount = Number(node.reply_count ?? 0);
	const children = node.children ?? [];
	const repliesVisible = Boolean(replySlice?.loaded);
	const showLoadReplies = replyCount > 0 && !repliesVisible && !replySlice?.loading;

	return (
		<Box sx={{ pl: depth > 0 ? 2 : 0 }}>
			<Stack
				direction="row"
				spacing={1.5}
				alignItems="flex-start"
				sx={{
					position: 'relative',
					py: 1,
					...(spine && {
						borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.25)}`,
						ml: 1,
						pl: 2,
					}),
				}}
			>
				<Avatar
					src={node.user_image_url || undefined}
					sx={{ width: 32, height: 32, fontSize: 12, bgcolor: 'primary.main' }}
				>
					{initials(node.full_name || node.user_name)}
				</Avatar>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
						<Typography variant="subtitle2" fontWeight={600}>
							{node.full_name || 'Unknown'}
						</Typography>
						{node.user_name ? (
							<Typography variant="caption" color="text.secondary">
								@{node.user_name}
							</Typography>
						) : null}
						<Typography variant="caption" color="text.secondary">
							{node.created_at ? moment(node.created_at).fromNow() : ''}
						</Typography>
					</Stack>
					<Box sx={{ mt: 0.5 }}>
						<ClampableText text={node.comment || ''} />
					</Box>
					{showLoadReplies ? (
						<Button
							size="small"
							variant="text"
							sx={{ mt: 0.5, px: 0, minWidth: 0 }}
							onClick={() => onLoadReplies(node.id)}
						>
							Show replies ({replyCount})
						</Button>
					) : null}
					{replySlice?.loading ? (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
							<CircularProgress size={14} />
							<Typography variant="caption" color="text.secondary">Loading replies…</Typography>
						</Box>
					) : null}
				</Box>
				{canDelete ? (
					<Tooltip title="Remove comment">
						<IconButton
							size="small"
							color="error"
							onClick={() => onDelete(node.id)}
							sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
						>
							<IconTrash size={16} />
						</IconButton>
					</Tooltip>
				) : null}
			</Stack>
			{repliesVisible && children.length > 0
				? children.map(child => (
						<CommentRow
							key={child.id}
							node={child}
							depth={depth + 1}
							canDelete={canDelete}
							onDelete={onDelete}
							repliesByParentId={repliesByParentId}
							onLoadReplies={onLoadReplies}
							onLoadMoreReplies={onLoadMoreReplies}
						/>
					))
				: null}
			{repliesVisible && replySlice?.hasMore ? (
				<Box sx={{ pl: depth > 0 ? 4 : 2, pb: 1 }}>
					<Button
						size="small"
						variant="text"
						disabled={replySlice.loadingMore}
						onClick={() => onLoadMoreReplies(node.id)}
					>
						{replySlice.loadingMore ? 'Loading…' : 'Load more replies'}
					</Button>
				</Box>
			) : null}
		</Box>
	);
}

type CommentThreadProps = {
	comments: CommunityCommentNode[];
	canDelete: boolean;
	onDeleteComment: (id: number) => void;
	emptyMessage?: ReactNode;
	hasMoreRoots?: boolean;
	loadingMoreRoots?: boolean;
	onLoadMoreRoots?: () => void;
	repliesByParentId: Record<number, RepliesSlice>;
	onLoadReplies: (parentId: number) => void;
	onLoadMoreReplies: (parentId: number) => void;
};

export function CommentThread({
	comments,
	canDelete,
	onDeleteComment,
	emptyMessage = 'No comments yet',
	hasMoreRoots,
	loadingMoreRoots,
	onLoadMoreRoots,
	repliesByParentId,
	onLoadReplies,
	onLoadMoreReplies,
}: CommentThreadProps) {
	if (!comments?.length) {
		return (
			<Box sx={{ py: 4, textAlign: 'center' }}>
				<Typography variant="body2" color="text.secondary">{emptyMessage}</Typography>
			</Box>
		);
	}

	return (
		<Stack spacing={0.5}>
			{comments.map(node => (
				<CommentRow
					key={node.id}
					node={node}
					depth={0}
					canDelete={canDelete}
					onDelete={onDeleteComment}
					repliesByParentId={repliesByParentId}
					onLoadReplies={onLoadReplies}
					onLoadMoreReplies={onLoadMoreReplies}
				/>
			))}
			{hasMoreRoots ? (
				<Box sx={{ pt: 1, textAlign: 'center' }}>
					<Button
						variant="outlined"
						size="small"
						disabled={loadingMoreRoots}
						onClick={onLoadMoreRoots}
					>
						{loadingMoreRoots ? 'Loading…' : 'Load more comments'}
					</Button>
				</Box>
			) : null}
		</Stack>
	);
}
