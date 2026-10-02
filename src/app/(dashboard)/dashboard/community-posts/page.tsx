'use client';

import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Drawer,
	Grid,
	InputAdornment,
	Pagination,
	Paper,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { CommunityPostCard, type CommunityPost } from '@/components/Community/CommunityPostCard';
import {
	REPLIES_PAGE_SIZE,
	ROOT_COMMENTS_PAGE_SIZE,
} from '@/components/Community/communityCommentConstants';
import {
	attachRepliesToTree,
	emptyPostThreadState,
	mapApiComment,
	removeCommentFromTree,
	type PostThreadState,
} from '@/components/Community/commentThreadState';
import Loader from '@/components/Loader';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { StatCard } from '@/components/ui/StatCard';
import { checkNavPermission, createActivityLog } from '@/helper/Commonfunction';
import { useIsMobileSm } from '@/hooks/use-is-mobile-sm';
import { transition } from '@/styles/motion';
import { getTotalPageNumber } from '@/utils/globalHelpers';
import { IconMessage, IconMessages, IconSearch, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

type CommentsApiResponse = {
	data: Record<string, unknown>[];
	total: number;
	offset: number;
	limit: number;
	hasMore: boolean;
};

async function fetchCommentsPage(
	postId: number,
	params: { offset: number; limit: number; parentId?: number },
): Promise<CommentsApiResponse | null> {
	const qs = new URLSearchParams({
		offset: String(params.offset),
		limit: String(params.limit),
	});
	if (params.parentId != null) {
		qs.set('parent_id', String(params.parentId));
	}
	const response = await fetch(`/api/routes/community-posts/${postId}/comments?${qs.toString()}`);
	if (!response.ok) return null;
	return response.json();
}

export default function CommunityPostsPage() {
	const isMobileSm = useIsMobileSm();
	const canView = checkNavPermission(
		'see_community_posts|delete_community_posts|book_reveiw|assign_roles',
	);
	const canDelete = checkNavPermission('delete_community_posts|book_reveiw|assign_roles');

	const [posts, setPosts] = useState<CommunityPost[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [limit] = useState(10);
	const [offset, setOffset] = useState(0);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [listError, setListError] = useState<string | null>(null);

	const [searchInput, setSearchInput] = useState('');
	const [activeSearch, setActiveSearch] = useState('');
	const isSearchActive = Boolean(activeSearch);

	const [expandedId, setExpandedId] = useState<number | null>(null);
	const [threadByPost, setThreadByPost] = useState<Record<number, PostThreadState>>({});

	const commentTotalOnPage = useMemo(
		() => posts.reduce((sum, p) => sum + (p.comment_count ?? 0), 0),
		[posts],
	);

	const fetchPosts = useCallback(async () => {
		if (!canView) {
			setLoading(false);
			return;
		}
		try {
			setListError(null);
			const params = new URLSearchParams({
				offset: String(offset),
				limit: String(limit),
			});
			if (activeSearch) params.set('search', activeSearch);
			const response = await fetch(`/api/routes/community-posts?${params.toString()}`);
			const text = await response.text();
			const apidata = text ? JSON.parse(text) : { data: [], total: 0 };
			if (!response.ok) {
				setPosts([]);
				setTotal(0);
				setListError(apidata.message || 'Failed to load posts');
				return;
			}
			setPosts(apidata.data || []);
			setTotal(apidata.total ?? 0);
		} catch {
			setPosts([]);
			setTotal(0);
			setListError('Failed to load posts');
		} finally {
			setLoading(false);
		}
	}, [activeSearch, canView, limit, offset]);

	useEffect(() => {
		setLoading(true);
		fetchPosts();
	}, [fetchPosts]);

	const loadRootComments = async (postId: number, append: boolean) => {
		let offsetToUse = 0;
		setThreadByPost(prev => {
			const current = prev[postId] ?? emptyPostThreadState();
			offsetToUse = append ? current.roots.length : 0;
			return {
				...prev,
				[postId]: {
					...current,
					rootsLoading: !append,
					rootsLoadingMore: append,
				},
			};
		});

		try {
			const payload = await fetchCommentsPage(postId, {
				offset: offsetToUse,
				limit: ROOT_COMMENTS_PAGE_SIZE,
			});
			if (!payload) return;

			const mapped = payload.data.map(mapApiComment);
			setThreadByPost(prev => {
				const slice = prev[postId] ?? emptyPostThreadState();
				const roots = append ? [...slice.roots, ...mapped] : mapped;
				return {
					...prev,
					[postId]: {
						...slice,
						roots,
						rootsTotal: payload.total,
						hasMoreRoots: payload.hasMore,
						rootsLoading: false,
						rootsLoadingMore: false,
					},
				};
			});
		} catch (error) {
			console.error(error);
			setThreadByPost(prev => {
				const slice = prev[postId] ?? emptyPostThreadState();
				return {
					...prev,
					[postId]: { ...slice, rootsLoading: false, rootsLoadingMore: false },
				};
			});
		}
	};

	const loadReplies = async (postId: number, parentId: number, append: boolean) => {
		let offsetToUse = 0;
		setThreadByPost(prev => {
			const slice = prev[postId] ?? emptyPostThreadState();
			const existing = slice.repliesByParentId[parentId] ?? {
				items: [],
				total: 0,
				offset: 0,
				loading: false,
				loadingMore: false,
				loaded: false,
				hasMore: false,
			};
			offsetToUse = append ? existing.items.length : 0;
			return {
				...prev,
				[postId]: {
					...slice,
					repliesByParentId: {
						...slice.repliesByParentId,
						[parentId]: {
							...existing,
							loading: !append,
							loadingMore: append,
						},
					},
				},
			};
		});

		try {
			const payload = await fetchCommentsPage(postId, {
				offset: offsetToUse,
				limit: REPLIES_PAGE_SIZE,
				parentId,
			});
			if (!payload) return;

			const mapped = payload.data.map(mapApiComment);
			setThreadByPost(prev => {
				const nextSlice = prev[postId] ?? emptyPostThreadState();
				const prevReply = nextSlice.repliesByParentId[parentId];
				const items = append ? [...(prevReply?.items ?? []), ...mapped] : mapped;
				const roots = attachRepliesToTree(nextSlice.roots, parentId, items, false);

				return {
					...prev,
					[postId]: {
						...nextSlice,
						roots,
						repliesByParentId: {
							...nextSlice.repliesByParentId,
							[parentId]: {
								items,
								total: payload.total,
								offset: offsetToUse + mapped.length,
								loading: false,
								loadingMore: false,
								loaded: true,
								hasMore: payload.hasMore,
							},
						},
					},
				};
			});
		} catch (error) {
			console.error(error);
			setThreadByPost(prev => {
				const nextSlice = prev[postId] ?? emptyPostThreadState();
				const prevReply = nextSlice.repliesByParentId[parentId];
				return {
					...prev,
					[postId]: {
						...nextSlice,
						repliesByParentId: {
							...nextSlice.repliesByParentId,
							[parentId]: {
								...(prevReply ?? {
									items: [],
									total: 0,
									offset: 0,
									loaded: false,
									hasMore: false,
								}),
								loading: false,
								loadingMore: false,
							},
						},
					},
				};
			});
		}
	};

	const handleToggleExpand = (postId: number) => {
		if (expandedId === postId) {
			setExpandedId(null);
			return;
		}
		setExpandedId(postId);
		const existing = threadByPost[postId];
		if (!existing?.roots.length && !existing?.rootsLoading) {
			loadRootComments(postId, false);
		}
	};

	const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
		setCurrentPage(page);
		setOffset((page - 1) * limit);
		setExpandedId(null);
		setLoading(true);
	};

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setActiveSearch(searchInput.trim());
		setCurrentPage(1);
		setOffset(0);
		setExpandedId(null);
		setLoading(true);
	};

	const handleSearchClear = (e: React.FormEvent) => {
		e.preventDefault();
		setSearchInput('');
		setActiveSearch('');
		setCurrentPage(1);
		setOffset(0);
		setExpandedId(null);
		setLoading(true);
	};

	const handleDeletePost = async (id: number) => {
		const confirm = await Swal.fire({
			title: 'Remove this post?',
			text: 'It will be hidden from the app. Comments on this post will be hidden too.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, remove it',
		});
		if (!confirm.isConfirmed) return;

		try {
			const response = await fetch(`/api/routes/community-posts/${id}`, { method: 'DELETE' });
			const result = await response.json();
			createActivityLog({
				name: 'deleteCommunityPost,community-posts/page.tsx',
				action_type: 'delete',
				payload: JSON.stringify({ id }),
				api_end_point: `/api/routes/community-posts/${id}`,
			});
			if (!response.ok || !result.success) {
				Swal.fire({ title: 'Error', text: result.message || 'Failed to remove post', icon: 'error' });
				return;
			}
			Swal.fire({ title: 'Removed', text: result.message || 'Post removed', icon: 'success' });
			setExpandedId(null);
			setThreadByPost(prev => {
				const next = { ...prev };
				delete next[id];
				return next;
			});
			setLoading(true);
			fetchPosts();
		} catch {
			Swal.fire({ title: 'Error', text: 'Failed to remove post', icon: 'error' });
		}
	};

	const handleDeleteComment = async (commentId: number, postId: number) => {
		const confirm = await Swal.fire({
			title: 'Remove this comment?',
			text: 'It will be hidden from the app.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, remove it',
		});
		if (!confirm.isConfirmed) return;

		try {
			const response = await fetch(`/api/routes/community-post-comments/${commentId}`, {
				method: 'DELETE',
			});
			const result = await response.json();
			createActivityLog({
				name: 'deleteCommunityComment,community-posts/page.tsx',
				action_type: 'delete',
				payload: JSON.stringify({ commentId, postId }),
				api_end_point: `/api/routes/community-post-comments/${commentId}`,
			});
			if (!response.ok || !result.success) {
				Swal.fire({ title: 'Error', text: result.message || 'Failed to remove comment', icon: 'error' });
				return;
			}

			setThreadByPost(prev => {
				const slice = prev[postId] ?? emptyPostThreadState();
				const roots = removeCommentFromTree(slice.roots, commentId);
				const repliesByParentId = { ...slice.repliesByParentId };
				for (const key of Object.keys(repliesByParentId)) {
					const pid = Number(key);
					repliesByParentId[pid] = {
						...repliesByParentId[pid],
						items: repliesByParentId[pid].items.filter(c => c.id !== commentId),
						total: Math.max(0, repliesByParentId[pid].total - 1),
					};
				}
				return {
					...prev,
					[postId]: {
						...slice,
						roots,
						rootsTotal: Math.max(0, slice.rootsTotal - 1),
						repliesByParentId,
					},
				};
			});
			fetchPosts();
		} catch {
			Swal.fire({ title: 'Error', text: 'Failed to remove comment', icon: 'error' });
		}
	};

	const expandedPost = expandedId != null ? posts.find(p => p.id === expandedId) : null;
	const emptyThread = emptyPostThreadState();

	const cardThreadProps = (postId: number) => ({
		thread: threadByPost[postId] ?? emptyThread,
		onLoadMoreRoots: () => loadRootComments(postId, true),
		onLoadReplies: (parentId: number) => loadReplies(postId, parentId, false),
		onLoadMoreReplies: (parentId: number) => loadReplies(postId, parentId, true),
	});

	if (!canView) {
		return (
			<PageContainer title="Community Posts" items={[{ label: 'Kabbik Community', href: '/dashboard/community-posts' }]}>
				<Alert severity="warning">You do not have permission to view community posts.</Alert>
			</PageContainer>
		);
	}

	return (
		<>
			{loading && posts.length === 0 ? (
				<Loader variant="page" />
			) : (
				<PageContainer
					title="Community Posts"
					items={[
						{ label: 'Kabbik Community', href: '/dashboard/community-posts' },
						{ label: 'Community Posts', href: '/dashboard/community-posts' },
					]}
					subtitle={
						<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
							{isSearchActive
								? `${total} match${total === 1 ? '' : 'es'} for "${activeSearch}"`
								: `${total} post${total === 1 ? '' : 's'} · moderation`}
						</Typography>
					}
				>
					<Stack spacing={3}>
						<Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
							<form onSubmit={!isSearchActive ? handleSearchSubmit : handleSearchClear}>
								<Stack direction="row" alignItems="center" spacing={1}>
									<TextField
										size="small"
										sx={{ flex: 1 }}
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										placeholder="Search title, content, or author…"
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<IconSearch size={16} stroke={1.5} />
												</InputAdornment>
											),
										}}
									/>
									<Button
										type="submit"
										size="small"
										variant={isSearchActive ? 'outlined' : 'contained'}
										color={isSearchActive ? 'error' : 'primary'}
										startIcon={isSearchActive ? <IconX size={16} /> : <IconSearch size={16} />}
									>
										{isSearchActive ? 'Clear' : 'Search'}
									</Button>
								</Stack>
							</form>
						</Paper>

						<Grid container spacing={2}>
							<Grid item xs={12} sm={6} md={4}>
								<StatCard
									title="Total posts"
									value={total}
									icon={<IconMessages size={22} />}
									color="primary"
								/>
							</Grid>
							<Grid item xs={12} sm={6} md={4}>
								<StatCard
									title="Comments (this page)"
									value={commentTotalOnPage}
									icon={<IconMessage size={22} />}
									color="secondary"
									subtitle={`Showing ${posts.length} post${posts.length === 1 ? '' : 's'}`}
								/>
							</Grid>
						</Grid>

						{listError ? <Alert severity="error">{listError}</Alert> : null}

						{loading && posts.length > 0 ? (
							<Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
								<CircularProgress size={28} />
							</Box>
						) : null}

						{!loading && posts.length === 0 ? (
							<Paper variant="outlined" sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
								<Typography color="text.secondary">
									{isSearchActive ? 'No posts match your search.' : 'No community posts yet.'}
								</Typography>
							</Paper>
						) : (
							<Stack spacing={2}>
								{posts.map((post, index) => (
									<motion.div
										key={post.id}
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ ...transition.normal, delay: index * 0.04 }}
									>
										<CommunityPostCard
											post={post}
											expanded={!isMobileSm && expandedId === post.id}
											onToggleExpand={() => handleToggleExpand(post.id)}
											canDelete={canDelete}
											onDeletePost={handleDeletePost}
											onDeleteComment={id => handleDeleteComment(id, post.id)}
											{...cardThreadProps(post.id)}
										/>
									</motion.div>
								))}
							</Stack>
						)}

						{total > limit ? (
							<Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
								<Pagination
									count={getTotalPageNumber(total)}
									page={currentPage}
									onChange={handlePageChange}
									color="primary"
									shape="rounded"
								/>
							</Box>
						) : null}
					</Stack>
				</PageContainer>
			)}

			{isMobileSm && expandedPost ? (
				<Drawer
					anchor="bottom"
					open={Boolean(expandedPost)}
					onClose={() => setExpandedId(null)}
					PaperProps={{
						sx: {
							borderTopLeftRadius: 16,
							borderTopRightRadius: 16,
							maxHeight: '92vh',
							px: 2,
							pb: 2,
						},
					}}
				>
					<Box sx={{ pt: 2, overflow: 'auto' }}>
						<CommunityPostCard
							post={expandedPost}
							expanded
							onToggleExpand={() => setExpandedId(null)}
							canDelete={canDelete}
							onDeletePost={handleDeletePost}
							onDeleteComment={id => handleDeleteComment(id, expandedPost.id)}
							{...cardThreadProps(expandedPost.id)}
						/>
					</Box>
				</Drawer>
			) : null}
		</>
	);
}
