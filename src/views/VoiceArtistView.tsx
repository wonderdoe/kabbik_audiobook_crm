'use client';

import {
	Avatar,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	InputAdornment,
	Pagination,
	Stack,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
	Typography,
	alpha,
	useTheme,
} from '@mui/material';
import { MainCard } from '@/components/mantis/MainCard';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { StatCard } from '@/components/ui/StatCard';
import Loader from '@/components/Loader';
import { createActivityLog } from '@/helper/Commonfunction';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useCustomTable } from '@/hooks/use-custom-table';
import {
	IconEdit,
	IconGridDots,
	IconMicrophone,
	IconPlus,
	IconSearch,
	IconTable,
	IconX,
} from '@tabler/icons-react';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';

type VoiceArtist = {
	id: number;
	name: string;
	en_name: string;
	imageUrl: string;
	created_at: string;
};

const IMAGE_UPLOAD_URL = 'https://api.kabbik.com/v3/audiobooks/upload-image-in-stack';
const ITEMS_PER_PAGE = 12;

function ArtistForm({
	name,
	setName,
	enName,
	setEnName,
	image,
	setImage,
	onImageUpload,
}: {
	name: string;
	setName: (v: string) => void;
	enName: string;
	setEnName: (v: string) => void;
	image: string;
	setImage: (v: string) => void;
	onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	return (
		<Stack spacing={2} sx={{ pt: 0.5 }}>
			<TextField
				label="Bangla name"
				value={name}
				onChange={e => setName(e.target.value)}
				required
				fullWidth
				size="small"
			/>
			<TextField
				label="English name"
				value={enName}
				onChange={e => setEnName(e.target.value)}
				fullWidth
				size="small"
			/>
			<Box>
				<Typography variant="subtitle2" fontWeight={600} mb={1}>Profile photo</Typography>
				<Stack direction="row" spacing={2} alignItems="center">
					<Button variant="outlined" component="label" size="small">
						Upload
						<input type="file" hidden accept="image/*" onChange={onImageUpload} />
					</Button>
					{image ? (
						<Avatar
							src={image}
							alt={name}
							sx={{ width: 72, height: 72, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
						/>
					) : (
						<Typography variant="caption" color="text.secondary">No image</Typography>
					)}
				</Stack>
			</Box>
		</Stack>
	);
}

export default function VoiceArtistView() {
	const theme = useTheme();
	const [artists, setArtists] = useState<VoiceArtist[]>([]);
	const [totalData, setTotalData] = useState(0);
	const [offset, setOffset] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [loading, setLoading] = useState(true);
	const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

	const [searchInput, setSearchInput] = useState('');
	const [activeSearch, setActiveSearch] = useState('');
	const [searchActive, setSearchActive] = useState(false);

	const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
	const [addName, setAddName] = useState('');
	const [addEnName, setAddEnName] = useState('');
	const [addImage, setAddImage] = useState('');

	const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
	const [editId, setEditId] = useState<number | null>(null);
	const [editName, setEditName] = useState('');
	const [editEnName, setEditEnName] = useState('');
	const [editImage, setEditImage] = useState('');

	const totalPages = Math.max(1, Math.ceil(totalData / ITEMS_PER_PAGE));

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
			setArtists(apidata.data ?? []);
			setTotalData(apidata.total?.count ?? 0);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [offset, activeSearch]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

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
				name: `${logLabel},VoiceArtistView.tsx`,
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

	const handleAddSubmit = async () => {
		try {
			const data = { name: addName, en_name: addEnName, imageUrl: addImage };
			const response = await fetch('/api/routes/artists', { method: 'POST', body: JSON.stringify(data) });
			createActivityLog({
				name: 'handleAddVoiceArtist,VoiceArtistView.tsx',
				action_type: 'create',
				payload: JSON.stringify(data),
				api_end_point: '/api/routes/artists',
			});
			const apidata = await response.json();
			if (apidata.statusCode === 201) {
				setAddName('');
				setAddEnName('');
				setAddImage('');
				closeAdd();
				fetchData();
			}
		} catch (error) {
			console.error(error);
		}
	};

	const handleEditOpen = (artist: VoiceArtist) => {
		setEditId(artist.id);
		setEditName(artist.name);
		setEditEnName(artist.en_name);
		setEditImage(artist.imageUrl);
		openEdit();
	};

	const handleEditSubmit = async () => {
		try {
			const data = { name: editName, en_name: editEnName, imageUrl: editImage };
			const response = await fetch(`/api/routes/artists/${editId}`, {
				method: 'POST',
				body: JSON.stringify(data),
			});
			createActivityLog({
				name: 'handleEditVoiceArtist,VoiceArtistView.tsx',
				action_type: 'update',
				payload: JSON.stringify({ id: editId, ...data }),
				api_end_point: `/api/routes/artists/${editId}`,
			});
			const apidata = await response.json();
			if (apidata.statusCode === 201) {
				closeEdit();
				fetchData();
			}
		} catch (error) {
			console.error(error);
		}
	};

	const columns = useMemo<MRT_ColumnDef<VoiceArtist>[]>(
		() => [
			{
				accessorKey: 'imageUrl',
				header: 'Photo',
				size: 80,
				Cell: ({ row }) => (
					<Avatar
						src={row.original.imageUrl}
						alt={row.original.name}
						variant="rounded"
						sx={{ width: 48, height: 48 }}
					/>
				),
			},
			{ accessorKey: 'name', header: 'Bangla name' },
			{ accessorKey: 'en_name', header: 'English name' },
			{
				accessorKey: 'created_at',
				header: 'Added',
				Cell: ({ cell }) => moment(cell.getValue<string>()).format('D MMM YYYY'),
			},
		],
		[],
	);

	const table = useCustomTable<VoiceArtist & Record<string, unknown>>({
		columns,
		data: artists as (VoiceArtist & Record<string, unknown>)[],
		enableRowActions: true,
		renderRowActions: ({ row }) => (
			<Button size="small" variant="outlined" startIcon={<IconEdit size={14} />} onClick={() => handleEditOpen(row.original)}>
				Edit
			</Button>
		),
	});

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchActive) {
			setSearchInput('');
			setActiveSearch('');
			setSearchActive(false);
			setCurrentPage(1);
			setOffset(0);
			return;
		}
		setActiveSearch(searchInput.trim());
		setSearchActive(Boolean(searchInput.trim()));
		setCurrentPage(1);
		setOffset(0);
	};

	if (loading && artists.length === 0) {
		return <Loader />;
	}

	return (
		<>
			<PageContainer
				title="Voice Artist"
				items={[{ label: 'Voice Artist', href: '/dashboard/voiceartist' }]}
				subtitle={
					<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
						Voice talent for narration and audiobook production
					</Typography>
				}
				actions={
					<Button variant="contained" onClick={openAdd} startIcon={<IconPlus size={18} />}>
						Add voice artist
					</Button>
				}
			>
				<Stack spacing={2.5}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6} md={4}>
							<StatCard
								title="Total artists"
								value={totalData.toLocaleString()}
								color="secondary"
								icon={<IconMicrophone size={22} />}
								loading={loading}
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={4}>
							<StatCard
								title="On this page"
								value={artists.length}
								color="primary"
								icon={<IconGridDots size={22} />}
								loading={loading}
							/>
						</Grid>
					</Grid>

					<MainCard
						title="Directory"
						secondary={
							<ToggleButtonGroup
								size="small"
								exclusive
								value={viewMode}
								onChange={(_, v) => v && setViewMode(v)}
							>
								<ToggleButton value="grid" aria-label="Grid view">
									<IconGridDots size={16} />
								</ToggleButton>
								<ToggleButton value="table" aria-label="Table view">
									<IconTable size={16} />
								</ToggleButton>
							</ToggleButtonGroup>
						}
					>
						<form onSubmit={handleSearchSubmit}>
							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} sx={{ mb: 2.5 }}>
								<TextField
									size="small"
									fullWidth
									value={searchInput}
									onChange={e => setSearchInput(e.target.value)}
									placeholder="Search by Bangla or English name…"
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
									variant={searchActive ? 'outlined' : 'contained'}
									color={searchActive ? 'inherit' : 'primary'}
									startIcon={searchActive ? <IconX size={16} /> : <IconSearch size={16} />}
									sx={{ flexShrink: 0 }}
								>
									{searchActive ? 'Clear' : 'Search'}
								</Button>
							</Stack>
						</form>

						{loading ? (
							<Box py={6} display="flex" justifyContent="center">
								<Loader />
							</Box>
						) : artists.length === 0 ? (
							<Box
								sx={{
									py: 8,
									textAlign: 'center',
									borderRadius: 2,
									border: '1px dashed',
									borderColor: 'divider',
									bgcolor: alpha(theme.palette.primary.main, 0.02),
								}}
							>
								<IconMicrophone size={40} stroke={1.25} style={{ opacity: 0.35 }} />
								<Typography color="text.secondary" sx={{ mt: 1.5 }}>
									No voice artists found
									{activeSearch ? ` for “${activeSearch}”` : ''}.
								</Typography>
								<Button variant="contained" sx={{ mt: 2 }} startIcon={<IconPlus size={16} />} onClick={openAdd}>
									Add voice artist
								</Button>
							</Box>
						) : viewMode === 'table' ? (
							<MaterialReactTable table={table} />
						) : (
							<Grid container spacing={2}>
								{artists.map(artist => (
									<Grid item key={artist.id} xs={12} sm={6} md={4} lg={3}>
										<Card
											variant="outlined"
											sx={{
												height: '100%',
												borderRadius: 2,
												overflow: 'hidden',
												transition: 'box-shadow 0.2s, transform 0.2s',
												'&:hover': {
													boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.12)}`,
													transform: 'translateY(-2px)',
												},
											}}
										>
											<Box
												sx={{
													height: 6,
													background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
												}}
											/>
											<CardContent sx={{ textAlign: 'center', pt: 2.5 }}>
												<Box sx={{ position: 'relative', display: 'inline-block' }}>
													<Avatar
														src={artist.imageUrl}
														alt={artist.name}
														sx={{
															width: 88,
															height: 88,
															mx: 'auto',
															borderRadius: 2,
															border: '2px solid',
															borderColor: 'divider',
														}}
													/>
													<Chip
														icon={<IconMicrophone size={12} />}
														label="Voice"
														size="small"
														color="secondary"
														variant="outlined"
														sx={{
															position: 'absolute',
															bottom: -8,
															right: -8,
															bgcolor: 'background.paper',
														}}
													/>
												</Box>
												<Typography variant="subtitle1" fontWeight={700} mt={2} noWrap title={artist.name}>
													{artist.name || '—'}
												</Typography>
												<Typography variant="body2" color="text.secondary" noWrap title={artist.en_name}>
													{artist.en_name || '—'}
												</Typography>
												<Typography variant="caption" color="text.disabled" display="block" mt={1}>
													Added {moment(artist.created_at).format('D MMM YYYY')}
												</Typography>
											</CardContent>
											<CardActions sx={{ justifyContent: 'center', pb: 2 }}>
												<Tooltip title="Edit artist">
													<Button
														size="small"
														variant="outlined"
														startIcon={<IconEdit size={14} />}
														onClick={() => handleEditOpen(artist)}
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

						{totalPages > 1 && (
							<Stack
								direction={{ xs: 'column', sm: 'row' }}
								justifyContent="space-between"
								alignItems="center"
								spacing={1}
								sx={{ mt: 3 }}
							>
								<Typography variant="body2" color="text.secondary">
									Page {currentPage} of {totalPages} · {totalData.toLocaleString()} total
								</Typography>
								<Pagination
									page={currentPage}
									count={totalPages}
									onChange={(_, page) => {
										setCurrentPage(page);
										setOffset((page - 1) * ITEMS_PER_PAGE);
									}}
									shape="rounded"
									color="primary"
								/>
							</Stack>
						)}
					</MainCard>
				</Stack>
			</PageContainer>

			<Dialog open={addOpened} onClose={closeAdd} maxWidth="xs" fullWidth>
				<DialogTitle sx={{ fontWeight: 700 }}>Add voice artist</DialogTitle>
				<DialogContent dividers>
					<ArtistForm
						name={addName}
						setName={setAddName}
						enName={addEnName}
						setEnName={setAddEnName}
						image={addImage}
						setImage={setAddImage}
						onImageUpload={e => handleImageUpload(e, setAddImage, 'handleAddImage')}
					/>
				</DialogContent>
				<DialogActions sx={{ px: 3, py: 2 }}>
					<Button variant="outlined" color="inherit" onClick={closeAdd}>Cancel</Button>
					<Button variant="contained" onClick={handleAddSubmit} disabled={!addName.trim()}>
						Create
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={editOpened} onClose={closeEdit} maxWidth="xs" fullWidth>
				<DialogTitle sx={{ fontWeight: 700 }}>Edit voice artist</DialogTitle>
				<DialogContent dividers>
					<ArtistForm
						name={editName}
						setName={setEditName}
						enName={editEnName}
						setEnName={setEditEnName}
						image={editImage}
						setImage={setEditImage}
						onImageUpload={e => handleImageUpload(e, setEditImage, 'handleEditImage')}
					/>
				</DialogContent>
				<DialogActions sx={{ px: 3, py: 2 }}>
					<Button variant="outlined" color="inherit" onClick={closeEdit}>Cancel</Button>
					<Button variant="contained" onClick={handleEditSubmit} disabled={!editName.trim()}>
						Save changes
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
