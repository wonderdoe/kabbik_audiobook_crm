'use client';
import {
	Avatar,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	InputAdornment,
	Paper,
	Pagination,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useIsMobileSm } from '@/hooks/use-is-mobile-sm';
import { IconEdit, IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { createActivityLog } from '@/helper/Commonfunction';
import Loader from '@/components/Loader';
import { PageContainer } from '@/components/PageContainer/PageContainer';

type Contributor = {
	id: number;
	name: string;
	en_name: string;
	imageUrl: string;
	created_at: string;
};

const IMAGE_UPLOAD_URL = 'https://api.kabbik.com/v3/audiobooks/upload-image-in-stack';
const ITEMS_PER_PAGE = 12; // divisible by 2/3/4 for grid

function ContributorForm({
	name, setName,
	enName, setEnName,
	image, setImage,
	onSubmit,
	onImageUpload,
	submitLabel,
}: {
	name: string; setName: (v: string) => void;
	enName: string; setEnName: (v: string) => void;
	image: string; setImage: (v: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
	submitLabel: string;
}) {
	return (
		<form onSubmit={onSubmit}>
			<Stack spacing={2} sx={{ pt: 0.5 }}>
				<TextField
					label="Name"
					value={name}
					onChange={e => setName(e.target.value)}
					required
					fullWidth
					size="small"
					placeholder="Bangla name"
				/>
				<TextField
					label="English Name"
					value={enName}
					onChange={e => setEnName(e.target.value)}
					fullWidth
					size="small"
					placeholder="English name"
				/>
				<Box>
					<Typography variant="subtitle2" fontWeight={600} mb={1}>
						Photo
					</Typography>
					<Stack direction="row" spacing={2} alignItems="center">
						<Button variant="outlined" component="label" size="small">
							Upload photo
							<input type="file" hidden accept="image/*" onChange={onImageUpload} />
						</Button>
						{image ? (
							<Avatar
								src={image}
								alt={name}
								sx={{ width: 64, height: 64, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}
							/>
						) : (
							<Typography variant="caption" color="text.secondary">No image selected</Typography>
						)}
					</Stack>
				</Box>
			</Stack>
		</form>
	);
}

export default function ContributorsView() {
	const isMobileSm = useIsMobileSm();
	const [contributorList, setContributorList] = useState<Contributor[]>([]);
	const [totalData, setTotalData] = useState(0);
	const [offset, setOffset] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [loading, setLoading] = useState(true);

	const [searchInputValue, setSearchInputValue] = useState('');
	const [activeSearch, setActiveSearch] = useState('');
	const [isSubmitted, setIsSubmitted] = useState(false);

	const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
	const [addName, setAddName] = useState('');
	const [addEnName, setAddEnName] = useState('');
	const [addImage, setAddImage] = useState('');

	const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
	const [editId, setEditId] = useState<number | null>(null);
	const [editName, setEditName] = useState('');
	const [editEnName, setEditEnName] = useState('');
	const [editImage, setEditImage] = useState('');

	const totalPages = Math.ceil(totalData / ITEMS_PER_PAGE);

	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams({
				offset: String(offset),
				limit: String(ITEMS_PER_PAGE),
			});
			if (activeSearch) params.set('search', activeSearch);
			const response = await fetch(`/api/routes/artists?${params.toString()}`, { cache: 'no-store' });
			const apidata = await response.json();
			setContributorList(apidata.data ?? []);
			setTotalData(apidata.total?.count ?? 0);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [offset, activeSearch]);

	useEffect(() => { fetchData(); }, [fetchData]);

	const handlePageChange = (_: any, page: number) => {
		setCurrentPage(page);
		setOffset((page - 1) * ITEMS_PER_PAGE);
	};

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setActiveSearch(searchInputValue.trim());
		setCurrentPage(1); setOffset(0); setIsSubmitted(true);
	};

	const handleSearchClear = (e: React.FormEvent) => {
		e.preventDefault();
		setSearchInputValue(''); setActiveSearch('');
		setIsSubmitted(false); setCurrentPage(1); setOffset(0);
	};

	const handleImageUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
		setter: (url: string) => void,
		logLabel: string,
	) => {
		try {
			const file = event.target.files?.[0];
			if (!file) return;
			const formData = new FormData();
			formData.append('files', file);
			formData.append('size', String(file.size));
			const response = await fetch(IMAGE_UPLOAD_URL, { method: 'POST', body: formData });
			createActivityLog({
				name: `${logLabel},ContributorsView.tsx`,
				action_type: 'create',
				payload: JSON.stringify({ fileName: file.name }),
				api_end_point: IMAGE_UPLOAD_URL,
			});
			const res = await response.json();
			setter(res.image_file_url);
		} catch (error) {
			console.error(error);
		}
	};

	const handleAddSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const data = { name: addName, en_name: addEnName, imageUrl: addImage };
			const response = await fetch('/api/routes/artists', { method: 'POST', body: JSON.stringify(data) });
			createActivityLog({
				name: 'handleAddContributor,ContributorsView.tsx',
				action_type: 'create',
				payload: JSON.stringify(data),
				api_end_point: '/api/routes/artists',
			});
			const apidata = await response.json();
			if (apidata.statusCode === 201) {
				setAddName(''); setAddEnName(''); setAddImage('');
				closeAdd(); fetchData();
			}
		} catch (error) { console.error(error); }
	};

	const handleEditOpen = (contributor: Contributor) => {
		setEditId(contributor.id);
		setEditName(contributor.name);
		setEditEnName(contributor.en_name);
		setEditImage(contributor.imageUrl);
		openEdit();
	};

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const data = { name: editName, en_name: editEnName, imageUrl: editImage };
			const response = await fetch(`/api/routes/artists/${editId}`, { method: 'POST', body: JSON.stringify(data) });
			createActivityLog({
				name: 'handleEditContributor,ContributorsView.tsx',
				action_type: 'update',
				payload: JSON.stringify({ id: editId, ...data }),
				api_end_point: `/api/routes/artists/${editId}`,
			});
			const apidata = await response.json();
			if (apidata.statusCode === 201) { closeEdit(); fetchData(); }
		} catch (error) { console.error(error); }
	};

	return (
		<>
			{loading ? (
				<Loader />
			) : (
				<PageContainer
					title="Contributors"
					items={[{ label: 'Contributors', href: '/dashboard/contributors' }]}
					subtitle={
						<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
							{totalData.toLocaleString()} contributor{totalData !== 1 ? 's' : ''}
							{activeSearch ? ` · "${activeSearch}"` : ''}
						</Typography>
					}
					actions={
						<Button variant="contained" onClick={openAdd} startIcon={<IconPlus size={16} />}>
							Add contributor
						</Button>
					}
				>
					<Stack spacing={3}>
						{/* Search bar */}
						<Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
							<form onSubmit={!isSubmitted ? handleSearchSubmit : handleSearchClear}>
								<Stack
									direction={{ xs: 'column', sm: 'row' }}
									alignItems={{ xs: 'stretch', sm: 'center' }}
									spacing={1}
								>
									<TextField
										size="small"
										sx={{ flex: 1, width: '100%' }}
										value={searchInputValue}
										onChange={e => setSearchInputValue(e.target.value)}
										placeholder="Search by name or English name…"
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
										fullWidth
										sx={{ width: { xs: '100%', sm: 'auto' } }}
										variant={isSubmitted ? 'outlined' : 'contained'}
										color={isSubmitted ? 'error' : 'primary'}
										startIcon={isSubmitted ? <IconX size={16} /> : <IconSearch size={16} />}
									>
										{isSubmitted ? 'Clear' : 'Search'}
									</Button>
								</Stack>
							</form>
						</Paper>

						{/* Card grid */}
						{contributorList.length === 0 ? (
							<Paper
								variant="outlined"
								sx={{ py: 10, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}
							>
								<Typography color="text.secondary">No contributors found.</Typography>
								<Button onClick={openAdd} variant="contained" sx={{ mt: 2 }} startIcon={<IconPlus size={16} />}>
									Add first contributor
								</Button>
							</Paper>
						) : (
							<Grid container spacing={2}>
								{contributorList.map(contributor => (
									<Grid item key={contributor.id} xs={6} sm={4} md={3} lg={2}>
										<Card
											variant="outlined"
											sx={{
												height: '100%',
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'center',
												borderRadius: 2,
												transition: 'box-shadow 0.2s',
												'&:hover': { boxShadow: 2 },
											}}
										>
											<Box sx={{ pt: 2.5, pb: 1 }}>
												<Avatar
													src={contributor.imageUrl}
													alt={contributor.name}
													sx={{
														width: 80,
														height: 80,
														borderRadius: 2,
														border: '2px solid',
														borderColor: 'divider',
													}}
												/>
											</Box>
											<CardContent sx={{ pt: 0.5, pb: 0, textAlign: 'center', width: '100%', px: 1.5 }}>
												<Typography variant="body2" fontWeight={600} noWrap title={contributor.name}>
													{contributor.name || '—'}
												</Typography>
												{contributor.en_name && (
													<Typography variant="caption" color="text.secondary" noWrap display="block" title={contributor.en_name}>
														{contributor.en_name}
													</Typography>
												)}
												<Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
													{moment(contributor.created_at).format('D MMM YYYY')}
												</Typography>
											</CardContent>
											<CardActions sx={{ pt: 1, pb: 1.5 }}>
												<Tooltip title="Edit contributor">
													<Button
														size="small"
														variant="outlined"
														startIcon={<IconEdit size={14} />}
														onClick={() => handleEditOpen(contributor)}
													>
														Edit
													</Button>
												</Tooltip>
											</CardActions>
										</Card>
									</Grid>
								))}
							</Grid>
						)}

						{/* Pagination */}
						{totalPages > 1 && (
							<Stack
								direction={{ xs: 'column', sm: 'row' }}
								justifyContent="space-between"
								alignItems="center"
								gap={1}
							>
								<Typography variant="body2" color="text.secondary" textAlign={{ xs: 'center', sm: 'left' }}>
									Showing {contributorList.length} of {totalData.toLocaleString()}
								</Typography>
								<Pagination
									page={currentPage}
									onChange={handlePageChange}
									count={totalPages}
									shape="rounded"
									color="primary"
									siblingCount={0}
									sx={{ '& .MuiPagination-ul': { justifyContent: 'center', flexWrap: 'wrap' } }}
								/>
							</Stack>
						)}
					</Stack>
				</PageContainer>
			)}

			{/* Add dialog */}
			<Dialog open={addOpened} onClose={closeAdd} maxWidth="xs" fullWidth fullScreen={isMobileSm}>
				<DialogTitle sx={{ fontWeight: 600 }}>Add Contributor</DialogTitle>
				<DialogContent dividers>
					<ContributorForm
						name={addName} setName={setAddName}
						enName={addEnName} setEnName={setAddEnName}
						image={addImage} setImage={setAddImage}
						onSubmit={handleAddSubmit}
						onImageUpload={e => handleImageUpload(e, setAddImage, 'handleAddImage')}
						submitLabel="Create"
					/>
				</DialogContent>
				<DialogActions sx={{ px: 3, py: 2 }}>
					<Button variant="outlined" color="inherit" onClick={closeAdd}>Cancel</Button>
					<Button variant="contained" onClick={handleAddSubmit as any}>Create</Button>
				</DialogActions>
			</Dialog>

			{/* Edit dialog */}
			<Dialog open={editOpened} onClose={closeEdit} maxWidth="xs" fullWidth fullScreen={isMobileSm}>
				<DialogTitle sx={{ fontWeight: 600 }}>Edit Contributor</DialogTitle>
				<DialogContent dividers>
					<ContributorForm
						name={editName} setName={setEditName}
						enName={editEnName} setEnName={setEditEnName}
						image={editImage} setImage={setEditImage}
						onSubmit={handleEditSubmit}
						onImageUpload={e => handleImageUpload(e, setEditImage, 'handleEditImage')}
						submitLabel="Update"
					/>
				</DialogContent>
				<DialogActions sx={{ px: 3, py: 2 }}>
					<Button variant="outlined" color="inherit" onClick={closeEdit}>Cancel</Button>
					<Button variant="contained" onClick={handleEditSubmit as any}>Update</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
