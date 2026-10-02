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
	Switch,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { CatalogMediaCard } from '@/components/mantis/CatalogMediaCard';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import Loader from '@/components/Loader';
import { createActivityLog } from '@/helper/Commonfunction';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useIsMobileSm } from '@/hooks/use-is-mobile-sm';
import { transition } from '@/styles/motion';
import { IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';

export default function FeaturedBook() {
	const isMobileSm = useIsMobileSm();
	const [featureList, setFeatureList] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [audioBookId, setAudioBookId] = useState('');
	const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
	const [searchInput, setSearchInput] = useState('');
	const [activeSearch, setActiveSearch] = useState('');
	const [addFeaturedImage, { open: openAddFeaturedImage, close: closeAddFeaturedImage }] =
		useDisclosure(false);

	const filteredList = useMemo(() => {
		const q = activeSearch.trim().toLowerCase();
		if (!q) return featureList;
		return featureList.filter((item: any) => {
			const name = String(item.name ?? '').toLowerCase();
			const author = String(item.author_name ?? '').toLowerCase();
			const id = String(item.audiobook_id ?? '');
			return name.includes(q) || author.includes(q) || id.includes(q);
		});
	}, [featureList, activeSearch]);

	const handleToggle = async (item: { audiobook_id: number; status: number }) => {
		const newStatus = item.status === 1 ? 0 : 1;
		try {
			const data = { audiobook_id: item.audiobook_id, status: newStatus };
			await fetch(`/api/routes/toggle-feature-image`, {
				method: 'POST',
				body: JSON.stringify(data),
			});
			createActivityLog({
				name: 'handleToggle,featured/page.tsx',
				action_type: 'update',
				payload: JSON.stringify(data),
				api_end_point: `/api/routes/toggle-feature-image`,
			});
			getData();
		} catch {
			/* ignore */
		}
	};

	async function getData() {
		try {
			const response = await fetch(`/api/routes/featured-image`);
			const apidata = await response.json();
			setLoading(false);
			setFeatureList(Array.isArray(apidata) ? apidata : []);
		} catch {
			setLoading(false);
		}
	}

	const handleAddFeaturedImage = async (event: React.FormEvent) => {
		event.preventDefault();
		try {
			const data = { audiobook_id: audioBookId };
			const response = await fetch(`/api/routes/featured-image`, {
				method: 'POST',
				body: JSON.stringify(data),
			});
			createActivityLog({
				name: 'handleAddFeaturedImage,featured/page.tsx',
				action_type: 'create',
				payload: JSON.stringify(data),
				api_end_point: '/api/routes/featured-image',
			});
			const apidata = await response.json();
			if (apidata.statusCode === 201) {
				setAudioBookId('');
				getData();
				closeAddFeaturedImage();
			}
		} catch {
			/* ignore */
		}
	};

	const closeAddModal = () => {
		setAudioBookId('');
		closeAddFeaturedImage();
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

	const isSearchActive = Boolean(activeSearch);

	return (
		<>
			{loading ? (
				<Loader />
			) : (
				<PageContainer
					title="Featured Books"
					items={[{ label: 'Featured', href: '/dashboard/featured' }]}
					subtitle={
						<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
							{isSearchActive
								? `${filteredList.length} of ${featureList.length} match "${activeSearch}"`
								: `${featureList.length} featured title${featureList.length === 1 ? '' : 's'}`}
							{' · '}home category highlights
						</Typography>
					}
					actions={
						<Button onClick={openAddFeaturedImage} variant="contained" startIcon={<IconPlus size={16} />}>
							Add featured
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
										placeholder="Search by title, author, or audiobook ID…"
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

						{featureList.length === 0 ? (
							<Paper
								variant="outlined"
								sx={{ py: 10, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}
							>
								<Typography color="text.secondary">No featured books found.</Typography>
								<Button onClick={openAddFeaturedImage} variant="contained" sx={{ mt: 2 }} startIcon={<IconPlus size={16} />}>
									Add first featured book
								</Button>
							</Paper>
						) : filteredList.length === 0 ? (
							<Paper
								variant="outlined"
								sx={{ py: 8, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}
							>
								<Typography color="text.secondary">No featured books match your search.</Typography>
								<Button
									variant="outlined"
									sx={{ mt: 2 }}
									onClick={() => {
										setSearchInput('');
										setActiveSearch('');
									}}
								>
									Clear search
								</Button>
							</Paper>
						) : (
							<Grid container spacing={3}>
								{filteredList.map((element: any) => (
									<Grid item key={element.audiobook_id ?? element.id} xs={12} sm={6} md={4} lg={3}>
										<CatalogMediaCard
											imageSrc={element.thumb_path}
											imageAlt={element.name}
											imageHeight={200}
											imageFit="cover"
											inactive={element.status !== 1}
											onImageClick={() =>
												setPreviewImage({ url: element.thumb_path, title: element.name })
											}
											topBadge={
												<Chip
													label={element.status === 1 ? 'Featured' : 'Hidden'}
													size="small"
													color={element.status === 1 ? 'success' : 'default'}
													sx={{ fontWeight: 700, fontSize: '0.65rem' }}
												/>
											}
											actions={
												<Tooltip title={element.status === 1 ? 'Remove from featured' : 'Show as featured'}>
													<Switch
														size="small"
														checked={element.status === 1}
														onChange={() => handleToggle(element)}
													/>
												</Tooltip>
											}
											actionsSx={{ px: 2 }}
										>
											<Typography variant="body2" fontWeight={600} noWrap title={element.name}>
												{element.name}
											</Typography>
											<Typography variant="caption" color="text.secondary" noWrap display="block">
												{element.author_name || '—'}
											</Typography>
											<Stack direction="row" justifyContent="space-between" mt={1}>
												<Typography variant="caption" color="text.disabled" fontFamily="monospace">
													#{element.audiobook_id}
												</Typography>
												<Typography variant="caption" color="text.disabled">
													{moment(element.created_at).format('D MMM YYYY')}
												</Typography>
											</Stack>
										</CatalogMediaCard>
									</Grid>
								))}
							</Grid>
						)}
					</Stack>

					<Dialog open={addFeaturedImage} onClose={closeAddModal} maxWidth="xs" fullWidth fullScreen={isMobileSm}>
						<DialogTitle sx={{ fontWeight: 600 }}>Add featured book</DialogTitle>
						<DialogContent dividers>
							<Stack
								component="form"
								id="featured-add-form"
								spacing={2}
								onSubmit={handleAddFeaturedImage}
								sx={{ pt: 0.5 }}
							>
								<TextField
									label="Audiobook ID"
									value={audioBookId}
									onChange={e => setAudioBookId(e.target.value)}
									required
									fullWidth
									size="small"
									placeholder="Enter audiobook ID"
									type="number"
								/>
							</Stack>
						</DialogContent>
						<DialogActions sx={{ px: 3, py: 2 }}>
							<Button variant="outlined" color="inherit" onClick={closeAddModal}>Cancel</Button>
							<Button type="submit" form="featured-add-form" variant="contained">Create</Button>
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
