'use client';

import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Pagination,
	Paper,
	Stack,
	Switch,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tabs,
	TextField,
	Typography,
} from '@mui/material';
import { useDisclosure } from '@/hooks/use-disclosure';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { getBlogs, postBlog, togglePublishBlog, updateBlog, uploadFile } from '@/services/services';
import { Blog } from '@/types/global';
import { createToast, createToast2 } from 'helpers/SweetAlert';
import { CustomTextEditor } from '../Editor/CustomTextEditor';

type BlogOperation = 'create' | 'update';

export default function BlogList({ categories }: { categories: any }) {
	const [blogList, setBlogList] = useState<Blog[]>([]);
	const [opened, { open, close }] = useDisclosure();
	const [blog, setBlog] = useState<Blog | null>(null);
	const [activeTab, setActiveTab] = useState<string | null>('all');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [previewImageUrl, setPreviewImageUrl] = useState<File | null>(null);
	const [blogOperation, setBlogOperation] = useState<BlogOperation>('create');

	const [offset, setOffset] = useState(0);
	const limit = 10;

	const getData = useCallback(async () => {
		const updatedBlogs: { list: Blog[]; count: number } = await getBlogs(activeTab!, offset, limit);
		setBlogList(
			updatedBlogs.list.map((b: any) => ({ ...b, content_body: JSON.parse(b.content_body) })),
		);
		setTotalCount(updatedBlogs.count);
	}, [activeTab, offset, limit]);

	const totalPage = Math.ceil(totalCount / limit);

	useEffect(() => {
		getData();
	}, [getData]);

	const submitEditHandler = async (e: React.FormEvent<HTMLFormElement>) => {
		try {
			e.preventDefault();
			let payload = {
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
				const uploadedImageUrl = await uploadFile(previewImageUrl);
				payload.featuredImageUrl = uploadedImageUrl;
			}
			const result = await updateBlog(payload);
			if (result.success) {
				close();
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
		try {
			e.preventDefault();
			const isValid =
				blog?.title !== '' &&
				blog?.content_body.blocks.reduce((acc: number, b: any) => b.text.length + acc, 0) > 0;
			if (!isValid) return createToast('At least title and content must be filled');
			let refinedFormData = {
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
				close();
				createToast2(result.message);
				await getData();
			} else {
				createToast(result.message);
			}
		} catch (err) {
			console.error(err);
		}
	};

	const togglePublish = (e: any, blogId: number) => {
		e.stopPropagation();
		const currentBlog = blogList.find((b: Blog) => b.id === blogId);
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: `Yes, ${currentBlog?.approved ? 'unpublish' : 'publish'} it!`,
		}).then(async (result: any) => {
			if (result.isConfirmed) {
				const result = await togglePublishBlog(blogId);
				if (result.success) {
					createToast2(result.message);
					getData();
				} else {
					createToast(result.message);
				}
			}
		});
	};

	const handlePageChange = (e: number) => {
		const offsetCount = (e - 1) * limit;
		setCurrentPage(e);
		setOffset(offsetCount);
	};

	const setupNewBlog = async () => {
		setBlog({
			title: '',
			excerpt: '',
			categories: '',
			content_body: {
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
			},
			featured_image: '',
			alter_text_for_featured_image: '',
			author: '',
			meta_title: '',
			meta_description: '',
			meta_keywords: '',
			meta_author: '',
		});
	};

	return (
		<>
			<Stack direction="row" flexWrap="wrap" justifyContent="space-between">
				<Typography variant="h4" component="h1" style={{ marginBottom: 10 }}>
					Blogs
				</Typography>
				<Button
					onClick={() => {
						setBlogOperation('create');
						setupNewBlog();
						open();
					}}
					variant="contained"
				>
					Create New
				</Button>
			</Stack>
			<Tabs value={activeTab} onChange={setActiveTab}>
				<Box>
					<Tab value="all" onClick={async () => setActiveTab('all')}>
						All
					</Tab>
					<Tab value="pending" onClick={async () => setActiveTab('pending')}>
						Pending
					</Tab>
					<Tab value="approved" onClick={async () => setActiveTab('approved')}>
						Approved
					</Tab>
					{/* <Tab value="rejected">Rejected</Tab> */}
				</Box>
			</Tabs>
			<Paper elevation={1} sx={{ p: 2 }} variant="outlined">
				{blogList.length ? (
					<TableContainer sx={{ minWidth: 800 }}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell component="th">Featured</TableCell>
									<TableCell component="th">Title</TableCell>
									<TableCell component="th">Excerpt</TableCell>
									<TableCell component="th">Author</TableCell>
									<TableCell component="th">Uploaded</TableCell>
									<TableCell component="th">Updated</TableCell>
									<TableCell component="th">Published</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{blogList.map(blog => (
									<TableRow
										key={blog.id}
										onClick={() => {
											setBlogOperation('update');
											open();
											setBlog(blog);
										}}
										style={{ cursor: 'pointer' }}
									>
										<TableCell>
											<Box component="img" 
												src={
													blog?.featured_image ||
													'https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/No_Image_Available.jpg'
												}
												alt={blog?.alter_text_for_featured_image ?? 'blank page'}
												width={0}
												height={0}
												radius={7}
												style={{ width: '100px', height: 'auto' }}
											/>
										</TableCell>
										<TableCell>{blog.title}</TableCell>
										<TableCell>{blog.excerpt}</TableCell>
										<TableCell>{blog.author || 'N/A'}</TableCell>
										<TableCell>{moment(blog.created_at).format('Do MMM, YYYY')}</TableCell>
										<TableCell>{moment(blog.updated_at).format('Do MMM, YYYY')}</TableCell>
										<TableCell>
											<div onClick={e => togglePublish(e, blog.id!)}>
												<Switch checked={!!blog.approved} />
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				) : (
					<Typography textAlign="center">No data</Typography>
				)}
				<Pagination page={currentPage}
					onChange={handlePageChange}
					count={totalPage}
				/>
			</Paper>
			<Dialog
				open={opened}
				onClose={close}
				
				maxWidth="xl" sx={{ width: "100%" }}
				sx={{ borderRadius: 2 }}
			>
<DialogTitle>{blogOperation === 'create' ? 'Create Blog' : 'Update Blog'}</DialogTitle>
<DialogContent>
				<form onSubmit={blogOperation === 'create' ? submitCreateHandler : submitEditHandler}>
					<div
						style={{
							width: '80%',
							margin: '0 auto',
							gap: '10px',
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						{!previewImageUrl ? (
							<Box component="img" 
								src={
									blog?.featured_image ||
									'https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/No_Image_Available.jpg'
								}
								alt={blog?.alter_text_for_featured_image ?? 'blank page'}
								width={0}
								height={0}
								style={{ width: '100%', height: 'auto' }}
							/>
						) : (
							<Box component="img" 
								src={previewImageUrl ? URL.createObjectURL(previewImageUrl) : ''}
								alt={blog?.alter_text_for_featured_image}
								width={0}
								height={0}
								style={{ width: '100%', height: 'auto' }}
							/>
						)}
						{blogOperation === 'create' ? null : (
							<span style={{ marginLeft: 'auto', textAlign: 'right' }}>
								Uploaded at
								<Typography variant="body2" color="text.secondary">
									— {moment(blog?.created_at).format('Do MMM, YYYY')}
								</Typography>
							</span>
						)}
						<FileInput
							accept="image/*"
							label="Featured Image"
							placeholder="Browse files"
							onChange={(file: File | null) => {
								if (file) {
									setBlog((prev: Blog | null) => {
										if (prev) {
											return {
												...prev,
												alter_text_for_featured_image: file.name,
											};
										}
										return prev;
									});
									setPreviewImageUrl(file);
								}
							}}
						/>
						<TextField
							label="Title"
							value={blog?.title}
							onChange={e =>
								setBlog((prev: Blog | null) => (prev ? { ...prev, title: e.target.value } : prev))
							}
						/>
						<TextField
							label="Excerpt"
							value={blog?.excerpt}
							onChange={e =>
								setBlog((prev: Blog | null) => (prev ? { ...prev, excerpt: e.target.value } : prev))
							}
						/>
						<MultiSelect
							multiple
							label="Categories"
							data={categories}
							value={blog?.categories.split(',')}
							onChange={value =>
								setBlog((prev: Blog | null) => {
									let categories = value.join(',');
									if (categories[0] === ',') {
										categories = categories.slice(1);
									}
									if (categories[categories.length - 1] === ',') {
										categories = categories.slice(0, categories.length - 1);
									}
									return prev ? { ...prev, categories } : prev;
								})
							}
						/>
						<CustomTextEditor rawBlogContent={blog?.content_body} setBlog={setBlog} />
						<TextField
							label="Author"
							value={blog?.author}
							onChange={e =>
								setBlog((prev: Blog | null) => (prev ? { ...prev, author: e.target.value } : prev))
							}
						/>
						<TextField
							label="Meta Title"
							value={blog?.meta_title}
							onChange={e =>
								setBlog((prev: Blog | null) =>
									prev ? { ...prev, meta_title: e.target.value } : prev,
								)
							}
						/>
						<TextField
							label="Meta Description"
							value={blog?.meta_description}
							onChange={e =>
								setBlog((prev: Blog | null) =>
									prev ? { ...prev, meta_description: e.target.value } : prev,
								)
							}
						/>
						<TextField
							label="Meta Keywords"
							value={blog?.meta_keywords}
							onChange={e =>
								setBlog((prev: Blog | null) =>
									prev ? { ...prev, meta_keywords: e.target.value } : prev,
								)
							}
						/>
						<TextField
							label="Meta Author"
							value={blog?.meta_author}
							onChange={e =>
								setBlog((prev: Blog | null) =>
									prev ? { ...prev, meta_author: e.target.value } : prev,
								)
							}
						/>
						<Button type="submit">{blogOperation === 'create' ? 'Create' : 'Update'}</Button>
					</div>
				</form>
			</DialogContent>
</Dialog>
		</>
	);
}
