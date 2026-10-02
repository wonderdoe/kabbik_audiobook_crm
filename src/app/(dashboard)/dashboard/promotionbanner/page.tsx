'use client';
import {
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	Grid,
	IconButton,
	Paper,
	Stack,
	Switch,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
	Typography,
} from '@mui/material';
import { CatalogMediaCard } from '@/components/mantis/CatalogMediaCard';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { DataSelect } from '@/components/Form/DataSelect';
import Loader from '@/components/Loader';
import { createActivityLog } from '@/helper/Commonfunction';
import { useDisclosure } from '@/hooks/use-disclosure';
import { IconEdit, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { transition } from '@/styles/motion';

type TargetAudience = 'all' | 'free' | 'premium';

type PromotionBanner = {
	id: number;
	banner_url: string;
	goto_page: string;
	is_active: number;
	payload: { bookId?: string; categoryName?: string } | null;
	target_audience: TargetAudience;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
};

type Category = {
	id: number;
	name: string;
};

const audienceOptions = [
	{ value: 'all', label: 'All' },
	{ value: 'free', label: 'Free' },
	{ value: 'premium', label: 'Premium' },
];

const filterOptions = [{ value: '', label: 'All audiences' }, ...audienceOptions];

const audienceChipColor: Record<TargetAudience, 'default' | 'info' | 'secondary'> = {
	all: 'default',
	free: 'info',
	premium: 'secondary',
};

const gotoPageOptions = [
	{ value: '/audiobook', label: 'Audiobook' },
	{ value: '/gamezop', label: 'Gamezop' },
	{ value: '/promotion', label: 'Promotion' },
	{ value: '/subscribe', label: 'Subscribe' },
	{ value: '/category', label: 'Category' },
];

const emptyForm = {
	banner_url: '',
	goto_page: '',
	target_audience: 'all' as TargetAudience,
	is_active: true,
	bookId: '',
	categoryName: '',
};

const getGotoPageLabel = (gotoPage: string) =>
	gotoPageOptions.find(option => option.value === gotoPage)?.label || gotoPage;

const formatPayload = (banner: PromotionBanner) => {
	if (!banner.payload) {
		return '-';
	}

	if (banner.goto_page === '/audiobook' && banner.payload.bookId) {
		return `Book ID: ${banner.payload.bookId}`;
	}

	if (banner.goto_page === '/category' && banner.payload.categoryName) {
		return `Category: ${banner.payload.categoryName}`;
	}

	return JSON.stringify(banner.payload);
};

export default function PromotionBannerPage() {
	const [bannerList, setBannerList] = useState<PromotionBanner[]>([]);
	const [categoryList, setCategoryList] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [audienceFilter, setAudienceFilter] = useState('');
	const [form, setForm] = useState(emptyForm);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [originalForm, setOriginalForm] = useState(emptyForm);

	const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
	const [previewBanner, setPreviewBanner] = useState<{ url: string; title: string } | null>(null);

	const filteredBanners = useMemo(() => {
		if (!audienceFilter) {
			return bannerList;
		}
		return bannerList.filter(banner => banner.target_audience === audienceFilter);
	}, [audienceFilter, bannerList]);

	const categoryOptions = useMemo(
		() =>
			(Array.isArray(categoryList) ? categoryList : []).map(category => ({
				value: category.name,
				label: category.name,
			})),
		[categoryList],
	);

	const getBannerList = async () => {
		try {
			const response = await fetch('/api/routes/promotionbanner');
			const result = await response.json();
			setLoading(false);

			if (!response.ok || !result.success) {
				Swal.fire({
					title: 'Error',
					text: result.message || 'Failed to load promotion banners',
					icon: 'error',
				});
				return;
			}

			setBannerList(result.data || []);
		} catch {
			setLoading(false);
			Swal.fire({
				title: 'Error',
				text: 'Failed to load promotion banners',
				icon: 'error',
			});
		}
	};

	const getCategoryList = async () => {
		try {
			const response = await fetch('/api/routes/audio-category', { cache: 'no-store' });
			const result = await response.json();
			setCategoryList(Array.isArray(result) ? result : []);
		} catch {
			setCategoryList([]);
		}
	};

	const uploadImage = async (file: File) => {
		const formData = new FormData();
		formData.append('files', file);
		formData.append('size', String(file.size));

		const response = await fetch('https://api.kabbik.com/v3/audiobooks/upload-image-in-stack', {
			method: 'POST',
			body: formData,
		});

		createActivityLog({
			name: 'uploadPromotionBannerImage,promotionbanner/page.tsx',
			action_type: editingId ? 'update' : 'create',
			payload: JSON.stringify({ fileName: file.name }),
			api_end_point: 'https://api.kabbik.com/v3/audiobooks/upload-image-in-stack',
		});

		const result = await response.json();
		if (!result.image_file_url) {
			throw new Error('Image upload failed');
		}

		return result.image_file_url as string;
	};

	const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}

		try {
			const imageUrl = await uploadImage(file);
			setForm(current => ({ ...current, banner_url: imageUrl }));
		} catch {
			Swal.fire({
				title: 'Error',
				text: 'Failed to upload image',
				icon: 'error',
			});
		}
	};

	const resetForm = () => {
		setForm(emptyForm);
		setOriginalForm(emptyForm);
		setEditingId(null);
	};

	const openCreateModal = () => {
		resetForm();
		openModal();
	};

	const openEditModal = (banner: PromotionBanner) => {
		const nextForm = {
			banner_url: banner.banner_url,
			goto_page: banner.goto_page,
			target_audience: banner.target_audience,
			is_active: banner.is_active === 1,
			bookId: banner.payload?.bookId || '',
			categoryName: banner.payload?.categoryName || '',
		};

		setEditingId(banner.id);
		setForm(nextForm);
		setOriginalForm(nextForm);
		openModal();
	};

	const buildPayload = () => {
		if (form.goto_page === '/audiobook') {
			return { bookId: form.bookId.trim() };
		}

		if (form.goto_page === '/category') {
			return { categoryName: form.categoryName.trim() };
		}

		return null;
	};

	const validateForm = () => {
		if (!form.banner_url || !form.goto_page) {
			return 'Banner image and goto page are required';
		}

		if (form.goto_page === '/audiobook' && !form.bookId.trim()) {
			return 'Book ID is required for Audiobook';
		}

		if (form.goto_page === '/category' && !form.categoryName.trim()) {
			return 'Category name is required for Category';
		}

		return null;
	};

	const buildChangedFields = () => {
		const changes: Record<string, unknown> = {};
		const nextPayload = buildPayload();
		const originalPayload = (() => {
			if (originalForm.goto_page === '/audiobook') {
				return originalForm.bookId ? { bookId: originalForm.bookId } : null;
			}
			if (originalForm.goto_page === '/category') {
				return originalForm.categoryName ? { categoryName: originalForm.categoryName } : null;
			}
			return null;
		})();

		if (form.banner_url !== originalForm.banner_url) {
			changes.banner_url = form.banner_url;
		}
		if (form.goto_page !== originalForm.goto_page) {
			changes.goto_page = form.goto_page;
		}
		if (form.target_audience !== originalForm.target_audience) {
			changes.target_audience = form.target_audience;
		}
		if (form.is_active !== originalForm.is_active) {
			changes.is_active = form.is_active ? 1 : 0;
		}
		if (JSON.stringify(nextPayload) !== JSON.stringify(originalPayload)) {
			changes.payload = nextPayload;
		}

		return changes;
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		const validationError = validateForm();
		if (validationError) {
			Swal.fire({
				title: 'Validation',
				text: validationError,
				icon: 'warning',
			});
			return;
		}

		try {
			let response: Response;
			let body: Record<string, unknown>;

			if (editingId) {
				body = buildChangedFields();

				if (Object.keys(body).length === 0) {
					Swal.fire({
						title: 'No changes',
						text: 'No fields were changed',
						icon: 'info',
					});
					return;
				}

				response = await fetch(`/api/routes/promotionbanner/${editingId}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
				});
			} else {
				body = {
					banner_url: form.banner_url,
					goto_page: form.goto_page,
					target_audience: form.target_audience,
					is_active: form.is_active ? 1 : 0,
					payload: buildPayload(),
				};

				response = await fetch('/api/routes/promotionbanner', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
				});
			}

			const result = await response.json();

			createActivityLog({
				name: editingId ? 'updatePromotionBanner' : 'createPromotionBanner',
				action_type: editingId ? 'update' : 'create',
				payload: JSON.stringify(body),
				api_end_point: editingId
					? `/api/routes/promotionbanner/${editingId}`
					: '/api/routes/promotionbanner',
			});

			if (!response.ok || !result.success) {
				Swal.fire({
					title: 'Error',
					text: result.message || 'Failed to save banner',
					icon: 'error',
				});
				return;
			}

			closeModal();
			resetForm();
			getBannerList();

			Swal.fire({
				title: 'Success',
				text: result.message || 'Banner saved',
				icon: 'success',
			});
		} catch (error: any) {
			Swal.fire({
				title: 'Error',
				text: error.message || 'Failed to save banner',
				icon: 'error',
			});
		}
	};

	const handleToggle = async (banner: PromotionBanner) => {
		try {
			const response = await fetch(`/api/routes/promotionbanner/${banner.id}/toggle`, {
				method: 'PATCH',
			});
			const result = await response.json();

			createActivityLog({
				name: 'togglePromotionBanner,promotionbanner/page.tsx',
				action_type: 'update',
				payload: JSON.stringify({ id: banner.id }),
				api_end_point: `/api/routes/promotionbanner/${banner.id}/toggle`,
			});

			if (!response.ok || !result.success) {
				Swal.fire({
					title: 'Error',
					text: result.message || 'Failed to toggle banner',
					icon: 'error',
				});
				return;
			}

			getBannerList();
		} catch {
			Swal.fire({
				title: 'Error',
				text: 'Failed to toggle banner',
				icon: 'error',
			});
		}
	};

	const handleDelete = async (id: number) => {
		const confirm = await Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!',
		});

		if (!confirm.isConfirmed) {
			return;
		}

		try {
			const response = await fetch(`/api/routes/promotionbanner/${id}`, {
				method: 'DELETE',
			});
			const result = await response.json();

			createActivityLog({
				name: 'deletePromotionBanner,promotionbanner/page.tsx',
				action_type: 'delete',
				payload: JSON.stringify({ id }),
				api_end_point: `/api/routes/promotionbanner/${id}`,
			});

			if (!response.ok || !result.success) {
				Swal.fire({
					title: 'Error',
					text: result.message || 'Failed to delete banner',
					icon: 'error',
				});
				return;
			}

			Swal.fire({
				title: 'Deleted!',
				text: result.message || 'Banner deleted',
				icon: 'success',
			});
			getBannerList();
		} catch {
			Swal.fire({
				title: 'Error',
				text: 'Failed to delete banner',
				icon: 'error',
			});
		}
	};

	useEffect(() => {
		getBannerList();
		getCategoryList();
	}, []);

	// card grid — no rows variable needed

	const closeFormModal = () => {
		closeModal();
		resetForm();
	};

	return (
		<>
			{loading ? (
				<Loader />
			) : (
				<PageContainer
					title="Promotion Banners"
					items={[{ label: 'Promotion Banner', href: '/dashboard/promotionbanner' }]}
					subtitle={
						<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
							{filteredBanners.length} banner{filteredBanners.length === 1 ? '' : 's'}
							{audienceFilter ? ` · audience: ${audienceFilter}` : ''}
						</Typography>
					}
					actions={
						<Button onClick={openCreateModal} variant="contained" startIcon={<IconPlus size={16} />}>
							Add Banner
						</Button>
					}
				>
					{/* Filter bar */}
					<Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
						<Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
							<Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1 }}>
								Audience:
							</Typography>
							<ToggleButtonGroup
								value={audienceFilter}
								exclusive
								size="small"
								onChange={(_, v) => setAudienceFilter(v ?? '')}
							>
								<ToggleButton value="">All</ToggleButton>
								<ToggleButton value="free">Free</ToggleButton>
								<ToggleButton value="premium">Premium</ToggleButton>
							</ToggleButtonGroup>
						</Stack>
					</Paper>

					{/* Card grid */}
					{filteredBanners.length === 0 ? (
						<Paper
							variant="outlined"
							sx={{ py: 10, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}
						>
							<Typography color="text.secondary">No promotion banners found.</Typography>
							<Button onClick={openCreateModal} variant="contained" sx={{ mt: 2 }} startIcon={<IconPlus size={16} />}>
								Add first banner
							</Button>
						</Paper>
					) : (
						<Grid container spacing={3}>
							{filteredBanners.map(banner => (
								<Grid item key={banner.id} xs={12} sm={6} md={4} lg={3}>
									<CatalogMediaCard
										imageSrc={banner.banner_url}
										imageAlt={`Banner #${banner.id}`}
										imageHeight={160}
										imageFit="contain"
										inactive={banner.is_active !== 1}
										onImageClick={() =>
											setPreviewBanner({
												url: banner.banner_url,
												title: getGotoPageLabel(banner.goto_page),
											})
										}
										topBadge={
											<Chip
												label={banner.is_active === 1 ? 'Active' : 'Inactive'}
												size="small"
												color={banner.is_active === 1 ? 'success' : 'default'}
												sx={{ fontWeight: 700, fontSize: '0.65rem' }}
											/>
										}
										actions={
											<>
												<Tooltip title={banner.is_active === 1 ? 'Deactivate' : 'Activate'}>
													<Switch
														size="small"
														checked={banner.is_active === 1}
														onChange={() => handleToggle(banner)}
													/>
												</Tooltip>
												<Stack direction="row" spacing={0.5}>
													<Tooltip title="Edit">
														<IconButton size="small" onClick={() => openEditModal(banner)}>
															<IconEdit size={16} />
														</IconButton>
													</Tooltip>
													<Tooltip title="Delete">
														<IconButton size="small" color="error" onClick={() => handleDelete(banner.id)}>
															<IconTrash size={16} />
														</IconButton>
													</Tooltip>
												</Stack>
											</>
										}
										actionsSx={{ px: 2, justifyContent: 'space-between', width: '100%' }}
									>
										<Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
											<Typography variant="caption" color="text.disabled" fontFamily="monospace">
												#{banner.id}
											</Typography>
											<Typography variant="caption" color="text.disabled">
												{moment(banner.created_at).format('D MMM YYYY')}
											</Typography>
										</Stack>
										<Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ gap: 0.75 }}>
											<Chip
												label={getGotoPageLabel(banner.goto_page)}
												size="small"
												variant="outlined"
												sx={{ fontWeight: 600 }}
											/>
											<Chip
												label={banner.target_audience}
												size="small"
												color={audienceChipColor[banner.target_audience]}
												sx={{ textTransform: 'capitalize', fontWeight: 600 }}
											/>
										</Stack>
										{formatPayload(banner) !== '-' && (
											<Typography variant="caption" color="text.secondary" display="block" mt={1} noWrap title={formatPayload(banner)}>
												{formatPayload(banner)}
											</Typography>
										)}
									</CatalogMediaCard>
								</Grid>
							))}
						</Grid>
					)}

					</PageContainer>
			)}

			{/* Create / Edit dialog */}
			<Dialog open={modalOpened} onClose={closeFormModal} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ fontWeight: 600 }}>
					{editingId ? 'Edit promotion banner' : 'Add promotion banner'}
				</DialogTitle>
				<DialogContent dividers>
					<Stack component="form" id="promotion-banner-form" spacing={2} onSubmit={handleSubmit} sx={{ pt: 0.5 }}>
						<DataSelect
							label="Goto page"
							placeholder="Select destination"
							data={gotoPageOptions}
							value={form.goto_page || null}
							onChange={value =>
								setForm(current => ({
									...current,
									goto_page: value || '',
									bookId: '',
									categoryName: '',
								}))
							}
							required
						/>

						{form.goto_page === '/audiobook' && (
							<TextField
								label="Book ID"
								placeholder="Enter audiobook ID"
								value={form.bookId}
								onChange={e => setForm(current => ({ ...current, bookId: e.target.value }))}
								required
								fullWidth
								size="small"
							/>
						)}

						{form.goto_page === '/category' && (
							<DataSelect
								label="Category name"
								placeholder="Select category"
								data={categoryOptions}
								value={form.categoryName || null}
								onChange={value => setForm(current => ({ ...current, categoryName: value || '' }))}
								searchable
								required
							/>
						)}

						<DataSelect
							label="Target audience"
							data={audienceOptions}
							value={form.target_audience}
							onChange={value =>
								setForm(current => ({
									...current,
									target_audience: (value as TargetAudience) || 'all',
								}))
							}
						/>

						<FormControlLabel
							control={
								<Switch
									checked={form.is_active}
									onChange={e =>
										setForm(current => ({
											...current,
											is_active: e.target.checked,
										}))
									}
								/>
							}
							label="Active"
						/>

						<Box>
							<Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
								Banner image
							</Typography>
							<Stack direction="row" spacing={2} alignItems="flex-start" flexWrap="wrap">
								<Button variant="outlined" component="label" size="small">
									Upload image
									<input type="file" hidden accept="image/*" onChange={handleImageUpload} />
								</Button>
								{form.banner_url ? (
									<Box
										component="img"
										src={form.banner_url}
										alt="Banner preview"
										sx={{
											width: 180,
											height: 100,
											objectFit: 'contain',
											borderRadius: 1,
											border: 1,
											borderColor: 'divider',
											bgcolor: 'grey.50',
										}}
									/>
								) : (
									<Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
										Required — upload a banner image
									</Typography>
								)}
							</Stack>
						</Box>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ px: 3, py: 2 }}>
					<Button variant="outlined" color="inherit" onClick={closeFormModal}>
						Cancel
					</Button>
					<Button type="submit" form="promotion-banner-form" variant="contained">
						{editingId ? 'Save changes' : 'Create banner'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Preview dialog */}
			<Dialog
				open={Boolean(previewBanner)}
				onClose={() => setPreviewBanner(null)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle
					sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}
				>
					<Typography variant="subtitle1" fontWeight={600}>
						{previewBanner?.title}
					</Typography>
					<IconButton aria-label="Close preview" size="small" onClick={() => setPreviewBanner(null)}>
						<IconX size={18} />
					</IconButton>
				</DialogTitle>
				<DialogContent
					dividers
					sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						bgcolor: 'grey.50',
						minHeight: 240,
						py: 3,
					}}
				>
					{previewBanner?.url ? (
						<Box
							component={motion.img}
							key={previewBanner.url}
							src={previewBanner.url}
							alt={previewBanner.title}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={transition.normal}
							sx={{
								maxWidth: '100%',
								maxHeight: '70vh',
								objectFit: 'contain',
								borderRadius: 1,
								boxShadow: 4,
							}}
						/>
					) : null}
				</DialogContent>
			</Dialog>
		</>
	);
}
