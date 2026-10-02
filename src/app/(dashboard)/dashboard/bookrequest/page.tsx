'use client';
import {
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
	Pagination,
	Paper,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import Loader from '@/components/Loader';
import { useDisclosure } from '@/hooks/use-disclosure';
import { IconBook, IconEye, IconLanguage, IconSearch, IconTag, IconUser, IconX } from '@tabler/icons-react';
import moment from 'moment';
import { useIsMobileSm } from '@/hooks/use-is-mobile-sm';
import { useEffect, useState, type ReactNode } from 'react';
import { cardShadow } from '@/styles/cardShadow';

const cardHoverSx = {
	borderRadius: 1,
	height: '100%',
	display: 'flex',
	flexDirection: 'column',
	boxShadow: cardShadow.rest,
	transition: 'box-shadow 0.2s ease, transform 0.2s ease',
	'&:hover': {
		boxShadow: cardShadow.hoverLift,
		transform: 'translateY(-1px)',
	},
};

type ChipTone = 'primary' | 'secondary';

function MetaBadge({
	tone,
	icon,
	label,
	ellipsis,
}: {
	tone: ChipTone;
	icon: ReactNode;
	label: string;
	ellipsis?: boolean;
}) {
	return (
		<Box
			component="span"
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 0.5,
				minHeight: 32,
				py: 0.5,
				px: 1.25,
				borderRadius: 999,
				fontWeight: 600,
				fontSize: '0.7rem',
				lineHeight: 1.45,
				verticalAlign: 'middle',
				bgcolor: (theme: Theme) => alpha(theme.palette[tone].main, 0.12),
				color: (theme: Theme) => theme.palette[tone].dark,
				border: (theme: Theme) => `1px solid ${alpha(theme.palette[tone].main, 0.22)}`,
				boxShadow: (theme: Theme) => `0 1px 2px ${alpha(theme.palette.common.black, 0.04)}`,
				maxWidth: ellipsis ? '100%' : undefined,
			}}
		>
			<Box
				component="span"
				sx={{
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					flexShrink: 0,
					color: `${tone}.main`,
					'& svg': { display: 'block' },
				}}
			>
				{icon}
			</Box>
			<Box
				component="span"
				sx={
					ellipsis
						? {
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
								minWidth: 0,
								lineHeight: 1.45,
							}
						: { lineHeight: 1.45 }
				}
			>
				{label}
			</Box>
		</Box>
	);
}

export default function BookRequest() {
	const isMobileSm = useIsMobileSm();
	const [bookRequestList, setBookRequestList] = useState<any[]>([]);
	const [totalData, setTotalData] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [offset, setOffset] = useState(0);
	const [limit] = useState(12);
	const [loading, setLoading] = useState(true);
	const [details, setDetails] = useState<any>(null);
	const [searchInput, setSearchInput] = useState('');
	const [activeSearch, setActiveSearch] = useState('');
	const [detailsModalOpened, { open: openDetailsModal, close: closeDetailsModal }] =
		useDisclosure(false);

	const isSearchActive = Boolean(activeSearch);
	const totalPage = Math.max(1, Math.ceil(totalData / limit));

	async function getData() {
		try {
			const params = new URLSearchParams({
				offset: String(offset),
				limit: String(limit),
			});
			if (activeSearch) params.set('search', activeSearch);
			const response = await fetch(`/api/routes/bookrequest?${params.toString()}`);
			const text = await response.text();
			const apidata = text ? JSON.parse(text) : { data: [], total: 0 };
			if (!response.ok) {
				setBookRequestList([]);
				setTotalData(0);
				return;
			}
			setBookRequestList(Array.isArray(apidata.data) ? apidata.data : []);
			setTotalData(apidata.total ?? 0);
		} catch (error) {
			console.error(error);
			setBookRequestList([]);
			setTotalData(0);
		} finally {
			setLoading(false);
		}
	}

	const handlePage = (_: React.ChangeEvent<unknown>, page: number) => {
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

	const openDetails = (element: any) => {
		setDetails(element);
		openDetailsModal();
	};

	return (
		<>
			{loading && bookRequestList.length === 0 ? (
				<Loader />
			) : (
				<PageContainer
					title="Book Request"
					items={[{ label: 'Book Request', href: '/dashboard/bookrequest' }]}
					subtitle={
						<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
							{isSearchActive
								? `${totalData} match${totalData === 1 ? '' : 'es'} for "${activeSearch}"`
								: `${totalData} request${totalData === 1 ? '' : 's'}`}
						</Typography>
					}
				>
					<Stack spacing={3}>
						<Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
							<form onSubmit={!isSearchActive ? handleSearchSubmit : handleSearchClear}>
								<Stack
									direction={{ xs: 'column', sm: 'row' }}
									alignItems={{ xs: 'stretch', sm: 'center' }}
									spacing={1}
								>
									<TextField
										size="small"
										sx={{ flex: 1, width: '100%' }}
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										placeholder="Search by requester, book, writer, language, or category…"
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
										variant={isSearchActive ? 'outlined' : 'contained'}
										color={isSearchActive ? 'error' : 'primary'}
										startIcon={isSearchActive ? <IconX size={16} /> : <IconSearch size={16} />}
									>
										{isSearchActive ? 'Clear' : 'Search'}
									</Button>
								</Stack>
							</form>
						</Paper>

						{bookRequestList.length === 0 ? (
							<Paper
								variant="outlined"
								sx={{ py: 10, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}
							>
								<Typography color="text.secondary">
									{isSearchActive ? 'No requests match your search.' : 'No book requests found.'}
								</Typography>
								{isSearchActive && (
									<Button
										variant="outlined"
										sx={{ mt: 2 }}
										onClick={() => {
											setSearchInput('');
											setActiveSearch('');
											setOffset(0);
											setCurrentPage(1);
											setLoading(true);
										}}
									>
										Clear search
									</Button>
								)}
							</Paper>
						) : (
							<Grid container spacing={2}>
								{bookRequestList.map((element: any) => (
									<Grid item key={element.id} xs={12} sm={6} md={4}>
										<Card variant="outlined" sx={cardHoverSx}>
											<CardContent sx={{ flex: 1, pb: 1 }}>
												<Stack direction="row" spacing={1.5} alignItems="flex-start">
													<Box
														sx={{
															width: 48,
															height: 48,
															borderRadius: 1.5,
															bgcolor: 'primary.50',
															color: 'primary.main',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															flexShrink: 0,
														}}
													>
														<IconBook size={24} stroke={1.5} />
													</Box>
													<Box sx={{ minWidth: 0, flex: 1 }}>
														<Typography variant="caption" color="text.disabled" fontFamily="monospace">
															#{element.id}
														</Typography>
														<Typography
															variant="subtitle2"
															fontWeight={600}
															sx={{
																display: '-webkit-box',
																WebkitLineClamp: 2,
																WebkitBoxOrient: 'vertical',
																overflow: 'hidden',
															}}
															title={element.bookname}
														>
															{element.bookname || 'Untitled book'}
														</Typography>
														<Typography variant="caption" color="text.secondary" noWrap display="block">
															{element.writer || 'Writer not specified'}
														</Typography>
													</Box>
												</Stack>

												<Stack direction="row" flexWrap="wrap" alignItems="center" gap={0.75} mt={1.5}>
													{element.language ? (
														<MetaBadge
															tone="primary"
															icon={<IconLanguage size={14} stroke={1.75} />}
															label={element.language}
														/>
													) : null}
													{element.category ? (
														<MetaBadge
															tone="secondary"
															icon={<IconTag size={14} stroke={1.75} />}
															label={element.category}
															ellipsis
														/>
													) : null}
												</Stack>

												<Stack direction="row" alignItems="center" spacing={0.5} mt={1.5} color="text.secondary">
													<IconUser size={14} stroke={1.5} />
													<Typography variant="body2" color="text.secondary" noWrap>
														{element.name || 'Unknown requester'}
													</Typography>
												</Stack>

												<Typography variant="caption" color="text.disabled" display="block" mt={1}>
													{element.created_at
														? moment(element.created_at).format('D MMM YYYY · h:mm a')
														: '—'}
												</Typography>
											</CardContent>
											<CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'flex-end' }}>
												<Button
													size="small"
													variant="outlined"
													startIcon={<IconEye size={14} />}
													onClick={() => openDetails(element)}
												>
													Details
												</Button>
											</CardActions>
										</Card>
									</Grid>
								))}
							</Grid>
						)}

						{totalPage > 1 ? (
							<Stack
								direction={{ xs: 'column', sm: 'row' }}
								justifyContent="space-between"
								alignItems="center"
								gap={1}
							>
								<Typography variant="body2" color="text.secondary">
									Page {currentPage} of {totalPage}
								</Typography>
								<Pagination
									page={currentPage}
									count={totalPage}
									onChange={handlePage}
									color="primary"
									shape="rounded"
									size="small"
								/>
							</Stack>
						) : null}
					</Stack>

					<Dialog
						open={detailsModalOpened}
						onClose={closeDetailsModal}
						maxWidth="sm"
						fullWidth
						fullScreen={isMobileSm}
					>
						<DialogTitle sx={{ fontWeight: 600 }}>Request details</DialogTitle>
						<DialogContent dividers>
							<Stack spacing={2} sx={{ pt: 0.5 }}>
								<Box>
									<Typography variant="overline" color="text.secondary">Requester</Typography>
									<Typography variant="body2">{details?.name || 'N/A'}</Typography>
								</Box>
								<Box>
									<Typography variant="overline" color="text.secondary">Book</Typography>
									<Typography variant="body2">{details?.bookname || 'N/A'}</Typography>
								</Box>
								<Box>
									<Typography variant="overline" color="text.secondary">Writer</Typography>
									<Typography variant="body2">{details?.writer || 'N/A'}</Typography>
								</Box>
								<Box>
									<Typography variant="overline" color="text.secondary">Language</Typography>
									<Typography variant="body2">{details?.language || 'N/A'}</Typography>
								</Box>
								<Box>
									<Typography variant="overline" color="text.secondary">Category</Typography>
									<Typography variant="body2">{details?.category || 'N/A'}</Typography>
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
							<Button variant="outlined" color="inherit" onClick={closeDetailsModal}>
								Close
							</Button>
						</DialogActions>
					</Dialog>
				</PageContainer>
			)}
		</>
	);
}
