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
	InputAdornment,
	Paper,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { CatalogMediaCard } from '@/components/mantis/CatalogMediaCard';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { CustomFileInput } from '@/components/Form/CustomFileInput';
import { CustomInput } from '@/components/Form/CustomInput';
import { CustomNumberInput } from '@/components/Form/CustomNumberInput';
import { CustomTextarea } from '@/components/Form/CustomTextarea';
import Loader from '@/components/Loader';
import {
	addUpcomingAudiobook,
	deleteUpcomingAudiobook,
	editUpcomingAudiobook,
	getUpcomingAudiobook,
} from '@/services/services';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useIsMobileSm } from '@/hooks/use-is-mobile-sm';
import { transition } from '@/styles/motion';
import { createToast, createToast2 } from 'helpers/SweetAlert';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconEdit, IconPlus, IconSearch, IconTrash, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const UpcomingAudiobookFormSchema = z.object({
	name: z.string().min(1, { message: 'Name must be provided' }),
	description: z.string().min(1, { message: 'Description must provided' }),
	authorName: z.string().min(1, { message: 'Author name must be provided' }),
	price: z.number({ required_error: 'Price must be privded' }),
	imagePath: z.string().min(1, { message: 'Image must be uploaded' }),
});

type UpcomingAudiobookFormType = z.infer<typeof UpcomingAudiobookFormSchema>;

export default function UpcomingAudio() {
	const isMobileSm = useIsMobileSm();
	const [data, setData] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loading, setLoading] = useState(false);
	const [resetImagePath, setResetImagePath] = useState(false);
	const [editUpcomingAudiobookDetails, setEditUpcomingAudiobookDetails] = useState<any>(null);
	const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
	const [createUpcomingModalOpened, { open: openCreateUpcomingModal, close: closeCreateUpcomingModal }] =
		useDisclosure(false);
	const [editUpcomingModalOpened, { open: openEditUpcomingModal, close: closeEditUpcomingModal }] =
		useDisclosure(false);
	const [searchInput, setSearchInput] = useState('');
	const [activeSearch, setActiveSearch] = useState('');

	const filteredList = useMemo(() => {
		const q = activeSearch.trim().toLowerCase();
		if (!q) return data;
		return data.filter((item: any) => {
			const name = String(item.name ?? '').toLowerCase();
			const author = String(item.author ?? '').toLowerCase();
			const desc = String(item.description ?? '').toLowerCase();
			const id = String(item.id ?? '');
			const price = String(item.price ?? '');
			return name.includes(q) || author.includes(q) || desc.includes(q) || id.includes(q) || price.includes(q);
		});
	}, [data, activeSearch]);

	const isSearchActive = Boolean(activeSearch);

	const {
		control: createControl,
		register: createRegister,
		handleSubmit: createHandleSubmit,
		setValue: createSetValue,
		reset: resetCreate,
		formState: { errors: createErrors, touchedFields: createTouchedFields, isSubmitting: createIsSubmitting },
	} = useForm<UpcomingAudiobookFormType>({
		resolver: zodResolver(UpcomingAudiobookFormSchema),
		defaultValues: { name: '', description: '', authorName: '', price: 0, imagePath: '' },
	});

	const {
		control: editControl,
		register: editRegister,
		handleSubmit: editHandleSubmit,
		setValue: editSetValue,
		formState: { errors: editErrors, touchedFields: editTouchedFields, isSubmitting: editIsSubmitting },
	} = useForm<UpcomingAudiobookFormType>({
		resolver: zodResolver(UpcomingAudiobookFormSchema),
		defaultValues: { name: '', description: '', authorName: '', price: 0, imagePath: '' },
		values: {
			name: editUpcomingAudiobookDetails?.name,
			description: editUpcomingAudiobookDetails?.description,
			authorName: editUpcomingAudiobookDetails?.author,
			price: editUpcomingAudiobookDetails?.price,
			imagePath: editUpcomingAudiobookDetails?.thumbPath,
		},
	});

	async function getData() {
		try {
			setIsLoading(true);
			const apidata = await getUpcomingAudiobook();
			setData(Array.isArray(apidata) ? apidata : []);
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}

	const closeCreateModal = () => {
		resetCreate({ name: '', description: '', authorName: '', price: 0, imagePath: '' });
		setResetImagePath(prev => !prev);
		closeCreateUpcomingModal();
	};

	const handleSubmitCreateUpcomingAudiobook = async (formData: UpcomingAudiobookFormType) => {
		try {
			const result = await addUpcomingAudiobook(formData);
			if (result?.statusCode === 201) {
				createToast2(result?.message);
				closeCreateModal();
				getData();
			} else {
				createToast(result?.message);
			}
		} catch (err) {
			console.error(err);
			createToast('Something went wrong');
		}
	};

	const handleDeleteUpcomingAudiobook = async (id: number) => {
		try {
			const result = await deleteUpcomingAudiobook(id);
			if (result?.statusCode === 200) {
				createToast2(result?.message);
				getData();
			} else {
				createToast(result?.message);
			}
		} catch (err) {
			console.error(err);
			createToast('Something went wrong');
		}
	};

	const handleSubmitEditUpcomingAudiobook = async (formData: UpcomingAudiobookFormType) => {
		try {
			const result = await editUpcomingAudiobook({
				...formData,
				id: editUpcomingAudiobookDetails?.id,
			});
			if (result?.statusCode === 200) {
				createToast2(result?.message);
				closeEditUpcomingModal();
				getData();
			} else {
				createToast(result?.message);
			}
		} catch (err) {
			console.error(err);
			createToast('Something went wrong');
		}
	};

	useEffect(() => {
		getData();
	}, []);

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setActiveSearch(searchInput.trim());
	};

	const handleSearchClear = (e: React.FormEvent) => {
		e.preventDefault();
		setSearchInput('');
		setActiveSearch('');
	};

	const formFields = (
		control: typeof createControl,
		register: typeof createRegister,
		setValue: typeof createSetValue,
		errors: typeof createErrors,
		touchedFields: typeof createTouchedFields,
	) => (
		<>
			<CustomInput
				label="Name"
				name="name"
				control={control}
				placeholder="Audiobook name"
				error={(errors.name && errors.name.message) as string}
				required
			/>
			<CustomTextarea
				label="Description"
				name="description"
				control={control}
				placeholder="Description"
				error={(errors.description && errors.description.message) as string}
				required
			/>
			<CustomInput
				label="Author name"
				name="authorName"
				control={control}
				placeholder="Author name"
				error={(errors.authorName && errors.authorName.message) as string}
				required
			/>
			<CustomNumberInput
				label="Price"
				name="price"
				control={control}
				placeholder="Price"
				error={(errors.price && errors.price.message) as string}
				required
			/>
			<CustomFileInput
				label="Audiobook image"
				name="imagePath"
				placeholder="Upload an image"
				multiple
				register={register}
				setValue={setValue}
				setLoading={setLoading}
				reset={resetImagePath}
				error={(errors.imagePath && errors.imagePath.message) as string}
				required
				isTouched={'imagePath' in touchedFields}
			/>
		</>
	);

	return (
		<>
			{isLoading ? (
				<Loader />
			) : (
				<PageContainer
					title="Upcoming Audio"
					items={[{ label: 'Upcoming Audio', href: '/dashboard/upcoming-audio' }]}
					subtitle={
						<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
							{isSearchActive
								? `${filteredList.length} of ${data.length} match "${activeSearch}"`
								: `${data.length} upcoming title${data.length === 1 ? '' : 's'}`}
							{' · '}pre-release catalog
						</Typography>
					}
					actions={
						<Button onClick={openCreateUpcomingModal} variant="contained" startIcon={<IconPlus size={16} />}>
							Add upcoming
						</Button>
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
										placeholder="Search by title, author, description, ID, or price…"
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

						{data.length === 0 ? (
							<Paper
								variant="outlined"
								sx={{ py: 10, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}
							>
								<Typography color="text.secondary">No upcoming audiobooks found.</Typography>
								<Button onClick={openCreateUpcomingModal} variant="contained" sx={{ mt: 2 }} startIcon={<IconPlus size={16} />}>
									Add first title
								</Button>
							</Paper>
						) : filteredList.length === 0 ? (
							<Paper variant="outlined" sx={{ py: 8, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}>
								<Typography color="text.secondary">No titles match your search.</Typography>
								<Button variant="outlined" sx={{ mt: 2 }} onClick={() => { setSearchInput(''); setActiveSearch(''); }}>
									Clear search
								</Button>
							</Paper>
						) : (
							<Grid container spacing={3}>
								{filteredList.map((element: any) => (
									<Grid item key={element.id} xs={12} sm={6} md={4} lg={3}>
										<CatalogMediaCard
											imageSrc={element.thumbPath}
											imageAlt={element.name}
											imageHeight={180}
											imageFit="cover"
											onImageClick={() => setPreviewImage({ url: element.thumbPath, title: element.name })}
											bottomBadge={
												<Chip label={`৳ ${element.price}`} size="small" color="primary" sx={{ fontWeight: 700 }} />
											}
											actions={
												<>
													<Button
														size="small"
														variant="outlined"
														startIcon={<IconEdit size={14} />}
														onClick={() => {
															setEditUpcomingAudiobookDetails(element);
															openEditUpcomingModal();
														}}
													>
														Edit
													</Button>
													<Button
														size="small"
														variant="outlined"
														color="error"
														startIcon={<IconTrash size={14} />}
														onClick={() => handleDeleteUpcomingAudiobook(element.id)}
													>
														Delete
													</Button>
												</>
											}
											actionsSx={{ justifyContent: 'flex-end', gap: 0.5 }}
										>
											<Typography variant="caption" color="text.disabled" fontFamily="monospace">
												#{element.id}
											</Typography>
											<Typography variant="subtitle2" fontWeight={600} noWrap title={element.name}>
												{element.name}
											</Typography>
											<Typography variant="caption" color="text.secondary" noWrap display="block">
												{element.author}
											</Typography>
											<Typography
												variant="caption"
												color="text.secondary"
												sx={{
													mt: 1,
													display: '-webkit-box',
													WebkitLineClamp: 3,
													WebkitBoxOrient: 'vertical',
													overflow: 'hidden',
												}}
											>
												{element.description}
											</Typography>
										</CatalogMediaCard>
									</Grid>
								))}
							</Grid>
						)}
					</Stack>

					<Dialog open={createUpcomingModalOpened} onClose={closeCreateModal} maxWidth="sm" fullWidth fullScreen={isMobileSm}>
						<DialogTitle sx={{ fontWeight: 600 }}>Create upcoming audiobook</DialogTitle>
						<DialogContent dividers>
							<Stack
								component="form"
								id="upcoming-create-form"
								spacing={2}
								onSubmit={createHandleSubmit(handleSubmitCreateUpcomingAudiobook, err => console.error(err))}
								sx={{ pt: 0.5 }}
							>
								{formFields(createControl, createRegister, createSetValue, createErrors, createTouchedFields)}
							</Stack>
						</DialogContent>
						<DialogActions sx={{ px: 3, py: 2 }}>
							<Button variant="outlined" color="inherit" onClick={closeCreateModal}>Cancel</Button>
							<Button
								type="submit"
								form="upcoming-create-form"
								variant="contained"
								disabled={loading || isLoading || createIsSubmitting}
							>
								Create
							</Button>
						</DialogActions>
					</Dialog>

					<Dialog open={editUpcomingModalOpened} onClose={closeEditUpcomingModal} maxWidth="sm" fullWidth fullScreen={isMobileSm}>
						<DialogTitle sx={{ fontWeight: 600 }}>Edit upcoming audiobook</DialogTitle>
						<DialogContent dividers>
							<Stack
								component="form"
								id="upcoming-edit-form"
								spacing={2}
								onSubmit={editHandleSubmit(handleSubmitEditUpcomingAudiobook, err => console.error(err))}
								sx={{ pt: 0.5 }}
							>
								{formFields(editControl, editRegister, editSetValue, editErrors, editTouchedFields)}
								{editUpcomingAudiobookDetails?.thumbPath ? (
									<Box>
										<Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
											Current cover
										</Typography>
										<Box
											component="img"
											src={editUpcomingAudiobookDetails.thumbPath}
											alt={editUpcomingAudiobookDetails.name}
											sx={{
												width: 128,
												height: 72,
												objectFit: 'contain',
												borderRadius: 1,
												border: 1,
												borderColor: 'divider',
												bgcolor: 'grey.50',
											}}
										/>
									</Box>
								) : null}
							</Stack>
						</DialogContent>
						<DialogActions sx={{ px: 3, py: 2 }}>
							<Button variant="outlined" color="inherit" onClick={closeEditUpcomingModal}>Cancel</Button>
							<Button
								type="submit"
								form="upcoming-edit-form"
								variant="contained"
								disabled={loading || isLoading || editIsSubmitting}
							>
								Save changes
							</Button>
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
