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
import Loader from '@/components/Loader';
import { createActivityLog } from '@/helper/Commonfunction';
import { useDisclosure } from '@/hooks/use-disclosure';
import { IconPlus, IconRefresh, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { transition } from '@/styles/motion';

const IMAGE_UPLOAD_URL = 'https://api.kabbik.com/v3/audiobooks/upload-image-in-stack';

const TYPE_CHIP_COLOR: Record<string, 'primary' | 'secondary' | 'info' | 'default'> = {
	SUBSCRIPTION: 'primary',
	AUDIOBOOK: 'secondary',
	STORE: 'info',
};

export default function PopupBanner() {
	const [popupList, setPopupList] = useState<any[]>([]);
	const [addImage, setAddImage] = useState<string>();
	const [audioBookId, setAudioBookId] = useState('');
	const [assignOpened, { open: openAddBanner, close: closeAddBanner }] = useDisclosure(false);
	const [value, setValue] = useState('');
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);
	const [previewPopup, setPreviewPopup] = useState<{ url: string; title: string } | null>(null);

	const getPopUpList = async () => {
		try {
			const response = await fetch('/api/routes/popup');
			const apidata = await response.json();
			setPopupList(Array.isArray(apidata) ? apidata : []);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const uploadImage = async (file: File, logName: string) => {
		const formData = new FormData();
		formData.append('files', file);
		formData.append('size', String(file.size));
		const response = await fetch(IMAGE_UPLOAD_URL, { method: 'POST', body: formData });
		createActivityLog({
			name: `${logName},popupbanner/page.tsx`,
			action_type: 'create',
			payload: JSON.stringify({ fileName: file.name }),
			api_end_point: IMAGE_UPLOAD_URL,
		});
		const res = await response.json();
		return res.image_file_url as string;
	};

	const handleToggle = async (item: any) => {
		const nextStatus = item.status == 1 ? 0 : 1;
		const result = await Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, update it!',
		});
		if (!result.isConfirmed) return;

		try {
			const response = await fetch(`/api/routes/popup/${item.id}`, {
				method: 'POST',
				body: JSON.stringify({ status: nextStatus }),
			});
			createActivityLog({
				name: 'handleToggle,popupbanner/page.tsx',
				action_type: 'update',
				payload: JSON.stringify({ id: item.id, status: nextStatus }),
				api_end_point: `/api/routes/popup/${item.id}`,
			});
			if (!response.ok) throw new Error('Failed to update');
			await getPopUpList();
			Swal.fire({ title: 'Updated!', text: 'Item has been updated.', icon: 'success' });
		} catch (error) {
			console.error(error);
			Swal.fire({ title: 'Error!', text: 'Failed to update item.', icon: 'error' });
		}
	};

	const handleAddImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		setUploading(true);
		try {
			const url = await uploadImage(file, 'handleAddImage');
			setAddImage(url);
		} catch {
			Swal.fire({ title: 'Error', text: 'Failed to upload image', icon: 'error' });
		} finally {
			setUploading(false);
		}
	};

	const closeAddModal = () => {
		closeAddBanner();
		setAddImage(undefined);
		setValue('');
		setAudioBookId('');
	};

	const handleAddPopup = async (event: React.FormEvent) => {
		event.preventDefault();
		const formData = new FormData();
		formData.append('audiobook_id', audioBookId);
		formData.append('home_ad_type', value);
		if (addImage) formData.append('home_ad_image', addImage);

		try {
			const response = await fetch('/api/routes/addpopup', { method: 'POST', body: formData });
			createActivityLog({
				name: 'handleAddPopup',
				action_type: 'create',
				payload: JSON.stringify({ audiobook_id: audioBookId, home_ad_type: value, home_ad_image: addImage }),
				api_end_point: '/api/routes/addpopup',
			});
			const res = await response.json();
			if (res.statusCode === 201) {
				closeAddModal();
				getPopUpList();
			}
		} catch (error) {
			console.error(error);
		}
	};

	const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>, item: any) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const confirmed = await Swal.fire({
			title: 'Replace popup image?',
			text: 'The current image will be updated.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, update it!',
		});
		if (!confirmed.isConfirmed) {
			event.target.value = '';
			return;
		}

		try {
			const imageUrl = await uploadImage(file, 'handleImageChange');
			if (!imageUrl) throw new Error('Upload failed');
			const patchRes = await fetch(`/api/routes/popup/${item.id}`, {
				method: 'PATCH',
				body: JSON.stringify({ image_url: imageUrl }),
			});
			createActivityLog({
				name: 'handleImageChange,popupbanner/page.tsx',
				action_type: 'update',
				payload: JSON.stringify({ image_url: imageUrl }),
				api_end_point: `/api/routes/popup/${item.id}`,
			});
			const patchJson = await patchRes.json();
			if (patchJson.statusCode === 200) {
				setPopupList(prev =>
					prev.map(el => (el.id === item.id ? { ...el, home_ad_image: imageUrl } : el)),
				);
				Swal.fire({ title: 'Updated!', text: 'Image has been updated.', icon: 'success' });
			}
		} catch (error) {
			console.error(error);
			Swal.fire({ title: 'Error!', text: 'Failed to update image.', icon: 'error' });
		} finally {
			event.target.value = '';
		}
	};

	useEffect(() => {
		getPopUpList();
	}, []);

	return (
		<>
			{loading ? (
				<Loader />
			) : (
				<PageContainer
					title="Popup Banners"
					items={[{ label: 'Popupbanner', href: '/dashboard/popupbanner' }]}
					subtitle={
						<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
							{popupList.length} popup{popupList.length === 1 ? '' : 's'} · in-app promotional overlays
						</Typography>
					}
					actions={
						<Button onClick={openAddBanner} variant="contained" startIcon={<IconPlus size={16} />}>
							Add Popup
						</Button>
					}
				>
					<Stack spacing={3}>
						{popupList.length === 0 ? (
							<Paper
								variant="outlined"
								sx={{ py: 10, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}
							>
								<Typography color="text.secondary">No popup banners yet.</Typography>
								<Button onClick={openAddBanner} variant="contained" sx={{ mt: 2 }} startIcon={<IconPlus size={16} />}>
									Add first popup
								</Button>
							</Paper>
						) : (
							<Grid container spacing={3}>
								{popupList.map((element: any) => {
									const typeKey = String(element.home_ad_type || '').toUpperCase();
									const chipColor = TYPE_CHIP_COLOR[typeKey] ?? 'default';
									return (
										<Grid item key={element.id} xs={12} sm={6} md={4} lg={3}>
											<CatalogMediaCard
												imageSrc={element.home_ad_image}
												imageAlt={typeKey}
												imageHeight={160}
												imageFit="contain"
												inactive={element.status != 1}
												onImageClick={
													element.home_ad_image
														? () => setPreviewPopup({ url: element.home_ad_image, title: `${typeKey} popup` })
														: undefined
												}
												topBadge={
													<Chip
														label={element.status == 1 ? 'Active' : 'Inactive'}
														size="small"
														color={element.status == 1 ? 'success' : 'default'}
														sx={{ fontWeight: 700, fontSize: '0.65rem' }}
													/>
												}
												actions={
													<>
														<Tooltip title={element.status == 1 ? 'Deactivate' : 'Activate'}>
															<Switch
																size="small"
																checked={element.status == 1}
																onChange={() => handleToggle(element)}
															/>
														</Tooltip>
														<Tooltip title="Replace image">
															<IconButton size="small" component="label">
																<IconRefresh size={16} />
																<input
																	type="file"
																	hidden
																	accept="image/*"
																	onChange={e => handleImageChange(e, element)}
																/>
															</IconButton>
														</Tooltip>
													</>
												}
												actionsSx={{ justifyContent: 'space-between', width: '100%' }}
											>
												<Chip
													label={typeKey || '—'}
													size="small"
													color={chipColor}
													variant="outlined"
													sx={{ fontWeight: 600 }}
												/>
												<Typography variant="caption" color="text.disabled" fontFamily="monospace" display="block" mt={1}>
													#{element.id}
												</Typography>
											</CatalogMediaCard>
										</Grid>
									);
								})}
							</Grid>
						)}
					</Stack>

					<Dialog open={assignOpened} onClose={closeAddModal} maxWidth="sm" fullWidth>
						<DialogTitle sx={{ fontWeight: 600 }}>Add Popup Banner</DialogTitle>
						<DialogContent dividers>
							<Stack component="form" id="popup-add-form" spacing={2} onSubmit={handleAddPopup} sx={{ pt: 0.5 }}>
								<DataSelect
									label="Type"
									data={[
										{ value: 'SUBSCRIPTION', label: 'Subscription' },
										{ value: 'AUDIOBOOK', label: 'Audiobook' },
										{ value: 'STORE', label: 'Store' },
									]}
									placeholder="Select type"
									value={value || null}
									onChange={(option: string | null) => setValue(option ?? '')}
								/>
								{value?.toLowerCase() === 'audiobook' && (
									<TextField
										label="Audiobook ID"
										size="small"
										fullWidth
										value={audioBookId}
										onChange={e => setAudioBookId(e.target.value)}
										required
										placeholder="Audiobook ID"
									/>
								)}
								<Box>
									<Typography variant="subtitle2" fontWeight={600} mb={1}>Image</Typography>
									<Stack direction="row" spacing={2} alignItems="center">
										<Button variant="outlined" component="label" size="small" disabled={uploading}>
											{uploading ? 'Uploading…' : 'Upload image'}
											<input type="file" hidden accept="image/*" onChange={handleAddImage} />
										</Button>
										{addImage && (
											<Box
												component="img"
												src={addImage}
												alt="Preview"
												sx={{ maxHeight: 80, maxWidth: 160, objectFit: 'contain', borderRadius: 1, border: 1, borderColor: 'divider' }}
											/>
										)}
									</Stack>
								</Box>
							</Stack>
						</DialogContent>
						<DialogActions sx={{ px: 3, py: 2 }}>
							<Button variant="outlined" color="inherit" onClick={closeAddModal}>Cancel</Button>
							<Button type="submit" form="popup-add-form" variant="contained" disabled={uploading}>
								Add Popup
							</Button>
						</DialogActions>
					</Dialog>

					<Dialog open={Boolean(previewPopup)} onClose={() => setPreviewPopup(null)} maxWidth="md" fullWidth>
						<DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
							<Typography variant="subtitle1" fontWeight={600}>{previewPopup?.title}</Typography>
							<IconButton aria-label="Close preview" size="small" onClick={() => setPreviewPopup(null)}>
								<IconX size={18} />
							</IconButton>
						</DialogTitle>
						<DialogContent dividers sx={{ display: 'flex', justifyContent: 'center', bgcolor: 'grey.50', minHeight: 240, py: 3 }}>
							{previewPopup?.url ? (
								<Box
									component={motion.img}
									key={previewPopup.url}
									src={previewPopup.url}
									alt={previewPopup.title}
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
