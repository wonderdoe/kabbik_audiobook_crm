'use client';
import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardMedia,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	InputAdornment,
	Pagination,
	Paper,
	Rating,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import Loader from '@/components/Loader';
import { createActivityLog } from '@/helper/Commonfunction';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useIsMobileSm } from '@/hooks/use-is-mobile-sm';
import { transition } from '@/styles/motion';
import { getTotalPageNumber } from '@/utils/globalHelpers';
import { IconEye, IconSearch, IconTrash, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function BookReview() {
	const isMobileSm = useIsMobileSm();
	const [reviewData, setReviewData] = useState<any[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [limit] = useState(12);
	const [offset, setOffset] = useState(0);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [details, setDetails] = useState<any>(null);
	const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
	const [detailsModalOpened, { open: openDetailsModal, close: closeDetailsModal }] =
		useDisclosure(false);
	const [searchInput, setSearchInput] = useState('');
	const [activeSearch, setActiveSearch] = useState('');

	const isSearchActive = Boolean(activeSearch);

	async function getData() {
		try {
			const params = new URLSearchParams({
				offset: String(offset),
				limit: String(limit),
			});
			if (activeSearch) params.set('search', activeSearch);
			const response = await fetch(`/api/routes/bookreview?${params.toString()}`);
			const text = await response.text();
			const apidata = text ? JSON.parse(text) : { data: [], total: 0 };
			if (!response.ok) {
				setReviewData([]);
				setTotal(0);
				return;
			}
			setReviewData(apidata.data || []);
			setTotal(apidata.total ?? 0);
		} catch (error) {
			console.error(error);
			setReviewData([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}

	const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
		setCurrentPage(page);
		setOffset((page - 1) * limit);
		setLoading(true);
	};

	useEffect(() => {
		getData();
	}, [offset, limit, activeSearch]);

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setActiveSearch(searchInput.trim());
		setCurrentPage(1);
		setOffset(0);
		setLoading(true);
	};

	const handleSearchClear = (e: React.FormEvent) => {
		e.preventDefault();
		setSearchInput('');
		setActiveSearch('');
		setCurrentPage(1);
		setOffset(0);
		setLoading(true);
	};

	const handleDelete = async (id: number) => {
		const confirm = await Swal.fire({
			title: 'Delete this review?',
			text: 'This removes the rating and review permanently.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it',
		});

		if (!confirm.isConfirmed) return;

		try {
			const response = await fetch(`/api/routes/bookreview/${id}`, { method: 'DELETE' });
			const result = await response.json();
			createActivityLog({
				name: 'deleteBookReview,bookreview/page.tsx',
				action_type: 'delete',
				payload: JSON.stringify({ id }),
				api_end_point: `/api/routes/bookreview/${id}`,
			});
			if (!response.ok || !result.success) {
				Swal.fire({ title: 'Error', text: result.message || 'Failed to delete review', icon: 'error' });
				return;
			}
			Swal.fire({ title: 'Deleted', text: result.message || 'Review deleted', icon: 'success' });
			getData();
		} catch {
			Swal.fire({ title: 'Error', text: 'Failed to delete review', icon: 'error' });
		}
	};

	const decodeReview = (raw: string | undefined) => (raw ? decodeURIComponent(raw) : '');

	return (
		<>
			{loading && reviewData.length === 0 ? (
				<Loader />
			) : (
				<PageContainer
					title="Book Reviews"
					items={[{ label: 'Book Review', href: '/dashboard/bookreview' }]}
					subtitle={
						<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
							{isSearchActive ? `${total} match${total === 1 ? '' : 'es'} for "${activeSearch}"` : `${total} review${total === 1 ? '' : 's'}`}
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
										placeholder="Search by reviewer, audiobook, or review text…"
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

						{reviewData.length === 0 ? (
							<Paper
								variant="outlined"
								sx={{ py: 10, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}
							>
								<Typography color="text.secondary">
									{isSearchActive ? 'No reviews match your search.' : 'No reviews found.'}
								</Typography>
								{isSearchActive && (
									<Button variant="outlined" sx={{ mt: 2 }} onClick={() => { setSearchInput(''); setActiveSearch(''); setOffset(0); setCurrentPage(1); }}>
										Clear search
									</Button>
								)}
							</Paper>
						) : (
							<Grid container spacing={2}>
								{reviewData.map((element: any) => {
									const reviewText = decodeReview(element.review) || 'No written review';
									const ratingNum = Number(element.rating) || 0;
									return (
										<Grid item key={element.id} xs={12} sm={6} md={4}>
											<Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
												<Stack direction="row" spacing={2} sx={{ p: 2, pb: 0 }}>
													{element.thumb_path ? (
														<Box
															sx={{
																position: 'relative',
																flexShrink: 0,
																cursor: 'zoom-in',
																borderRadius: 1,
																overflow: 'hidden',
															}}
															onClick={() =>
																setPreviewImage({
																	url: element.thumb_path,
																	title: element.name || 'Audiobook',
																})
															}
														>
															<CardMedia
																component="img"
																image={element.thumb_path}
																alt={element.name}
																sx={{ width: 72, height: 96, objectFit: 'cover' }}
															/>
														</Box>
													) : (
														<Box
															sx={{
																width: 72,
																height: 96,
																bgcolor: 'grey.100',
																borderRadius: 1,
																flexShrink: 0,
															}}
														/>
													)}
													<Box sx={{ minWidth: 0, flex: 1 }}>
														<Typography variant="caption" color="text.disabled" fontFamily="monospace">
															#{element.id}
														</Typography>
														<Typography variant="subtitle2" fontWeight={600} noWrap title={element.name}>
															{element.name || 'N/A'}
														</Typography>
														<Typography variant="caption" color="text.secondary" noWrap display="block">
															{element.full_name || 'Anonymous'}
														</Typography>
														<Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
															<Rating value={ratingNum} readOnly size="small" max={5} />
															<Chip label={element.rating ?? '—'} size="small" variant="outlined" sx={{ height: 20 }} />
														</Stack>
													</Box>
												</Stack>
												<CardContent sx={{ pt: 1.5, flex: 1 }}>
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{
															display: '-webkit-box',
															WebkitLineClamp: 4,
															WebkitBoxOrient: 'vertical',
															overflow: 'hidden',
														}}
													>
														{reviewText}
													</Typography>
													<Typography variant="caption" color="text.disabled" display="block" mt={1}>
														{element.created_at
															? moment(element.created_at).format('D MMM YYYY · h:mm a')
															: '—'}
													</Typography>
												</CardContent>
												<CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'flex-end', gap: 0.5 }}>
													<Button
														size="small"
														variant="outlined"
														startIcon={<IconEye size={14} />}
														onClick={() => {
															setDetails(element);
															openDetailsModal();
														}}
													>
														Details
													</Button>
													<Button
														size="small"
														variant="outlined"
														color="error"
														startIcon={<IconTrash size={14} />}
														onClick={() => handleDelete(element.id)}
													>
														Delete
													</Button>
												</CardActions>
											</Card>
										</Grid>
									);
								})}
							</Grid>
						)}

						{total > limit && (
							<Stack direction="row" justifyContent="space-between" alignItems="center">
								<Typography variant="body2" color="text.secondary">
									Page {currentPage} of {getTotalPageNumber(total)}
								</Typography>
								<Pagination
									page={currentPage}
									onChange={handlePageChange}
									count={getTotalPageNumber(total)}
									color="primary"
									shape="rounded"
								/>
							</Stack>
						)}
					</Stack>

					<Dialog open={detailsModalOpened} onClose={closeDetailsModal} maxWidth="sm" fullWidth fullScreen={isMobileSm}>
						<DialogTitle sx={{ fontWeight: 600 }}>Review details</DialogTitle>
						<DialogContent dividers>
							<Stack spacing={2} sx={{ pt: 0.5 }}>
								<Box>
									<Typography variant="overline" color="text.secondary">Reviewer</Typography>
									<Typography variant="body2">{details?.full_name || 'N/A'}</Typography>
								</Box>
								<Box>
									<Typography variant="overline" color="text.secondary">Audiobook</Typography>
									<Typography variant="body2">{details?.name || 'N/A'}</Typography>
								</Box>
								<Box>
									<Typography variant="overline" color="text.secondary">Rating</Typography>
									<Rating value={Number(details?.rating) || 0} readOnly size="small" />
								</Box>
								<Box>
									<Typography variant="overline" color="text.secondary">Review</Typography>
									<Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
										{decodeReview(details?.review) || 'N/A'}
									</Typography>
								</Box>
								<Box>
									<Typography variant="overline" color="text.secondary">Created</Typography>
									<Typography variant="body2">
										{details?.created_at
											? moment(details.created_at).format('Do MMM YYYY h:mm a')
											: 'N/A'}
									</Typography>
								</Box>
							</Stack>
						</DialogContent>
						<DialogActions sx={{ px: 3, py: 2 }}>
							<Button variant="outlined" color="inherit" onClick={closeDetailsModal}>Close</Button>
						</DialogActions>
					</Dialog>

					<Dialog open={Boolean(previewImage)} onClose={() => setPreviewImage(null)} maxWidth="md" fullWidth fullScreen={isMobileSm}>
						<DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
							<Typography variant="subtitle1" fontWeight={600}>{previewImage?.title}</Typography>
							<IconButton aria-label="Close preview" size="small" onClick={() => setPreviewImage(null)}>
								<IconX size={18} />
							</IconButton>
						</DialogTitle>
						<DialogContent dividers sx={{ display: 'flex', justifyContent: 'center', bgcolor: 'grey.50', py: 3 }}>
							{previewImage?.url ? (
								<Box
									component={motion.img}
									src={previewImage.url}
									alt={previewImage.title}
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={transition.normal}
									sx={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 1, boxShadow: 4 }}
								/>
							) : null}
						</DialogContent>
					</Dialog>
				</PageContainer>
			)}
		</>
	);
}
