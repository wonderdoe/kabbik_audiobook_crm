'use client';

import {
	Avatar,
	Box,
	Chip,
	Collapse,
	IconButton,
	Paper,
	Stack,
	Tooltip,
	Typography,
	alpha,
	useTheme,
} from '@mui/material';
import { IconChevronDown, IconChevronUp, IconHeart, IconMessage, IconShare, IconTrash } from '@tabler/icons-react';
import moment from 'moment';
import { ClampableText } from './ClampableText';
import { CommentThread } from './CommentThread';
import type { PostThreadState } from './commentThreadState';

export type CommunityPost = {
	id: number;
	title?: string;
	content?: string;
	user_id?: number;
	audiobook_id?: number;
	post_type_id?: number;
	like_count?: number;
	comment_count?: number;
	share_count?: number;
	status?: number;
	is_spoiler?: number;
	created_at?: string;
	full_name?: string;
	user_name?: string;
	user_image_url?: string;
	audiobook_name?: string;
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

type CommunityPostCardProps = {
	post: CommunityPost;
	expanded: boolean;
	onToggleExpand: () => void;
	thread: PostThreadState;
	canDelete: boolean;
	onDeletePost: (id: number) => void;
	onDeleteComment: (id: number) => void;
	onLoadMoreRoots: () => void;
	onLoadReplies: (parentId: number) => void;
	onLoadMoreReplies: (parentId: number) => void;
};

export function CommunityPostCard({
	post,
	expanded,
	onToggleExpand,
	thread,
	canDelete,
	onDeletePost,
	onDeleteComment,
	onLoadMoreRoots,
	onLoadReplies,
	onLoadMoreReplies,
}: CommunityPostCardProps) {
	const theme = useTheme();
	const body = post.content || '';

	return (
		<Paper
			variant="outlined"
			elevation={0}
			sx={{
				borderRadius: 2,
				overflow: 'hidden',
				transition: 'background-color 0.2s, border-color 0.2s',
				borderColor: expanded ? alpha(theme.palette.primary.main, 0.45) : 'divider',
				borderLeftWidth: expanded ? 3 : 1,
				borderLeftColor: expanded ? 'primary.main' : undefined,
				'&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.04) },
			}}
		>
			<Box sx={{ p: 2 }}>
				<Stack direction="row" spacing={1.5} alignItems="flex-start">
					<Avatar
						src={post.user_image_url || undefined}
						sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
					>
						{initials(post.full_name || post.user_name)}
					</Avatar>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
							<Typography variant="subtitle2" fontWeight={600}>
								{post.full_name || 'Unknown'}
							</Typography>
							{post.user_name ? (
								<Typography variant="caption" color="text.secondary">
									@{post.user_name}
								</Typography>
							) : null}
							<Typography variant="caption" color="text.secondary">
								{post.created_at ? moment(post.created_at).fromNow() : ''}
							</Typography>
						</Stack>
						{post.audiobook_name ? (
							<Chip
								size="small"
								label={post.audiobook_name}
								variant="outlined"
								sx={{ mt: 0.75, maxWidth: '100%' }}
							/>
						) : null}
						{post.title ? (
							<Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>
								{post.title}
							</Typography>
						) : null}
						{body ? (
							<Box sx={{ mt: 0.75 }}>
								<ClampableText text={body} />
							</Box>
						) : null}
						<Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1.25 }}>
							{post.is_spoiler ? (
								<Chip size="small" color="warning" variant="outlined" label="Spoiler" />
							) : null}
							{post.status != null ? (
								<Chip size="small" variant="outlined" label={`Status ${post.status}`} />
							) : null}
							<Chip
								size="small"
								variant="outlined"
								icon={<IconHeart size={14} />}
								label={post.like_count ?? 0}
							/>
							<Chip
								size="small"
								variant="outlined"
								icon={<IconMessage size={14} />}
								label={post.comment_count ?? 0}
							/>
							<Chip
								size="small"
								variant="outlined"
								icon={<IconShare size={14} />}
								label={post.share_count ?? 0}
							/>
						</Stack>
					</Box>
					<Stack direction="row" spacing={0.5}>
						<Tooltip title={expanded ? 'Hide thread' : 'View thread'}>
							<IconButton size="small" onClick={onToggleExpand} color="primary">
								{expanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
							</IconButton>
						</Tooltip>
						{canDelete ? (
							<Tooltip title="Remove post">
								<IconButton size="small" color="error" onClick={() => onDeletePost(post.id)}>
									<IconTrash size={18} />
								</IconButton>
							</Tooltip>
						) : null}
					</Stack>
				</Stack>
			</Box>
			<Collapse in={expanded}>
				<Box
					sx={{
						px: 2,
						pb: 2,
						pt: 0,
						borderTop: 1,
						borderColor: 'divider',
						bgcolor: alpha(theme.palette.grey[500], 0.03),
					}}
				>
					<Typography variant="subtitle2" sx={{ py: 1.5 }}>
						Comments
					</Typography>
					<Box sx={{ maxHeight: 'min(60vh, 480px)', overflow: 'auto', pr: 0.5 }}>
						{thread.rootsLoading ? (
							<Typography variant="body2" color="text.secondary">Loading comments…</Typography>
						) : (
							<CommentThread
								comments={thread.roots}
								canDelete={canDelete}
								onDeleteComment={onDeleteComment}
								hasMoreRoots={thread.hasMoreRoots}
								loadingMoreRoots={thread.rootsLoadingMore}
								onLoadMoreRoots={onLoadMoreRoots}
								repliesByParentId={thread.repliesByParentId}
								onLoadReplies={onLoadReplies}
								onLoadMoreReplies={onLoadMoreReplies}
								emptyMessage="No comments yet"
							/>
						)}
					</Box>
				</Box>
			</Collapse>
		</Paper>
	);
}
