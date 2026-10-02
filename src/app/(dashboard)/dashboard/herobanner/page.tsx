'use client';
import {
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	Pagination,
	Paper,
	Stack,
	Switch,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { CatalogMediaCard } from '@/components/mantis/CatalogMediaCard';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { DataSelect } from '@/components/Form/DataSelect';
import { useDisclosure } from '@/hooks/use-disclosure';
import { IconPlus, IconRefresh, IconTrash, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Loader from '@/components/Loader';
import { createActivityLog } from '@/helper/Commonfunction';
import { transition } from '@/styles/motion';

const IMAGE_UPLOAD_URL = 'https://api.kabbik.com/v3/audiobooks/upload-image-in-stack';
const ITEMS_PER_PAGE = 12;

export default function HeroBanner() {
	const [bannerData, setBannerData] = useState<any[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [offset, setOffset] = useState(0);
	const [totalData, setTotalData] = useState(0);
	const [loading, setLoading] = useState(true);

	// Add form
	const [audioBookId, setAudioBookId] = useState('');
	const [bannerType, setBannerType] = useState('');
	const [imageFile, setImageFile] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);

	const [addBannerOpened, { open: openAddBanner, close: closeAddBanner }] = useDisclosure(false);
	const [previewBanner, setPreviewBanner] = useState<{ url: string; title: string } | null>(null);

	const totalPages = Math.ceil(totalData / ITEMS_PER_PAGE);

	const getBannerData = async () => {
		try {
			const response = await fetch(
				`/api/routes/herobanner?offset=${offset}&limit=${ITEMS_PER_PAGE}`,
			);
			const res = await response.json();
			setLoading(false);
			setBannerData(res.data ?? []);
			setTotalData(res.total?.count ?? 0);
		} catch (error) {
			setLoading(false);
		}
	};

	useEffect(() => { getBannerData(); }, [offset]);

	const handlePageChange = (_: any, page: number) => {
		setCurrentPage(page);
		setOffset((page - 1) * ITEMS_PER_PAGE);
	};

	const uploadImage = async (file: File, logLabel: string) => {
		const formData = new FormData();
		formData.append('files', file);
		formData.append('size', String(file.size));
		const response = await fetch(IMAGE_UPLOAD_URL, { method: 'POST', body: formData });
		createActivityLog({
			name: `${logLabel},herobanner/page.tsx`,
			action_type: 'update',
			payload: JSON.stringify({ fileName: file.name }),
			api_end_point: IMAGE_UPLOAD_URL,
		});
		const res = await response.json();
		return res.image_file_url as string;
	};

	const handleReplaceImage = async (event: React.ChangeEvent<HTMLInputElement>, item: any) => {
		try {
			const file = event.target.files?.[0];
			if (!file) return;
			const imageUrl = await uploadImage(file, 'handleHeroImage');
			if (!imageUrl) return;
			await fetch(`/api/routes/herobanner/${item.id}`, {
				method: 'PATCH',
				body: JSON.stringify({ image_url: imageUrl }),
			});
			createActivityLog({
				name: 'handleHeroImage,herobanner/page.tsx',
				action_type: 'update',
				payload: JSON.stringify({ image_url: imageUrl }),
				api_end_point: `/api/routes/herobanner/${item.id}`,
			});
			setBannerData(prev =>
				prev.map(el => (el.id === item.id ? { ...el, image_url: imageUrl } : el)),
			);
		} catch { /* silent */ }
	};

	const handleAddImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		setUploading(true);
		try {
			const url = await uploadImage(file, 'addHeroImage');
			setImageFile(url);
		} catch { /* silent */ }
		finally { setUploading(false); }
	};

	const handleAddHeroBanner = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!imageFile) {
			Swal.fire({ title: 'Missing image', text: 'Please upload a banner image.', icon: 'warning' });
			return;
		}
		try {
			const data = { audiobook_id: audioBookId, image_url: imageFile, title: bannerType };
			await fetch('/api/routes/herobanner', { method: 'POST', body: JSON.stringify(data) });
			createActivityLog({
				name: 'handleAddHeroBanner,herobanner/page.tsx',
				action_type: 'create',
				payload: JSON.stringify(data),
				api_end_point: '/api/routes/herobanner',
			});
			getBannerData();
			closeAddBanner();
			setAudioBookId(''); setBannerType(''); setImageFile(null);
		} catch { /* silent */ }
	};

	const handleToggle = async (item: any) => {
		const newStatus = item.status === 1 ? 0 : 1;
		try {
			await fetch('/api/routes/hero-banner-toggle', {
				method: 'POST',
				body: JSON.stringify({ audiobook_id: item.audiobook_id, status: newStatus }),
			});
			createActivityLog({
				name: 'handleToggle,herobanner/page.tsx',
				action_type: 'update',
				payload: JSON.stringify({ id: item.id, status: newStatus }),
				api_end_point: `/api/routes/popup/${item.id}`,
			});
			getBannerData();
		} catch { /* silent */ }
	};

	const deleteHeroImage = async (id: any) => {
		const result = await Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!',
		});
		if (!result.isConfirmed) return;
		try {
			const response = await fetch(`/api/routes/herobanner/${id}`, { method: 'DELETE' });
			createActivityLog({
				name: 'deleteHeroImage,herobanner/page.tsx',
				action_type: 'delete',
				payload: JSON.stringify({ id }),
				api_end_point: `/api/routes/herobanner/${id}`,
			});
			const res = await response.json();
			if (res.statusCode === 200) {
				Swal.fire({ title: 'Deleted!', text: 'Banner deleted.', icon: 'success' });
				getBannerData();
			}
		} catch { /* silent */ }
	};

	return (
		<>
			{loading ? (
				<Loader />
			) : (
				<PageContainer
					title="Hero Banners"
					items={[{ label: 'Hero Banner', href: '/dashboard/herobanner' }]}
					subtitle={
						<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
							{totalData} banner{totalData !== 1 ? 's' : ''} · shown on app home screen
						</Typography>
					}
					actions={
						<Button onClick={openAddBanner} variant="contained" startIcon={<IconPlus size={16} />}>
							Add Banner
						</Button>
					}
				>
					<Stack spacing={3}>
						{/* Card grid */}
						{bannerData.length === 0 ? (
							<Paper
								variant="outlined"
								sx={{ py: 10, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}
							>
								<Typography color="text.secondary">No hero banners found.</Typography>
								<Button onClick={openAddBanner} variant="contained" sx={{ mt: 2 }} startIcon={<IconPlus size={16} />}>
									Add first banner
								</Button>
							</Paper>
						) : (
							<Grid container spacing={3}>
								{bannerData.map((banner: any) => (
									<Grid item key={banner.id} xs={12} sm={6} md={4} lg={3}>
										<CatalogMediaCard
											imageSrc={banner.image_url}
											imageAlt={banner.title || `Banner #${banner.id}`}
											imageHeight={160}
											imageFit="cover"
											inactive={banner.status !== 1}
											onImageClick={
												banner.image_url
													? () =>
															setPreviewBanner({
																url: banner.image_url,
																title: banner.title || `Banner #${banner.id}`,
															})
													: undefined
											}
											topBadge={
												<Chip
													label={banner.status === 1 ? 'Active' : 'Inactive'}
													size="small"
													color={banner.status === 1 ? 'success' : 'default'}
													sx={{ fontWeight: 700, fontSize: '0.65rem' }}
												/>
											}
											actions={
												<>
													<Tooltip title={banner.status === 1 ? 'Deactivate' : 'Activate'}>
														<Switch
															size="small"
															checked={banner.status === 1}
															onChange={() => handleToggle(banner)}
														/>
													</Tooltip>
													<Stack direction="row" spacing={0.5}>
														<Tooltip title="Replace image">
															<IconButton size="small" component="label">
																<IconRefresh size={16} />
																<input
																	type="file"
																	hidden
																	accept="image/*"
																	onChange={e => { handleReplaceImage(e, banner); e.target.value = ''; }}
																/>
															</IconButton>
														</Tooltip>
														<Tooltip title="Delete">
															<IconButton size="small" color="error" onClick={() => deleteHeroImage(banner.id)}>
																<IconTrash size={16} />
															</IconButton>
														</Tooltip>
													</Stack>
												</>
											}
											actionsSx={{ justifyContent: 'space-between', width: '100%' }}
										>
											<Stack direction="row" justifyContent="space-between" mb={0.5}>
												<Typography variant="caption" color="text.disabled" fontFamily="monospace">
													#{banner.id}
												</Typography>
												<Typography variant="caption" color="text.disabled">
													{moment(banner.created_at).format('D MMM YYYY')}
												</Typography>
											</Stack>
											{banner.title && (
												<Chip
													label={banner.title}
													size="small"
													variant="outlined"
													sx={{ fontWeight: 600, textTransform: 'uppercase', mt: 0.5 }}
												/>
											)}
											{banner.audiobook_id && (
												<Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
													Audiobook #{banner.audiobook_id}
												</Typography>
											)}
										</CatalogMediaCard>
									</Grid>
								))}
							</Grid>
						)}

						{/* Pagination */}
						{totalPages > 1 && (
							<Stack direction="row" justifyContent="space-between" alignItems="center">
								<Typography variant="body2" color="text.secondary">
									Showing {bannerData.length} of {totalData}
								</Typography>
								<Pagination
									page={currentPage}
									onChange={handlePageChange}
									count={totalPages}
									shape="rounded"
									color="primary"
								/>
							</Stack>
						)}
					</Stack>
				</PageContainer>
			)}

			{/* Add dialog */}
			<Dialog open={addBannerOpened} onClose={closeAddBanner} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ fontWeight: 600 }}>Add Hero Banner</DialogTitle>
				<DialogContent dividers>
					<Stack component="form" id="hero-banner-form" spacing={2} onSubmit={handleAddHeroBanner} sx={{ pt: 0.5 }}>
						<TextField
							label="Audiobook ID"
							value={audioBookId}
							onChange={e => setAudioBookId(e.target.value)}
							fullWidth
							size="small"
							placeholder="e.g. 42"
							type="number"
						/>
						<DataSelect
							label="Banner Type"
							data={[
								{ value: 'subscription', label: 'Subscription' },
								{ value: 'audiobook', label: 'Audiobook' },
							]}
							placeholder="Select banner type"
							value={bannerType}
							onChange={(v: any) => setBannerType(v ?? '')}
						/>
						<Box>
							<Typography variant="subtitle2" fontWeight={600} mb={1}>
								Banner Image
							</Typography>
							<Stack direction="row" spacing={2} alignItems="center">
								<Button variant="outlined" component="label" size="small" disabled={uploading}>
									{uploading ? 'Uploading…' : 'Upload image'}
									<input type="file" hidden accept="image/*" onChange={handleAddImageUpload} />
								</Button>
								{imageFile ? (
									<Box
										component="img"
										src={imageFile}
										alt="Preview"
										sx={{
											height: 80,
											maxWidth: 200,
											objectFit: 'contain',
											borderRadius: 1,
											border: '1px solid',
											borderColor: 'divider',
											bgcolor: 'grey.50',
										}}
									/>
								) : (
									<Typography variant="caption" color="text.secondary">
										Required — upload a banner image
									</Typography>
								)}
							</Stack>
						</Box>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ px: 3, py: 2 }}>
					<Button variant="outlined" color="inherit" onClick={closeAddBanner}>Cancel</Button>
					<Button
						type="submit"
						form="hero-banner-form"
						variant="contained"
						disabled={!imageFile || uploading}
						onClick={handleAddHeroBanner}
					>
						Create Banner
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
				<DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
					<Typography variant="subtitle1" fontWeight={600} noWrap sx={{ pr: 2 }}>
						{previewBanner?.title}
					</Typography>
					<IconButton aria-label="Close preview" onClick={() => setPreviewBanner(null)} size="small">
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
					{previewBanner?.url && (
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
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
