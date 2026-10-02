'use client';

import {
	Autocomplete,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	IconButton,
	Stack,
	Switch,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Tabs,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import {
	DirectoryListCard,
	directoryTableSx,
} from '@/components/directory/directoryListUi';
import { MainCard } from '@/components/mantis/MainCard';
import { TableThumbnail } from '@/components/mantis/TableThumbnail';
import { StatCard } from '@/components/ui/StatCard';
import Loader from '@/components/Loader';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useIsMobileMd, useIsMobileSm } from '@/hooks/use-is-mobile-sm';
import {
	IconArticle,
	IconCheck,
	IconClock,
	IconPencil,
	IconPlus,
	IconX,
} from '@tabler/icons-react';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { getBlogs, postBlog, togglePublishBlog, updateBlog, uploadFile } from '@/services/services';
import { Blog } from '@/types/global';
import { createToast, createToast2 } from 'helpers/SweetAlert';
import { CustomTextEditor } from '../Editor/CustomTextEditor';

const DEFAULT_FEATURED_IMAGE =
	'https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/No_Image_Available.jpg';

type BlogOperation = 'create' | 'update';
type BlogTab = 'all' | 'pending' | 'approved';

const emptyContentBody = () => ({
	entityMap: {},
	blocks: [
		{
			text: '',
			key: 'foo',
			type: 'unstyled',
			entityRanges: [],
			depth: 0,
			inlineStyleRanges: [],
		},
	],
});

function BlogPostMobileCard({
	row,
	onEdit,
	onTogglePublish,
}: {
	row: Blog;
	onEdit: () => void;
	onTogglePublish: (e: React.MouseEvent) => void;
}) {
	return (
		<Card variant="outlined" sx={{ borderRadius: 2 }}>
			<CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
				<Stack direction="row" spacing={1.5} alignItems="flex-start">
					<TableThumbnail
						src={row.featured_image || DEFAULT_FEATURED_IMAGE}
						alt={row.alter_text_for_featured_image ?? row.title ?? 'Blog'}
						displaySize="sm"
					/>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
							<Typography variant="subtitle2" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
								{row.title || '—'}
							</Typography>
							<Chip
								size="small"
								variant="outlined"
								color={row.approved ? 'success' : 'warning'}
								label={row.approved ? 'Live' : 'Draft'}
								sx={{ flexShrink: 0 }}
							/>
						</Stack>
						{row.excerpt ? (
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ mt: 0.75, wordBreak: 'break-word' }}
							>
								{row.excerpt}
							</Typography>
						) : null}
						<Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
							{row.author || 'Unknown author'} ·{' '}
							{row.updated_at ? moment(row.updated_at).format('D MMM YYYY') : '—'}
						</Typography>
					</Box>
				</Stack>
				<Stack
					direction="row"
					alignItems="center"
					justifyContent="space-between"
					sx={{ mt: 2, pt: 1.5, borderTop: 1, borderColor: 'divider' }}
				>
					<Stack direction="row" alignItems="center" spacing={0.5}>
						<Typography variant="caption" color="text.secondary">Publish</Typography>
						<Switch size="small" checked={!!row.approved} onClick={onTogglePublish} />
					</Stack>
					<Button size="small" variant="outlined" startIcon={<IconPencil size={16} />} onClick={onEdit}>
						Edit
					</Button>
				</Stack>
			</CardContent>
		</Card>
	);
}

export default function BlogList({ categories }: { categories: string[] }) {
	const isMobileSm = useIsMobileSm();
	const isMobileMd = useIsMobileMd();
	const [blogList, setBlogList] = useState<Blog[]>([]);
	const [opened, { open, close }] = useDisclosure();
	const [blog, setBlog] = useState<Blog | null>(null);
	const [activeTab, setActiveTab] = useState<BlogTab>('all');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [previewImageUrl, setPreviewImageUrl] = useState<File | null>(null);
	const [blogOperation, setBlogOperation] = useState<BlogOperation>('create');
	const [offset, setOffset] = useState(0);
	const limit = 10;

	const previewObjectUrl = useMemo(
		() => (previewImageUrl ? URL.createObjectURL(previewImageUrl) : null),
		[previewImageUrl],
	);

	useEffect(() => {
		return () => {
			if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
		};
	}, [previewObjectUrl]);

	const getData = useCallback(async () => {
		setLoading(true);
		try {
			const updatedBlogs: { list: Blog[]; count: number } = await getBlogs(activeTab, offset, limit);
			setBlogList(
				updatedBlogs.list.map((b: Blog & { content_body: string }) => ({
					...b,
					content_body: JSON.parse(b.content_body as unknown as string),
				})),
			);
			setTotalCount(updatedBlogs.count);
		} catch (err) {
			console.error(err);
			setBlogList([]);
			setTotalCount(0);
		} finally {
			setLoading(false);
		}
	}, [activeTab, offset, limit]);

	const totalPages = Math.max(1, Math.ceil(totalCount / limit));
	const publishedOnPage = blogList.filter(b => b.approved).length;
	const pendingOnPage = blogList.length - publishedOnPage;

	useEffect(() => {
		void getData();
	}, [getData]);

	const handleTabChange = (_: React.SyntheticEvent, value: BlogTab) => {
		setActiveTab(value);
		setCurrentPage(1);
		setOffset(0);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		setOffset((page - 1) * limit);
	};

	const resetModal = () => {
		setPreviewImageUrl(null);
	};

	const openCreate = () => {
		setBlogOperation('create');
		setBlog({
			title: '',
			excerpt: '',
			categories: '',
			content_body: emptyContentBody(),
			featured_image: '',
			alter_text_for_featured_image: '',
			author: '',
			meta_title: '',
			meta_description: '',
			meta_keywords: '',
			meta_author: '',
		});
		resetModal();
		open();
	};

	const openEdit = (row: Blog) => {
		setBlogOperation('update');
		setBlog(row);
		resetModal();
		open();
	};

	const handleCloseModal = () => {
		close();
		resetModal();
	};

	const submitEditHandler = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const payload = {
				id: blog?.id,
				title: blog?.title,
				excerpt: blog?.excerpt,
				categories: blog?.categories,
				contentBody: JSON.stringify(blog?.content_body),
				featuredImageUrl: blog?.featured_image,
				alterTextForFeaturedImage: blog?.alter_text_for_featured_image,
				author: blog?.author,
				metaTitle: blog?.meta_title,
				metaDescription: blog?.meta_description,
				metaKeywords: blog?.meta_keywords,
				metaAuthor: blog?.meta_author,
			};
			if (previewImageUrl) {
				payload.featuredImageUrl = await uploadFile(previewImageUrl);
			}
			const result = await updateBlog(payload);
			if (result.success) {
				handleCloseModal();
				createToast2(result.message);
				await getData();
			} else {
				createToast(result.message);
			}
		} catch (err) {
			console.error(err);
		}
	};

	const submitCreateHandler = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const isValid =
				blog?.title !== '' &&
				blog?.content_body.blocks.reduce((acc: number, b: { text: string }) => b.text.length + acc, 0) >
					0;
			if (!isValid) return createToast('At least title and content must be filled');
			const refinedFormData = {
				title: blog?.title,
				excerpt: blog?.excerpt,
				categories: blog?.categories,
				contentBody: JSON.stringify(blog?.content_body),
				featuredImageUrl: '',
				alterTextForFeaturedImage: '',
				author: blog?.author,
			};
			if (previewImageUrl) {
				const uploadedImageUrl = await uploadFile(previewImageUrl);
				refinedFormData.featuredImageUrl = uploadedImageUrl;
				refinedFormData.alterTextForFeaturedImage = previewImageUrl.name;
			}
			const result = await postBlog(refinedFormData);
			if (result.success) {
				handleCloseModal();
				createToast2(result.message);
				await getData();
			} else {
				createToast(result.message);
			}
		} catch (err) {
			console.error(err);
		}
	};

	const togglePublish = (e: React.MouseEvent, blogId: number) => {
		e.stopPropagation();
		const currentBlog = blogList.find((b: Blog) => b.id === blogId);
		Swal.fire({
			title: 'Change publish status?',
			text: currentBlog?.approved
				? 'This post will be hidden from the public blog.'
				: 'This post will be visible on the public blog.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: `Yes, ${currentBlog?.approved ? 'unpublish' : 'publish'}`,
		}).then(async result => {
			if (result.isConfirmed) {
				const res = await togglePublishBlog(blogId);
				if (res.success) {
					createToast2(res.message);
					void getData();
				} else {
					createToast(res.message);
				}
			}
		});
	};

	const featuredPreviewSrc =
		previewObjectUrl || blog?.featured_image || DEFAULT_FEATURED_IMAGE;

	const tabLabel =
		activeTab === 'all' ? 'All posts' : activeTab === 'pending' ? 'Pending review' : 'Published';

	return (
		<Stack spacing={2} sx={{ minWidth: 0, width: '100%' }}>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
					<StatCard
						title="Total"
						value={totalCount.toLocaleString()}
						subtitle={tabLabel}
						color="primary"
						icon={<IconArticle size={22} />}
						loading={loading}
					/>
				</Grid>
				<Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
					<StatCard
						title="Published (page)"
						value={publishedOnPage.toLocaleString()}
						color="success"
						icon={<IconCheck size={22} />}
						loading={loading}
					/>
				</Grid>
				<Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
					<StatCard
						title="Pending (page)"
						value={pendingOnPage.toLocaleString()}
						color="warning"
						icon={<IconClock size={22} />}
						loading={loading}
					/>
				</Grid>
			</Grid>

			<MainCard contentSX={{ py: 1.5, px: 2 }}>
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					spacing={1.5}
					alignItems={{ xs: 'stretch', sm: 'center' }}
					justifyContent="space-between"
				>
					<Tabs
						value={activeTab}
						onChange={handleTabChange}
						variant="scrollable"
						scrollButtons="auto"
						allowScrollButtonsMobile
						sx={{ minHeight: 40, width: { xs: '100%', sm: 'auto' }, maxWidth: '100%' }}
					>
						<Tab label="All" value="all" sx={{ minHeight: 40, py: 0, minWidth: 'auto', px: { xs: 1.5, sm: 2 } }} />
						<Tab label="Pending" value="pending" sx={{ minHeight: 40, py: 0, minWidth: 'auto', px: { xs: 1.5, sm: 2 } }} />
						<Tab label="Approved" value="approved" sx={{ minHeight: 40, py: 0, minWidth: 'auto', px: { xs: 1.5, sm: 2 } }} />
					</Tabs>
					<Button
						variant="contained"
						size="small"
						startIcon={<IconPlus size={18} />}
						onClick={openCreate}
						sx={{ whiteSpace: 'nowrap', alignSelf: { xs: 'stretch', sm: 'auto' } }}
					>
						Create blog
					</Button>
				</Stack>
			</MainCard>

			{loading ? (
				<Loader />
			) : (
				<DirectoryListCard
					title="Posts"
					subtitle={`${totalCount.toLocaleString()} in ${tabLabel.toLowerCase()}`}
					totalCount={totalCount}
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={handlePageChange}
					isEmpty={blogList.length === 0}
					emptyMessage={
						activeTab === 'pending'
							? 'No pending posts.'
							: activeTab === 'approved'
								? 'No published posts yet.'
								: 'No blog posts yet. Create your first article.'
					}
				>
					{isMobileMd ? (
						<Stack spacing={1.5} sx={{ px: 2, py: 1.5 }}>
							{blogList.map(row => (
								<BlogPostMobileCard
									key={row.id}
									row={row}
									onEdit={() => openEdit(row)}
									onTogglePublish={e => togglePublish(e, row.id!)}
								/>
							))}
						</Stack>
					) : (
						<Table size="small" sx={directoryTableSx}>
							<TableHead>
								<TableRow>
									<TableCell width={88}>Cover</TableCell>
									<TableCell>Title</TableCell>
									<TableCell sx={{ maxWidth: 280 }}>Excerpt</TableCell>
									<TableCell width={120}>Author</TableCell>
									<TableCell width={120}>Updated</TableCell>
									<TableCell width={110}>Status</TableCell>
									<TableCell align="right" sx={{ width: 140, minWidth: 140 }}>
										Actions
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{blogList.map(row => (
									<TableRow key={row.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
										<TableCell>
											<TableThumbnail
												src={row.featured_image || DEFAULT_FEATURED_IMAGE}
												alt={row.alter_text_for_featured_image ?? row.title ?? 'Blog'}
												displaySize="sm"
											/>
										</TableCell>
										<TableCell>
											<Typography variant="body2" fontWeight={600}>
												{row.title || '—'}
											</Typography>
											<Typography variant="caption" color="text.secondary" display="block">
												{moment(row.created_at).format('D MMM YYYY')}
											</Typography>
										</TableCell>
										<TableCell sx={{ maxWidth: 280 }}>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													display: '-webkit-box',
													WebkitLineClamp: 2,
													WebkitBoxOrient: 'vertical',
												}}
											>
												{row.excerpt || '—'}
											</Typography>
										</TableCell>
										<TableCell>
											<Typography variant="body2">{row.author || '—'}</Typography>
										</TableCell>
										<TableCell>
											<Typography variant="body2">
												{row.updated_at ? moment(row.updated_at).format('D MMM YY') : '—'}
											</Typography>
										</TableCell>
										<TableCell>
											<Chip
												size="small"
												variant="outlined"
												color={row.approved ? 'success' : 'warning'}
												label={row.approved ? 'Published' : 'Draft'}
											/>
										</TableCell>
										<TableCell align="right">
											<Stack
												direction="row"
												spacing={0.5}
												alignItems="center"
												justifyContent="flex-end"
											>
												<Tooltip title={row.approved ? 'Unpublish' : 'Publish'}>
													<Switch
														size="small"
														checked={!!row.approved}
														onClick={e => togglePublish(e, row.id!)}
													/>
												</Tooltip>
												<Button
													size="small"
													variant="text"
													startIcon={<IconPencil size={16} />}
													onClick={() => openEdit(row)}
												>
													Edit
												</Button>
											</Stack>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</DirectoryListCard>
			)}

			<Dialog
				open={opened}
				onClose={handleCloseModal}
				maxWidth="lg"
				fullWidth
				fullScreen={isMobileSm}
				scroll="paper"
			>
				<DialogTitle sx={{ pr: 6, px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 } }}>
					{blogOperation === 'create' ? 'Create blog post' : 'Edit blog post'}
					<Typography variant="body2" color="text.secondary" fontWeight={400}>
						{blogOperation === 'create'
							? 'Add content, categories, and SEO metadata'
							: `${blog?.title ?? 'Post'} · last updated ${blog?.updated_at ? moment(blog.updated_at).format('D MMM YYYY') : '—'}`}
					</Typography>
				</DialogTitle>
				<IconButton
					onClick={handleCloseModal}
					sx={{ position: 'absolute', right: 12, top: 12 }}
					aria-label="Close"
				>
					<IconX size={20} />
				</IconButton>
				<DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
					{blog ? (
					<Box
						component="form"
						id="blog-form"
						onSubmit={blogOperation === 'create' ? submitCreateHandler : submitEditHandler}
					>
						<Grid container spacing={{ xs: 2, sm: 3 }}>
							<Grid item xs={12} md={4}>
								<Stack spacing={2}>
									<Typography variant="subtitle2" fontWeight={700}>
										Featured image
									</Typography>
									<Box
										sx={{
											borderRadius: 2,
											overflow: 'hidden',
											border: 1,
											borderColor: 'divider',
											bgcolor: 'grey.50',
										}}
									>
										<Box
											component="img"
											src={featuredPreviewSrc}
											alt={blog?.alter_text_for_featured_image ?? 'Featured'}
											sx={{
												width: '100%',
												maxHeight: 240,
												objectFit: 'cover',
												display: 'block',
											}}
										/>
									</Box>
									{blogOperation === 'update' && blog?.created_at ? (
										<Typography variant="caption" color="text.secondary">
											First published {moment(blog.created_at).format('D MMM YYYY')}
										</Typography>
									) : null}
									<Stack spacing={1}>
										<Typography variant="caption" color="text.secondary" fontWeight={600}>
											Image file
										</Typography>
										<Button
											component="label"
											variant="outlined"
											size="small"
											fullWidth
											sx={{ justifyContent: 'center', textTransform: 'none' }}
										>
											{previewImageUrl?.name ||
												blog.alter_text_for_featured_image ||
												'Choose image'}
											<input
												id="blog-featured-image-input"
												type="file"
												hidden
												accept="image/*"
												onChange={e => {
													const file = e.target.files?.[0] ?? null;
													if (!file) return;
													setBlog(prev =>
														prev
															? { ...prev, alter_text_for_featured_image: file.name }
															: prev,
													);
													setPreviewImageUrl(file);
												}}
											/>
										</Button>
									</Stack>
								</Stack>
							</Grid>
							<Grid item xs={12} md={8}>
								<Stack spacing={2}>
									<TextField
										size="small"
										label="Title"
										required
										fullWidth
										value={blog?.title ?? ''}
										onChange={e =>
											setBlog(prev => (prev ? { ...prev, title: e.target.value } : prev))
										}
									/>
									<TextField
										size="small"
										label="Excerpt"
										fullWidth
										multiline
										minRows={2}
										value={blog?.excerpt ?? ''}
										onChange={e =>
											setBlog(prev => (prev ? { ...prev, excerpt: e.target.value } : prev))
										}
									/>
									<Autocomplete
										multiple
										size="small"
										options={categories}
										value={
											blog?.categories
												? blog.categories.split(',').map(s => s.trim()).filter(Boolean)
												: []
										}
										onChange={(_, newValue) =>
											setBlog(prev =>
												prev ? { ...prev, categories: newValue.join(',') } : prev,
											)
										}
										renderInput={params => (
											<TextField
												{...params}
												label="Categories"
												placeholder="Select categories"
											/>
										)}
									/>
									<TextField
										size="small"
										label="Author"
										fullWidth
										value={blog?.author ?? ''}
										onChange={e =>
											setBlog(prev => (prev ? { ...prev, author: e.target.value } : prev))
										}
									/>
								</Stack>
							</Grid>
							<Grid item xs={12}>
								<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
									Content
								</Typography>
								<Box
									sx={{
										border: 1,
										borderColor: 'divider',
										borderRadius: 2,
										overflow: 'hidden',
										bgcolor: 'background.paper',
										maxWidth: '100%',
									}}
								>
									<CustomTextEditor
										rawBlogContent={blog.content_body}
										setBlog={setBlog}
									/>
								</Box>
							</Grid>
							<Grid item xs={12}>
								<Divider sx={{ mb: 2 }} />
								<Typography
									variant="subtitle2"
									fontWeight={700}
									color="text.secondary"
									textTransform="uppercase"
									letterSpacing={0.5}
									gutterBottom
								>
									SEO
								</Typography>
								<Grid container spacing={2}>
									<Grid item xs={12} sm={6}>
										<TextField
											size="small"
											fullWidth
											label="Meta title"
											value={blog?.meta_title ?? ''}
											onChange={e =>
												setBlog(prev =>
													prev ? { ...prev, meta_title: e.target.value } : prev,
												)
											}
										/>
									</Grid>
									<Grid item xs={12} sm={6}>
										<TextField
											size="small"
											fullWidth
											label="Meta author"
											value={blog?.meta_author ?? ''}
											onChange={e =>
												setBlog(prev =>
													prev ? { ...prev, meta_author: e.target.value } : prev,
												)
											}
										/>
									</Grid>
									<Grid item xs={12}>
										<TextField
											size="small"
											fullWidth
											label="Meta description"
											multiline
											minRows={2}
											value={blog?.meta_description ?? ''}
											onChange={e =>
												setBlog(prev =>
													prev ? { ...prev, meta_description: e.target.value } : prev,
												)
											}
										/>
									</Grid>
									<Grid item xs={12}>
										<TextField
											size="small"
											fullWidth
											label="Meta keywords"
											value={blog?.meta_keywords ?? ''}
											onChange={e =>
												setBlog(prev =>
													prev ? { ...prev, meta_keywords: e.target.value } : prev,
												)
											}
										/>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
					</Box>
					) : null}
				</DialogContent>
				<DialogActions
					sx={{
						px: { xs: 2, sm: 3 },
						py: 2,
						gap: 1,
						flexDirection: { xs: 'column-reverse', sm: 'row' },
						alignItems: { xs: 'stretch', sm: 'center' },
						'& > button': { width: { xs: '100%', sm: 'auto' }, m: 0 },
					}}
				>
					<Button onClick={handleCloseModal} color="inherit">
						Cancel
					</Button>
					<Button type="submit" form="blog-form" variant="contained">
						{blogOperation === 'create' ? 'Create post' : 'Save changes'}
					</Button>
				</DialogActions>
			</Dialog>
		</Stack>
	);
}
