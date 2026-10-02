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
import Loader from '@/components/Loader';
import { createActivityLog } from '@/helper/Commonfunction';
import { useDisclosure } from '@/hooks/use-disclosure';
import { transition } from '@/styles/motion';
import { createToast2 } from 'helpers/SweetAlert';
import { IconEdit, IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

const IMAGE_UPLOAD_URL = 'https://api.kabbik.com/v3/audiobooks/upload-image-in-stack';

export default function AdminCategory() {
	const [categoryList, setCategoryList] = useState<any[]>([]);
	const [name, setName] = useState('');
	const [image, setImage] = useState('');
	const [addImage, setAddImage] = useState('');
	const [priority, setPriority] = useState('');
	const [categoryId, setCategoryId] = useState<number | undefined>();
	const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [searchInput, setSearchInput] = useState('');
	const [activeSearch, setActiveSearch] = useState('');
	const [updateCategory, { open: openUpdateCategory, close: closeUpdateCategory }] =
		useDisclosure(false);
	const [addCategory, { open: openAddCategory, close: closeAddCategory }] = useDisclosure(false);
	const [changePriority, { open: openChangePriority, close: closeChangePriority }] =
		useDisclosure(false);

	const filteredList = useMemo(() => {
		const q = activeSearch.trim().toLowerCase();
		if (!q) return categoryList;
		return categoryList.filter((item: any) => {
			const nameMatch = String(item.name ?? '').toLowerCase().includes(q);
			const idMatch = String(item.id ?? '').includes(q);
			const priorityMatch = String(item.priority ?? '').includes(q);
			return nameMatch || idMatch || priorityMatch;
		});
	}, [categoryList, activeSearch]);

	const isSearchActive = Boolean(activeSearch);

	const resetAddForm = () => {
		setName('');
		setAddImage('');
		setPriority('');
	};

	const handleUpdateData = (element: any) => {
		setName(element.name);
		setImage(element.thumb_path);
		setAddImage('');
		setCategoryId(element.id);
		openUpdateCategory();
	};

	async function getData() {
		try {
			const response = await fetch('/api/routes/audio-category', { cache: 'no-store' });
			const apidata = await response.json();
			setIsLoading(false);
			setCategoryList(Array.isArray(apidata) ? apidata : []);
		} catch {
			setIsLoading(false);
		}
	}

	const handleAddImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		try {
			const formData = new FormData();
			formData.append('files', file);
			formData.append('size', String(file.size));
			const response = await fetch(IMAGE_UPLOAD_URL, { method: 'POST', body: formData });
			createActivityLog({
				name: 'handleAddImage,category/page.tsx',
				action_type: 'create',
				payload: JSON.stringify({ fileName: file.name }),
				api_end_point: IMAGE_UPLOAD_URL,
			});
			const res = await response.json();
			setAddImage(res.image_file_url);
		} catch {
			/* ignore */
		}
	};

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const data = { id: categoryId, name, thumb_path: addImage || image };
			const response = await fetch('/api/routes/category-update', {
				method: 'POST',
				body: JSON.stringify(data),
			});
			createActivityLog({
				name: 'handleUpdate,category/page.tsx',
				action_type: 'update',
				payload: JSON.stringify(data),
				api_end_point: '/api/routes/category-update',
			});
			const apidata = await response.json();
			if (apidata.statusCode === 200) {
				getData();
				closeUpdateCategory();
			}
		} catch {
			/* ignore */
		}
	};

	const handleAddCategory = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const data = { name, thumb_path: addImage, priority };
			const response = await fetch('/api/routes/add-category', {
				method: 'POST',
				body: JSON.stringify(data),
			});
			createActivityLog({
				name: 'handleAddCategory,category/page.tsx',
				action_type: 'create',
				payload: JSON.stringify(data),
				api_end_point: '/api/routes/add-category',
			});
			const apidata = await response.json();
			if (apidata.statusCode === 200) {
				resetAddForm();
				getData();
				closeAddCategory();
			}
		} catch {
			/* ignore */
		}
	};

	const handleChangePriority = (element: any) => {
		setPriority(String(element.priority ?? ''));
		setCategoryId(element.id);
		openChangePriority();
	};

	const changePriorityApi = async (e: React.FormEvent) => {
		e.preventDefault();
		const data = { id: categoryId, priority };
		try {
			const response = await fetch('/api/routes/priority-update', {
				method: 'POST',
				body: JSON.stringify(data),
			});
			createActivityLog({
				name: 'changePriorityApi,category/page.tsx',
				action_type: 'update',
				payload: JSON.stringify(data),
				api_end_point: '/api/routes/priority-update',
			});
			const apidata = await response.json();
			if (apidata.statusCode === 200) {
				createToast2(apidata.message);
				getData();
				closeChangePriority();
			}
		} catch {
			/* ignore */
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

	const imageUploadBlock = (previewUrl: string, helper?: string) => (
		<Box>
			<Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Category image</Typography>
			<Stack direction="row" spacing={2} alignItems="flex-start" flexWrap="wrap">
				<Button variant="outlined" component="label" size="small">
					Upload image
					<input type="file" hidden accept="image/*" onChange={handleAddImage} />
				</Button>
				{previewUrl ? (
					<Box
						component="img"
						src={previewUrl}
						alt="Preview"
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
				) : (
					<Typography variant="caption" color="text.secondary">{helper || 'Upload a thumbnail'}</Typography>
				)}
			</Stack>
		</Box>
	);

	return (
		<>
			{isLoading ? (
				<Loader />
			) : (
				<PageContainer
					title="Categories"
					items={[{ label: 'Category', href: '/dashboard/category' }]}
					subtitle={
						<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
							{isSearchActive
								? `${filteredList.length} of ${categoryList.length} match "${activeSearch}"`
								: `${categoryList.length} categor${categoryList.length === 1 ? 'y' : 'ies'}`}
							{' · '}browse and discovery
						</Typography>
					}
					actions={
						<Button
							onClick={() => {
								resetAddForm();
								openAddCategory();
							}}
							variant="contained"
							startIcon={<IconPlus size={16} />}
						>
							Add category
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
										placeholder="Search by name, ID, or priority…"
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

						{categoryList.length === 0 ? (
							<Paper variant="outlined" sx={{ py: 10, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}>
								<Typography color="text.secondary">No categories found.</Typography>
								<Button
									onClick={() => {
										resetAddForm();
										openAddCategory();
									}}
									variant="contained"
									sx={{ mt: 2 }}
									startIcon={<IconPlus size={16} />}
								>
									Add first category
								</Button>
							</Paper>
						) : filteredList.length === 0 ? (
							<Paper variant="outlined" sx={{ py: 8, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}>
								<Typography color="text.secondary">No categories match your search.</Typography>
								<Button variant="outlined" sx={{ mt: 2 }} onClick={() => { setSearchInput(''); setActiveSearch(''); }}>
									Clear search
								</Button>
							</Paper>
						) : (
							<Grid container spacing={3}>
								{filteredList.map((element: any) => (
									<Grid item key={element.id} xs={12} sm={6} md={4} lg={3}>
										<CatalogMediaCard
											imageSrc={element.thumb_path}
											imageAlt={element.name}
											imageHeight={140}
											imageFit="contain"
											onImageClick={() => setPreviewImage({ url: element.thumb_path, title: element.name })}
											topBadge={
												<Chip
													label={`Priority ${element.priority ?? '—'}`}
													size="small"
													color="primary"
													variant="outlined"
													sx={{ fontWeight: 700, fontSize: '0.65rem' }}
												/>
											}
											actions={
												<>
													<Button
														size="small"
														variant="outlined"
														startIcon={<IconEdit size={14} />}
														onClick={() => handleUpdateData(element)}
													>
														Edit
													</Button>
													<Button size="small" variant="outlined" onClick={() => handleChangePriority(element)}>
														Priority
													</Button>
												</>
											}
											actionsSx={{ justifyContent: 'flex-end', gap: 0.5 }}
										>
											<Typography variant="body2" fontWeight={600} noWrap title={element.name}>
												{element.name}
											</Typography>
											<Typography variant="caption" color="text.disabled" fontFamily="monospace">
												#{element.id}
											</Typography>
										</CatalogMediaCard>
									</Grid>
								))}
							</Grid>
						)}
					</Stack>

					<Dialog
						open={addCategory}
						onClose={() => { resetAddForm(); closeAddCategory(); }}
						maxWidth="sm"
						fullWidth
					>
						<DialogTitle sx={{ fontWeight: 600 }}>Add category</DialogTitle>
						<DialogContent dividers>
							<Stack component="form" id="category-add-form" spacing={2} onSubmit={handleAddCategory} sx={{ pt: 0.5 }}>
								<TextField label="Name" required value={name} onChange={e => setName(e.target.value)} fullWidth size="small" placeholder="Category name" />
								<TextField label="Priority" required value={priority} onChange={e => setPriority(e.target.value)} fullWidth size="small" placeholder="Display order" />
								{imageUploadBlock(addImage, 'Required — upload category image')}
							</Stack>
						</DialogContent>
						<DialogActions sx={{ px: 3, py: 2 }}>
							<Button variant="outlined" color="inherit" onClick={() => { resetAddForm(); closeAddCategory(); }}>Cancel</Button>
							<Button type="submit" form="category-add-form" variant="contained" disabled={!addImage}>Create</Button>
						</DialogActions>
					</Dialog>

					<Dialog open={updateCategory} onClose={closeUpdateCategory} maxWidth="sm" fullWidth>
						<DialogTitle sx={{ fontWeight: 600 }}>Update category</DialogTitle>
						<DialogContent dividers>
							<Stack component="form" id="category-edit-form" spacing={2} onSubmit={handleUpdate} sx={{ pt: 0.5 }}>
								<TextField label="Name" value={name} onChange={e => setName(e.target.value)} fullWidth size="small" required />
								{image ? (
									<Box>
										<Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>Current image</Typography>
										<Box component="img" src={image} alt="" sx={{ width: 128, height: 72, objectFit: 'contain', borderRadius: 1, border: 1, borderColor: 'divider' }} />
									</Box>
								) : null}
								{imageUploadBlock(addImage, 'Optional — replace thumbnail')}
							</Stack>
						</DialogContent>
						<DialogActions sx={{ px: 3, py: 2 }}>
							<Button variant="outlined" color="inherit" onClick={closeUpdateCategory}>Cancel</Button>
							<Button type="submit" form="category-edit-form" variant="contained">Save changes</Button>
						</DialogActions>
					</Dialog>

					<Dialog open={changePriority} onClose={closeChangePriority} maxWidth="xs" fullWidth>
						<DialogTitle sx={{ fontWeight: 600 }}>Change priority</DialogTitle>
						<DialogContent dividers>
							<Stack component="form" id="category-priority-form" spacing={2} onSubmit={changePriorityApi} sx={{ pt: 0.5 }}>
								<TextField label="Priority" required value={priority} onChange={e => setPriority(e.target.value)} fullWidth size="small" />
							</Stack>
						</DialogContent>
						<DialogActions sx={{ px: 3, py: 2 }}>
							<Button variant="outlined" color="inherit" onClick={closeChangePriority}>Cancel</Button>
							<Button type="submit" form="category-priority-form" variant="contained">Save</Button>
						</DialogActions>
					</Dialog>

					<Dialog open={Boolean(previewImage)} onClose={() => setPreviewImage(null)} maxWidth="md" fullWidth>
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
