'use client';
import {
	Box,
	Button,
	Chip,
	Collapse,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	Grid,
	IconButton,
	InputAdornment,
	InputLabel,
	MenuItem,
	Pagination,
	Paper,
	Stack,
	Switch,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tabs,
	TextField,
	Tooltip,
	Typography,
	alpha,
	type Theme,
} from '@mui/material';
import { DataSelect } from '@/components/Form/DataSelect';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useIsMobileSm } from '@/hooks/use-is-mobile-sm';
import {
	IconBan,
	IconCheck,
	IconCheckbox,
	IconCopy,
	IconEdit,
	IconEye,
	IconChevronDown,
	IconChevronUp,
	IconDownload,
	IconFilter,
	IconHeadphones,
	IconList,
	IconPlus,
	IconSearch,
	IconTrash,
	IconX,
} from '@tabler/icons-react';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import '../globals.css';

import Swal from 'sweetalert2';
import { AudiobookEditForm } from '@/components/Form/AudiobookEditForm';
import { AudiobookUploadForm } from '@/components/Form/AudiobookUploadForm';
import { EpisodesEditForm } from '@/components/Form/EpisodesEditForm';
import Loader from '@/components/Loader';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import {
	deleteAudiobook,
	getArtistList,
	getAudiobookCategories,
	getAuthorList,
	getEpisodes,
	getPublisherList,
	updateApproveAudiobook,
} from '@/services/services';
import { Artist, AudiobookCategory, Author, Episode, Publisher } from '@/types/global';
import { formatCompactNumber } from '@/utils/formatCompactNumber';
import { createToast, createToast2 } from 'helpers/SweetAlert';
import { createActivityLog } from '@/helper/Commonfunction';

type Row = {
	id: number;
	name: string;
	en_name: string;
	price: string;
	banner_path: string;
	author_name: string;
};

const initialMenuData: Row[] = [];

type AudiobookFilterState = {
	category: string;
	premium: string;
	for_rent: string;
	has_bgm: string;
	approval_status: string;
	author: string;
	price_min: string;
	price_max: string;
	date_from: Date | null;
	date_to: Date | null;
};

const emptyFilters: AudiobookFilterState = {
	category: '',
	premium: '',
	for_rent: '',
	has_bgm: '',
	approval_status: '',
	author: '',
	price_min: '',
	price_max: '',
	date_from: null,
	date_to: null,
};

const yesNoSelectData = [
	{ value: '1', label: 'Yes' },
	{ value: '0', label: 'No' },
];

const bgmFilterSelectData = [
	{ value: '1', label: 'Has BGM' },
	{ value: '0', label: 'No BGM' },
];

const approvalStatusFilterData = [
	{ value: '0', label: 'Pending' },
	{ value: '1', label: 'Approved' },
	{ value: '2', label: 'Rejected' },
];

const TAB_LABELS: Record<string, string> = {
	all: 'All',
	podcasts: 'Podcast',
	rent: 'Rent',
	pending: 'Pending',
	rejected: 'Rejected',
};

const actionBtnSx = {
	py: 0.25,
	px: 0.75,
	fontSize: '0.7rem',
	width: '100%',
	minWidth: 0,
	whiteSpace: 'nowrap',
	'& .MuiButton-startIcon': { mr: 0.25 },
};

/** Single horizontal scroll host for catalog table (avoid nested overflow scrollbars). */
function catalogTableScrollSx(theme: Theme) {
	const thumb = alpha(theme.palette.primary.main, 0.45);
	const track = alpha(theme.palette.primary.main, 0.08);
	return {
		width: '100%',
		maxWidth: '100%',
		overflowX: 'auto',
		overflowY: 'hidden',
		WebkitOverflowScrolling: 'touch',
		scrollbarWidth: 'thin',
		scrollbarColor: `${thumb} ${track}`,
		'&::-webkit-scrollbar': { height: 8 },
		'&::-webkit-scrollbar-track': {
			bgcolor: track,
			borderRadius: 4,
			margin: '0 4px',
		},
		'&::-webkit-scrollbar-thumb': {
			bgcolor: thumb,
			borderRadius: 4,
			'&:hover': { bgcolor: theme.palette.primary.main },
		},
	};
}

function countActiveFilters(filters: AudiobookFilterState) {
	let count = 0;
	if (filters.category) count += 1;
	if (filters.premium) count += 1;
	if (filters.for_rent) count += 1;
	if (filters.has_bgm) count += 1;
	if (filters.approval_status) count += 1;
	if (filters.author) count += 1;
	if (filters.price_min) count += 1;
	if (filters.price_max) count += 1;
	if (filters.date_from || filters.date_to) count += 1;
	return count;
}

function approvalStatusMeta(status: number) {
	if (status === 1) return { label: 'Approved', color: 'success' as const };
	if (status === 2) return { label: 'Rejected', color: 'error' as const };
	return { label: 'Pending', color: 'warning' as const };
}

function AudiobookListenCount({
	playCount,
	myblPlayCount,
}: {
	playCount: unknown;
	myblPlayCount: unknown;
}) {
	const kabbik = Number(playCount) || 0;
	const bl = Number(myblPlayCount) || 0;

	return (
		<Tooltip
			title={`Kabbik: ${kabbik.toLocaleString()} · MyBL: ${bl.toLocaleString()}`}
			arrow
			placement="top"
		>
			<Stack spacing={0.5} alignItems="center" sx={{ minWidth: 76 }}>
				<Stack
					direction="row"
					alignItems="center"
					justifyContent="center"
					spacing={0.5}
					sx={{
						px: 1,
						py: 0.4,
						borderRadius: 2,
						bgcolor: theme => alpha(theme.palette.success.main, 0.1),
						border: 1,
						borderColor: theme => alpha(theme.palette.success.main, 0.28),
					}}
				>
					<Box component="span" sx={{ color: 'success.dark', display: 'flex', lineHeight: 0 }}>
						<IconHeadphones size={14} stroke={1.75} />
					</Box>
					<Typography variant="caption" fontWeight={700} color="success.dark" lineHeight={1.2}>
						{formatCompactNumber(kabbik)}
					</Typography>
				</Stack>
				{bl > 0 ? (
					<Chip
						label={`BL ${formatCompactNumber(bl)}`}
						size="small"
						variant="outlined"
						color="warning"
						sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, '& .MuiChip-label': { px: 0.75 } }}
					/>
				) : null}
			</Stack>
		</Tooltip>
	);
}

function buildAudiobookQueryParams(
	limit: number,
	offset: number,
	filters: AudiobookFilterState,
	search: string,
) {
	const params = new URLSearchParams();
	params.set('limit', String(limit));
	params.set('offset', String(offset));
	if (filters.category) params.set('category', filters.category);
	if (filters.premium) params.set('premium', filters.premium);
	if (filters.for_rent) params.set('for_rent', filters.for_rent);
	if (filters.has_bgm) params.set('has_bgm', filters.has_bgm);
	if (filters.approval_status) params.set('approval_status', filters.approval_status);
	if (filters.author) params.set('author', filters.author);
	if (filters.price_min) params.set('price_min', filters.price_min);
	if (filters.price_max) params.set('price_max', filters.price_max);
	if (filters.date_from) params.set('date_from', moment(filters.date_from).format('YYYY-MM-DD'));
	if (filters.date_to) params.set('date_to', moment(filters.date_to).format('YYYY-MM-DD'));
	if (search.trim()) params.set('search', search.trim());
	return params.toString();
}

function listEndpointForTab(tab: string | null) {
	switch (tab) {
		case 'podcasts':
			return '/api/routes/podcast-audio';
		case 'rent':
			return '/api/routes/rent-audiobooks';
		case 'pending':
			return '/api/routes/pending-audiobooks';
		case 'rejected':
			return '/api/routes/rejected-audiobooks';
		default:
			return '/api/routes/audiobook';
	}
}

function formatEpisodeDuration(seconds: number) {
	if (!seconds || seconds <= 0) return '—';
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${s.toString().padStart(2, '0')}`;
}

function PathCopyCell({ value }: { value: string }) {
	const [copied, setCopied] = useState(false);
	const copy = () => {
		navigator.clipboard.writeText(value).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1800);
		});
	};
	return (
		<Stack direction="row" alignItems="center" spacing={0.5}>
			<Typography
				variant="caption"
				fontFamily="monospace"
				sx={{
					maxWidth: 160,
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
					display: 'block',
					border: '1px solid',
					borderColor: 'divider',
					borderRadius: 0.5,
					px: 0.75,
					py: 0.25,
					bgcolor: 'grey.50',
				}}
				title={value}
			>
				{value}
			</Typography>
			<Tooltip title={copied ? 'Copied!' : 'Copy path'}>
				<IconButton size="small" onClick={copy} color={copied ? 'success' : 'default'}>
					{copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
				</IconButton>
			</Tooltip>
		</Stack>
	);
}

export default function AudiobookViews({ cookie }: any) {
	const token = cookie?.value;
	const isMobileSm = useIsMobileSm();

	const [addAudiobookOpened, { open: openAddAudiobook, close: closeAddAudiobook }] =
		useDisclosure(false);
	const [assignOpened, { open: openAssign, close: closeAssign }] = useDisclosure(false);
	const [editAudiobookOpened, { open: openEditAudiobook, close: closeEditAudiobook }] =
		useDisclosure(false);
	const [viewAudiobookOpened, { open: openViewAudiobook, close: closeViewAudiobook }] =
		useDisclosure(false);

	const [menuData, setMenuData] = useState<Row[]>(initialMenuData);
	const [audiobookDetails, setAudiobookdetails] = useState<any>(null);

	const [loading, setLoading] = useState(true);
	const [exporting, setExporting] = useState(false);
	const [episodes, setEpisodes] = useState<any>([]);

	const [totalData, setTotalData] = useState(0);

	const [currentPage, setCurrentPage] = useState(1);

	const itemsPerPage = 10;
	const [offset, setOffset] = useState(0);
	const [activeTab, setActiveTab] = useState<string | null>('all');
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [searchInputValue, setSearchInputValue] = useState('');
	const [activeSearch, setActiveSearch] = useState('');
	const [filterDraft, setFilterDraft] = useState<AudiobookFilterState>(emptyFilters);
	const [appliedFilters, setAppliedFilters] = useState<AudiobookFilterState>(emptyFilters);
	const [filtersOpen, setFiltersOpen] = useState(false);

	const [selectionList, setSelectionList] = useState({
		authorList: [],
		publisherList: [],
		artistList: [],
		categoryList: [],
	});

	const selectionListLoadedRef = useRef(false);

	useEffect(() => {
		if (selectionListLoadedRef.current) return;
		selectionListLoadedRef.current = true;

		const fetchSelectionList = async () => {
			const [authorList, publisherList, artistList, audiobookCategories] = await Promise.all([
				getAuthorList(),
				getPublisherList(),
				getArtistList(),
				getAudiobookCategories(),
			]);
			setSelectionList(prev => ({
				...prev,
				authorList: authorList.map((author: Author) => ({
					label: author.name,
					value: author.name,
				})),
				publisherList: publisherList.map((publisher: Publisher) => ({
					label: publisher.full_name,
					value: publisher.id.toString(),
				})),
				artistList: artistList.map((artist: Artist) => ({
					label:artist.name,
					// label: combineBanglaEnglishName(artist.name, artist.en_name),
					// value: combineBanglaEnglishName(artist.name, artist.en_name),
					value:artist.name
				})),
				categoryList: audiobookCategories.map((category: AudiobookCategory) => ({
					label: category.name,
					value: category.id.toString(),
				})),
			}));
		};
		fetchSelectionList();
	}, []);

	const fetchAudiobookList = useCallback(async () => {
		try {
			setLoading(true);
			const query = buildAudiobookQueryParams(
				itemsPerPage,
				offset,
				appliedFilters,
				activeSearch,
			);
			const endpoint = listEndpointForTab(activeTab);
			const response = await fetch(`${endpoint}?${query}`, { cache: 'no-store' });
			if (!response.ok) {
				throw new Error('Failed to fetch audiobooks');
			}
			const apidata = await response.json();
			if (activeTab === 'all') {
				setMenuData(apidata.data ?? []);
				setTotalData(apidata.total?.count ?? 0);
			} else {
				setMenuData(apidata.result ?? []);
				setTotalData(apidata.total ?? 0);
			}
		} catch (error) {
			console.error(error);
			createToast('Something went wrong');
		} finally {
			setLoading(false);
		}
	}, [activeTab, offset, appliedFilters, activeSearch]);

	useEffect(() => {
		fetchAudiobookList();
	}, [fetchAudiobookList]);

	const totalPages = Math.ceil(totalData / itemsPerPage);

	const handlePageChange = (_: any, p: number) => {
		setCurrentPage(p);
		setOffset((p - 1) * itemsPerPage);
	};

	const handleEpisodes = async (id: any) => {
		try {
			setAudiobookdetails(menuData.find(data => data.id === id));
			const apidata = await getEpisodes(id);
			openAssign();
			setEpisodes(apidata);
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};

	const handleEditAudiobook = (audiobookId: number) => {
		setAudiobookdetails(menuData.find(data => data.id === audiobookId));
		openEditAudiobook();
	};

	const handleViewAudiobook = async (audiobookId: number) => {
		setAudiobookdetails(menuData.find(data => data.id === audiobookId));
		const episodes = await getEpisodes(audiobookId);
		setEpisodes(episodes);
		openViewAudiobook();
	};

	const handleApproveAudiobook = async (audiobookId: number, action: string) => {
		const data = await updateApproveAudiobook(audiobookId, action);
		if (data?.status === 200) {
			createToast2(data.message);
		} else {
			createToast(data.message);
		}
		fetchAudiobookList();
	};

	const handleDeleteAudiobook = async (audiobookId: number) => {
		const data = await deleteAudiobook(audiobookId);
		if (!data) {
			createToast('Something went wrong');
			return;
		}
		if (data.success) {
			createToast2(data.message);
			fetchAudiobookList();
		} else {
			createToast('Could not delete');
		}
	};

	const validateFilterDates = () => {
		if (filterDraft.date_from && filterDraft.date_to && filterDraft.date_from > filterDraft.date_to) {
			createToast('Created date "from" must be before "to"');
			return false;
		}
		const min = filterDraft.price_min ? Number(filterDraft.price_min) : null;
		const max = filterDraft.price_max ? Number(filterDraft.price_max) : null;
		if (min !== null && !Number.isFinite(min)) {
			createToast('Invalid minimum price');
			return false;
		}
		if (max !== null && !Number.isFinite(max)) {
			createToast('Invalid maximum price');
			return false;
		}
		if (min !== null && max !== null && min > max) {
			createToast('Minimum price must be less than or equal to maximum');
			return false;
		}
		return true;
	};

	const applyFilters = () => {
		if (!validateFilterDates()) return;
		setAppliedFilters(filterDraft);
		setCurrentPage(1);
		setOffset(0);
	};

	const clearFilters = () => {
		setFilterDraft(emptyFilters);
		setAppliedFilters(emptyFilters);
		setCurrentPage(1);
		setOffset(0);
	};

	const handleExportCsv = async () => {
		if (filterDraft.date_from && filterDraft.date_to && filterDraft.date_from > filterDraft.date_to) {
			createToast('Fix date range before exporting');
			return;
		}
		setExporting(true);
		try {
			const query = buildAudiobookQueryParams(itemsPerPage, 0, appliedFilters, activeSearch);
			const url = `/api/routes/audiobook/export?tab=${activeTab ?? 'all'}&${query}`;
			const response = await fetch(url);
			if (!response.ok) {
				createToast('Export failed');
				return;
			}
			const rowCount = response.headers.get('X-Export-Row-Count');
			if (rowCount === '0') {
				createToast('No data to export');
			}
			const blob = await response.blob();
			const disposition = response.headers.get('Content-Disposition') ?? '';
			const match = disposition.match(/filename="([^"]+)"/);
			const filename = match?.[1] ?? `audiobooks-export.csv`;
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = filename;
			link.click();
			URL.revokeObjectURL(link.href);
		} catch (err) {
			console.error(err);
			createToast('Export failed');
		} finally {
			setExporting(false);
		}
	};

	const handleForHome = (e: any, index: any) => {
		const tempArr: any = menuData;
		const item = tempArr[index];

		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, Update it!',
		}).then(async result => {
			if (result.isConfirmed) {
				try {
					if (tempArr[index].for_home === 0 || tempArr[index].for_home == null) {
						tempArr[index].for_home = 1;
						item.for_home = 1;
					} else {
						tempArr[index].for_home = 0;
						item.for_home = 0;
					}
					const data = {
						premium: item.premium,
						for_home: item.for_home,
					};

					const response = await fetch(`/api/routes/audiobook/${item.id}`, {
						method: 'PATCH',
						body: JSON.stringify(data),
					});
					let activityLogPayload = {
						name: 'handleForHome,audiobook/page.tsx',
						action_type: 'update',
						payload: JSON.stringify(data),
						api_end_point: `/api/routes/audiobook/${item.id}`,
					};
					createActivityLog(activityLogPayload);
					if (!response.ok) {
						throw new Error('Failed to fetch data');
					}
					setMenuData([...tempArr]);
				} catch (error) {
					console.error('Error fetching data:', error);
				}

				Swal.fire({
					title: 'Updated!',
					text: 'Item has been updated.',
					icon: 'success',
				});
			}
		});
	};

	const handleForRent = (e: any, index: any,isSubRestricted?: number) => {
		const tempArr: any = menuData;
		const item = tempArr[index];

		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, Update it!',
		}).then(async result => {
			if (result.isConfirmed) {
				try {
					if (tempArr[index].for_rent === 0 || tempArr[index].for_rent == null) {
						tempArr[index].for_rent = 1;
						item.for_rent = 1;
					} else {
						tempArr[index].for_rent = 0;
						item.for_rent = 0;
					}
					const data:any = {
						id: item.id,
					};
					
					if(isSubRestricted){
						data.isSubRestricted = !item?.isSubRestricted;
					}else{
						data.for_rent= item.for_rent;

					}

					const response = await fetch(`/api/routes/audiobook-for-rent`, {
						method: 'PATCH',
						body: JSON.stringify(data),
					});

					let activityLogPayload = {
						name: 'handleForRent,audiobook/page.tsx',
						action_type: 'update',
						payload: JSON.stringify(data),
						api_end_point: `/api/routes/audiobook-for-rent`,
					};
					createActivityLog(activityLogPayload);
					if (!response.ok) {
						throw new Error('Failed to fetch data');
					}
					setMenuData([...tempArr]);
				} catch (error) {
					console.error('Error fetching data:', error);
				}

				Swal.fire({
					title: 'Updated!',
					text: 'Item has been updated.',
					icon: 'success',
				});
			}
		});
	};

	const handlePremium = (index: any,isSubRestricted?: number) => {
		const tempArr: any = menuData;
		const item = tempArr[index];
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, Update it!',
		}).then(async result => {
			if (result.isConfirmed) {
				try {
					
					const data :any= {
						// for_home: item.for_home,
					};

					if(isSubRestricted){
						data.isSubRestricted = item?.isSubRestricted?0:1;
						data.premium= item.premium;
						data.for_home = item.for_home;
						item.isSubRestricted= item?.isSubRestricted?0:1;
					}else{
						if (tempArr[index].premium === 0 || tempArr[index].premium == null) {
							tempArr[index].premium = 1;
							item.premium = 1;
						} else {
							tempArr[index].premium = 0;
							item.premium = 0;
						}
						data.premium= item.premium;
						data.for_home = item.for_home;
					}

					const response = await fetch(`/api/routes/audiobook/${item.id}`, {
						method: 'PATCH',
						body: JSON.stringify(data),
					});
					let activityLogPayload = {
						name: 'handlePremium,audiobook/page.tsx',
						action_type: 'update',
						payload: JSON.stringify(data),
						api_end_point: `/api/routes/audiobook/${item.id}`,
					};
					createActivityLog(activityLogPayload);

					if (!response.ok) {
						throw new Error('Failed to fetch data');
					}
					setMenuData([...tempArr]);
				} catch (error) {
					console.error('Error fetching data:', error);
				}

				Swal.fire({
					title: 'Updated!',
					text: 'Item has been updated.',
					icon: 'success',
				});
			}
		});
	};

	const handleSearchResult = async (e: any) => {
		e.preventDefault();
		setActiveSearch(searchInputValue.trim());
		setCurrentPage(1);
		setOffset(0);
		setIsSubmitted(true);
	};

	const removeSearchInput = async (e: any) => {
		e.preventDefault();
		setSearchInputValue('');
		setActiveSearch('');
		setIsSubmitted(false);
		setCurrentPage(1);
		setOffset(0);
	};

	const rows = menuData?.map((element: any, index: any) => {
		const bgmCount = Number(element.bgm_episode_count) || 0;
		const totalEpisodes = Number(element.total_episode_count) || 0;

		const approval = approvalStatusMeta(Number(element.approval_status));

		return (
		<TableRow key={element.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
			<TableCell sx={{ py: 1, px: 1.5, width: 56 }}>
				<Typography variant="caption" color="text.secondary" fontFamily="monospace">
					#{element.id}
				</Typography>
			</TableCell>
			<TableCell sx={{ py: 1, px: 1.5, minWidth: 240, maxWidth: 320 }}>
				<Stack direction="row" spacing={1.25} alignItems="flex-start">
					<Box
						component="img"
						src={element.thumb_path}
						alt=""
						sx={{
							width: 48,
							height: 48,
							flexShrink: 0,
							objectFit: 'cover',
							borderRadius: 1,
							border: 1,
							borderColor: 'divider',
							bgcolor: 'grey.50',
						}}
					/>
					<Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
						<Typography
							variant="body2"
							fontWeight={600}
							sx={{
								display: '-webkit-box',
								WebkitLineClamp: 2,
								WebkitBoxOrient: 'vertical',
								overflow: 'hidden',
								lineHeight: 1.35,
							}}
						>
							{element.name}
						</Typography>
						<Chip
							label={approval.label}
							size="small"
							color={approval.color}
							sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, width: 'fit-content' }}
						/>
					</Stack>
				</Stack>
			</TableCell>
			<TableCell sx={{ py: 1, px: 1.5, maxWidth: 160 }}>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
					}}
				>
					{element.en_name || '—'}
				</Typography>
			</TableCell>
			<TableCell align="center" sx={{ py: 1, px: 1, whiteSpace: 'nowrap' }}>
				<Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} flexWrap="nowrap">
					<Chip
						label={bgmCount > 0 ? 'BGM' : 'No BGM'}
						size="small"
						color={bgmCount > 0 ? 'success' : 'default'}
						variant={bgmCount > 0 ? 'filled' : 'outlined'}
						sx={{ height: 20, fontSize: '0.65rem', minWidth: 44 }}
					/>
					<Typography variant="caption" color="text.secondary">
						{bgmCount}/{totalEpisodes}
					</Typography>
				</Stack>
			</TableCell>
			<TableCell align="center" sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap' }}>
				<Typography variant="body2" fontWeight={600} color="primary.main">
					৳{element.price}
				</Typography>
			</TableCell>
			<TableCell align="center" sx={{ py: 1, px: 1, verticalAlign: 'middle' }}>
				<AudiobookListenCount playCount={element.play_count} myblPlayCount={element.mybl_play_count} />
			</TableCell>
			<TableCell sx={{ py: 1, px: 1.5, maxWidth: 140 }}>
				<Typography variant="caption" noWrap title={element.author_name}>
					{element.author_name || '—'}
				</Typography>
			</TableCell>
			<TableCell sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap' }}>
				<Typography variant="caption" color="text.secondary" display="block">
					{moment(element.created_at).format('D MMM YYYY')}
				</Typography>
				<Typography variant="caption" color="text.disabled">
					{moment(element.created_at).format('h:mm a')}
				</Typography>
			</TableCell>

			<TableCell sx={{ py: 1, px: 1.5, minWidth: 200, verticalAlign: 'top' }}>
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
						gap: 0.5,
						width: '100%',
						maxWidth: 300,
					}}
				>
					<Button
						size="small"
						onClick={() => handleEpisodes(element.id)}
						startIcon={<IconList size={14} />}
						variant="outlined"
						color="primary"
						sx={actionBtnSx}
					>
						Episodes
					</Button>
					<Button
						size="small"
						variant="outlined"
						color="primary"
						startIcon={<IconEdit size={14} />}
						onClick={() => handleEditAudiobook(element.id)}
						sx={actionBtnSx}
					>
						Edit
					</Button>
					<Button
						size="small"
						variant="outlined"
						color="info"
						startIcon={<IconEye size={14} />}
						onClick={() => handleViewAudiobook(element.id)}
						sx={actionBtnSx}
					>
						View
					</Button>
					<Button
						size="small"
						variant="outlined"
						color="error"
						startIcon={<IconTrash size={14} />}
						onClick={() => handleDeleteAudiobook(element.id)}
						sx={actionBtnSx}
					>
						Delete
					</Button>
					{Number(element.approval_status) === 1 ? (
						<Button
							size="small"
							variant="outlined"
							color="warning"
							startIcon={<IconBan size={14} />}
							onClick={() => handleApproveAudiobook(element.id, 'reject')}
							sx={actionBtnSx}
						>
							Reject
						</Button>
					) : (
						<Button
							size="small"
							variant="outlined"
							color="success"
							startIcon={<IconCheckbox size={14} />}
							onClick={() => handleApproveAudiobook(element.id, 'approve')}
							sx={actionBtnSx}
						>
							Approve
						</Button>
					)}
				</Box>
			</TableCell>

			<TableCell align="center" sx={{ py: 0.5, px: 0.5 }}>
				<Switch
					size="small"
					checked={element.premium === 1}
					onChange={() => handlePremium(index)}
					color="secondary"
				/>
			</TableCell>

			<TableCell align="center" sx={{ py: 0.5, px: 0.5 }}>
				<Switch size="small" checked={element.for_home === 1} onChange={e => handleForHome(e, index)} color="primary" />
			</TableCell>
			<TableCell align="center" sx={{ py: 0.5, px: 0.5 }}>
				<Switch
					size="small"
					checked={element.isSubRestricted === 1}
					onChange={e => handlePremium(index, 1)}
					color="warning"
				/>
			</TableCell>

			<TableCell align="center" sx={{ py: 0.5, px: 0.5 }}>
				<Switch size="small" checked={element.for_rent === 1} onChange={e => handleForRent(e, index)} color="primary" />
			</TableCell>
		</TableRow>
		);
	});

	const activeFilterCount = countActiveFilters(appliedFilters);
	const tabLabel = TAB_LABELS[activeTab ?? 'all'] ?? 'All';

	return (
		<>
			{loading ? (
				<Loader />
			) : (
				<PageContainer
					title="Audiobooks"
					items={[{ label: 'Audiobooks', href: '/dashboard/audiobook' }]}
					subtitle={
						<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
							Manage catalog, episodes, and publishing flags · {TAB_LABELS[activeTab ?? 'all']}:{' '}
							{totalData.toLocaleString()} items
							{activeSearch ? ` · Search: ${activeSearch}` : ''}
						</Typography>
					}
					actions={
						<Stack
							direction={{ xs: 'column', sm: 'row' }}
							alignItems={{ xs: 'stretch', sm: 'center' }}
							spacing={1}
							sx={{ width: { xs: '100%', sm: 'auto' } }}
						>
							<Button
								variant="outlined"
								color="inherit"
								fullWidth
								sx={{ whiteSpace: 'nowrap' }}
								startIcon={<IconDownload size={16} />}
								onClick={handleExportCsv}
								disabled={exporting}
							>
								Export CSV
							</Button>
							<Button
								variant="contained"
								fullWidth
								sx={{ whiteSpace: 'nowrap' }}
								onClick={openAddAudiobook}
								startIcon={<IconPlus size={16} />}
							>
								Add audiobook
							</Button>
						</Stack>
					}
				>
				<Stack spacing={1.5} sx={{ pb: 2, minWidth: 0, width: '100%' }}>
					<Paper variant="outlined" sx={{ p: { xs: 1.25, sm: 1.5 }, borderRadius: 2, minWidth: 0, overflow: 'hidden' }}>
						<Stack spacing={1.5} sx={{ minWidth: 0 }}>
							<form onSubmit={!isSubmitted ? handleSearchResult : removeSearchInput}>
								<Stack
									direction={{ xs: 'column', sm: 'row' }}
									alignItems={{ xs: 'stretch', sm: 'center' }}
									spacing={1}
									useFlexGap
								>
									<TextField
										size="small"
										variant="outlined"
										fullWidth
										sx={{ flex: 1, minWidth: 0 }}
										value={searchInputValue}
										onChange={e => setSearchInputValue(e.target.value)}
										placeholder="Search name, English name, description, author, artists…"
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<IconSearch size={16} stroke={1.5} />
												</InputAdornment>
											),
										}}
									/>
									<Stack
										direction={{ xs: 'column', sm: 'row' }}
										spacing={1}
										sx={{ width: { xs: '100%', sm: 'auto' }, flexShrink: 0 }}
									>
										<Button
											type="submit"
											size="small"
											fullWidth
											sx={{ whiteSpace: 'nowrap' }}
											variant={isSubmitted ? 'outlined' : 'contained'}
											color={isSubmitted ? 'error' : 'primary'}
											startIcon={isSubmitted ? <IconX size={16} /> : <IconSearch size={16} />}
										>
											{isSubmitted ? 'Clear search' : 'Search'}
										</Button>
										<Button
											type="button"
											size="small"
											fullWidth
											sx={{ whiteSpace: 'nowrap' }}
											variant="outlined"
											color="primary"
											startIcon={<IconFilter size={16} />}
											endIcon={filtersOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
											onClick={() => setFiltersOpen(open => !open)}
										>
											Filters
											{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
										</Button>
									</Stack>
								</Stack>
							</form>

							<Collapse in={filtersOpen}>
								<Box
									sx={{
										pt: 1.5,
										mt: 0.5,
										borderTop: 1,
										borderColor: 'divider',
										minWidth: 0,
									}}
								>
									<Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.25, display: 'block' }}>
										Refine results
									</Typography>
									<Grid container spacing={1.5}>
										<Grid item xs={12} sm={6} lg={4} sx={{ minWidth: 0 }}>
											<DataSelect
												fullWidth
												label="Category"
												placeholder="All"
												clearable
												data={selectionList.categoryList}
												value={filterDraft.category || null}
												onChange={v => setFilterDraft(prev => ({ ...prev, category: v ?? '' }))}
											/>
										</Grid>
										<Grid item xs={12} sm={6} lg={4} sx={{ minWidth: 0 }}>
											<DataSelect
												fullWidth
												label="Author"
												placeholder="All"
												clearable
												searchable
												data={selectionList.authorList}
												value={filterDraft.author || null}
												onChange={v => setFilterDraft(prev => ({ ...prev, author: v ?? '' }))}
											/>
										</Grid>
										<Grid item xs={12} sm={6} lg={4} sx={{ minWidth: 0 }}>
											<DataSelect
												fullWidth
												label="Premium"
												placeholder="All"
												clearable
												data={yesNoSelectData}
												value={filterDraft.premium || null}
												onChange={v => setFilterDraft(prev => ({ ...prev, premium: v ?? '' }))}
											/>
										</Grid>
										<Grid item xs={12} sm={6} lg={4} sx={{ minWidth: 0 }}>
											<DataSelect
												fullWidth
												label="For Rent"
												placeholder="All"
												clearable
												data={yesNoSelectData}
												value={filterDraft.for_rent || null}
												onChange={v => setFilterDraft(prev => ({ ...prev, for_rent: v ?? '' }))}
											/>
										</Grid>
										<Grid item xs={12} sm={6} lg={4} sx={{ minWidth: 0 }}>
											<DataSelect
												fullWidth
												label="BGM"
												placeholder="All"
												clearable
												data={bgmFilterSelectData}
												value={filterDraft.has_bgm || null}
												onChange={v => setFilterDraft(prev => ({ ...prev, has_bgm: v ?? '' }))}
											/>
										</Grid>
										<Grid item xs={12} sm={6} lg={4} sx={{ minWidth: 0 }}>
											<DataSelect
												fullWidth
												label="Approval status"
												placeholder="All"
												clearable
												data={approvalStatusFilterData}
												value={filterDraft.approval_status || null}
												onChange={v =>
													setFilterDraft(prev => ({ ...prev, approval_status: v ?? '' }))
												}
											/>
										</Grid>
										<Grid item xs={12} sm={6} lg={4} sx={{ minWidth: 0 }}>
											<TextField
												type="number"
												label="Price min"
												placeholder="Min"
												inputProps={{ min: 0 }}
												size="small"
												fullWidth
												value={filterDraft.price_min === '' ? '' : filterDraft.price_min}
												onChange={e =>
													setFilterDraft(prev => ({
														...prev,
														price_min: e.target.value,
													}))
												}
											/>
										</Grid>
										<Grid item xs={12} sm={6} lg={4} sx={{ minWidth: 0 }}>
											<TextField
												type="number"
												label="Price max"
												placeholder="Max"
												inputProps={{ min: 0 }}
												size="small"
												fullWidth
												value={filterDraft.price_max === '' ? '' : filterDraft.price_max}
												onChange={e =>
													setFilterDraft(prev => ({
														...prev,
														price_max: e.target.value,
													}))
												}
											/>
										</Grid>
										<Grid item xs={12} sm={6} lg={4} sx={{ minWidth: 0 }}>
											<DatePicker
												label="Created from"
												value={
													filterDraft.date_from && dayjs(filterDraft.date_from).isValid()
														? dayjs(filterDraft.date_from)
														: null
												}
												onChange={d =>
													setFilterDraft(prev => ({
														...prev,
														date_from: d?.toDate() ?? null,
													}))
												}
												slotProps={{
													textField: {
														size: 'small',
														fullWidth: true,
														sx: {
															minWidth: 0,
															'& .MuiFormControl-root': { mt: 0, mb: 0 },
														},
													},
												}}
											/>
										</Grid>
										<Grid item xs={12} sm={6} lg={4} sx={{ minWidth: 0 }}>
											<DatePicker
												label="Created to"
												value={
													filterDraft.date_to && dayjs(filterDraft.date_to).isValid()
														? dayjs(filterDraft.date_to)
														: null
												}
												onChange={d =>
													setFilterDraft(prev => ({
														...prev,
														date_to: d?.toDate() ?? null,
													}))
												}
												slotProps={{
													textField: {
														size: 'small',
														fullWidth: true,
														sx: {
															minWidth: 0,
															'& .MuiFormControl-root': { mt: 0, mb: 0 },
														},
													},
												}}
											/>
										</Grid>
									</Grid>
									<Stack
										direction={{ xs: 'column', sm: 'row' }}
										spacing={1}
										justifyContent="flex-end"
										alignItems={{ xs: 'stretch', sm: 'center' }}
										sx={{
											pt: 1.5,
											mt: 1,
											borderTop: 1,
											borderColor: 'divider',
										}}
									>
										<Button
											type="button"
											size="small"
											variant="contained"
											sx={{ whiteSpace: 'nowrap', minWidth: { sm: 128 } }}
											onClick={applyFilters}
										>
											Apply filters
										</Button>
										<Button
											type="button"
											size="small"
											variant="outlined"
											sx={{ whiteSpace: 'nowrap', minWidth: { sm: 88 } }}
											onClick={clearFilters}
										>
											Reset
										</Button>
									</Stack>
								</Box>
							</Collapse>

							<Tabs
								value={activeTab}
								onChange={(_, tab) => {
									setActiveTab(tab);
									setCurrentPage(1);
									setOffset(0);
								}}
								variant="scrollable"
								sx={{ borderRadius: 2 }}
							>
								<Tab label="All" value="all" />
								<Tab label="Podcast" value="podcasts" />
								<Tab label="Rent" value="rent" />
								<Tab label="Pending" value="pending" />
								<Tab label="Rejected" value="rejected" />
							</Tabs>
						</Stack>
					</Paper>

					<MainCard
						title={`${tabLabel} catalog`}
						subtitle={`Page ${currentPage} of ${totalPages || 1}`}
						contentSX={{ p: 0, pt: 0 }}
					>
						<TableContainer
							sx={theme => ({
								minWidth: 1200,
								...catalogTableScrollSx(theme),
							})}
						>
								<Table
									size="small"
									stickyHeader
									sx={{
										'& .MuiTableCell-head': {
											py: 1,
											px: 1.5,
											fontWeight: 600,
											bgcolor: 'grey.50',
											borderBottom: 1,
											borderColor: 'divider',
										},
										'& .MuiTableCell-root': {
											borderColor: 'divider',
										},
									}}
								>
									<TableHead>
										<TableRow>
											<TableCell component="th">
												<Typography variant="overline" color="text.secondary" fontWeight={700}>
													ID
												</Typography>
											</TableCell>
											<TableCell component="th" sx={{ minWidth: 240 }}>
												<Typography variant="overline" color="text.secondary" fontWeight={700}>
													Audiobook
												</Typography>
											</TableCell>
											<TableCell component="th">
												<Typography variant="overline" color="text.secondary" fontWeight={700}>
													English
												</Typography>
											</TableCell>
											<TableCell component="th" align="center">
												<Typography variant="overline" color="text.secondary" fontWeight={700}>
													BGM
												</Typography>
											</TableCell>
											<TableCell component="th" align="center">
												<Typography variant="overline" color="text.secondary" fontWeight={700}>
													Price
												</Typography>
											</TableCell>
											<TableCell component="th" align="center">
												<Typography variant="overline" color="text.secondary" fontWeight={700}>
													Listens
												</Typography>
											</TableCell>
											<TableCell component="th">
												<Typography variant="overline" color="text.secondary" fontWeight={700}>
													Author
												</Typography>
											</TableCell>
											<TableCell component="th">
												<Typography variant="overline" color="text.secondary" fontWeight={700}>
													Created
												</Typography>
											</TableCell>
											<TableCell component="th" sx={{ minWidth: 200 }}>
												<Typography variant="overline" color="text.secondary" fontWeight={700}>
													Actions
												</Typography>
											</TableCell>
											<TableCell component="th" align="center">
												<Typography variant="overline" color="text.secondary" fontWeight={700}>
													Premium
												</Typography>
											</TableCell>
											<TableCell component="th" align="center">
												<Typography variant="overline" color="text.secondary" fontWeight={700}>
													Home
												</Typography>
											</TableCell>
											<TableCell component="th" align="center">
												<Typography variant="overline" color="text.secondary" fontWeight={700}>
													Rent only
												</Typography>
											</TableCell>
											<TableCell component="th" align="center">
												<Typography variant="overline" color="text.secondary" fontWeight={700}>
													For rent
												</Typography>
											</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{rows?.length ? rows : (
											<TableRow>
												<TableCell colSpan={13}>
													<Typography textAlign="center" color="text.secondary" variant="body2">
														No audiobooks match your filters. Try adjusting search or filters.
													</Typography>
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
						</TableContainer>
						<Divider />
						<Stack direction="row" flexWrap="wrap" justifyContent="space-between" alignItems="center" sx={{ p: 2, gap: 1 }}>
							<Typography variant="body2" color="text.secondary">
								Showing {menuData.length} of {totalData.toLocaleString()}
							</Typography>
						<Pagination
							page={currentPage}
							onChange={handlePageChange}
							count={totalPages || 1}
							shape="rounded"
							color="primary"
							siblingCount={0}
							sx={{ '& .MuiPagination-ul': { justifyContent: 'center', flexWrap: 'wrap' } }}
						/>
						</Stack>
					</MainCard>
				</Stack>
				</PageContainer>
			)}

			<Dialog
				open={addAudiobookOpened}
				onClose={closeAddAudiobook}
				maxWidth="lg"
				fullWidth
				fullScreen={isMobileSm}
				scroll="paper"
				PaperProps={{ sx: { borderRadius: { xs: 0, sm: 2 }, maxHeight: { xs: '100%', sm: 'min(90vh, 920px)' } } }}
			>
				<DialogTitle
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						fontWeight: 600,
						py: 1.5,
					}}
				>
					Add audiobook
					<IconButton aria-label="Close" size="small" onClick={closeAddAudiobook}>
						<IconX size={18} />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
					<AudiobookUploadForm token={token} selectionList={selectionList} formId="audiobook-add-form" />
				</DialogContent>
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button variant="outlined" color="inherit" onClick={closeAddAudiobook}>
						Cancel
					</Button>
					<Button variant="contained" type="submit" form="audiobook-add-form">
						Create audiobook
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={editAudiobookOpened}
				onClose={closeEditAudiobook}
				maxWidth="lg"
				fullWidth
				fullScreen={isMobileSm}
				scroll="paper"
				PaperProps={{ sx: { borderRadius: { xs: 0, sm: 2 }, maxHeight: { xs: '100%', sm: 'min(90vh, 920px)' } } }}
			>
				<DialogTitle
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						fontWeight: 600,
						py: 1.5,
					}}
				>
					Edit audiobook
					<IconButton aria-label="Close" size="small" onClick={closeEditAudiobook}>
						<IconX size={18} />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
					{audiobookDetails ? (
						<AudiobookEditForm
							audiobook={audiobookDetails}
							selectionList={selectionList}
							formId="audiobook-edit-form"
						/>
					) : null}
				</DialogContent>
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button variant="outlined" color="inherit" onClick={closeEditAudiobook}>
						Cancel
					</Button>
					<Button variant="contained" type="submit" form="audiobook-edit-form">
						Save changes
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				maxWidth="md"
				fullWidth
				fullScreen={isMobileSm}
				open={assignOpened}
				onClose={closeAssign}
				scroll="paper"
				PaperProps={{ sx: { borderRadius: { xs: 0, sm: 2 }, maxHeight: { xs: '100%', sm: 'min(90vh, 880px)' } } }}
			>
				<DialogTitle
					sx={{
						display: 'flex',
						alignItems: 'flex-start',
						justifyContent: 'space-between',
						fontWeight: 600,
						py: 1.5,
						gap: 1,
					}}
				>
					<Box>
						<Typography variant="h6" fontWeight={600} lineHeight={1.3}>
							Episodes
						</Typography>
						<Typography variant="body2" color="text.secondary" noWrap title={audiobookDetails?.name}>
							{audiobookDetails?.name ?? 'Audiobook'}
						</Typography>
					</Box>
					<IconButton aria-label="Close" size="small" onClick={closeAssign}>
						<IconX size={18} />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
					{audiobookDetails ? (
						<EpisodesEditForm
							audiobook={audiobookDetails}
							episodes={episodes}
							closeAssign={closeAssign}
						/>
					) : null}
				</DialogContent>
				<DialogActions sx={{ px: 3, py: 2 }}>
					<Button variant="outlined" color="inherit" onClick={closeAssign}>
						Close
					</Button>
				</DialogActions>
			</Dialog>

		<Dialog
			maxWidth="xl"
			fullWidth
			fullScreen={isMobileSm}
			open={viewAudiobookOpened}
			onClose={closeViewAudiobook}
		>
			<DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
				<Stack direction="row" alignItems="center" spacing={1}>
					<Chip label={`#${audiobookDetails?.id}`} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
					<Typography variant="h6" fontWeight={600} noWrap>{audiobookDetails?.name}</Typography>
				</Stack>
			</DialogTitle>
			<DialogContent dividers>
				{/* Hero section */}
				<Grid container spacing={3} sx={{ mb: 3 }}>
					<Grid item xs={12} sm="auto">
						<Box
							component="img"
							src={audiobookDetails?.thumb_path}
							alt={audiobookDetails?.name || 'Audiobook cover'}
							sx={{
								width: 180,
								height: 220,
								objectFit: 'cover',
								borderRadius: 2,
								border: '1px solid',
								borderColor: 'divider',
								display: 'block',
							}}
						/>
					</Grid>
					<Grid item xs={12} sm>
						<Stack spacing={1.5}>
							<Box>
								<Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
									Bengali Title
								</Typography>
								<Typography variant="h6" fontWeight={600} lineHeight={1.3}>
									{audiobookDetails?.name}
								</Typography>
							</Box>
							{audiobookDetails?.en_name && (
								<Box>
									<Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
										English Title
									</Typography>
									<Typography variant="body1">{audiobookDetails.en_name}</Typography>
								</Box>
							)}
							<Stack direction="row" flexWrap="wrap" gap={2}>
								<Box>
									<Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
										Price
									</Typography>
									<Typography variant="body1" fontWeight={700} color="primary.main">
										৳ {Number(audiobookDetails?.price)}
									</Typography>
								</Box>
								<Box>
									<Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
										Publisher
									</Typography>
									<Typography variant="body1">
										{audiobookDetails?.publisher_id
											? (
													selectionList.publisherList.find(
														(p: { label: string; value: string }) =>
															Number(p.value) === audiobookDetails.publisher_id,
													) as any
												)?.label ?? '—'
											: '—'}
									</Typography>
								</Box>
							</Stack>
							{audiobookDetails?.contributing_artists && (
								<Box>
									<Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
										Artists
									</Typography>
									<Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.5}>
										{audiobookDetails.contributing_artists
											.split(',')
											.map((n: string, i: number) => (
												<Chip key={i} label={n.trim()} size="small" variant="outlined" />
											))}
									</Stack>
								</Box>
							)}
							{audiobookDetails?.description && (
								<Box>
									<Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
										Description
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{
											display: '-webkit-box',
											WebkitLineClamp: 4,
											WebkitBoxOrient: 'vertical',
											overflow: 'hidden',
											mt: 0.25,
										}}
									>
										{audiobookDetails.description}
									</Typography>
								</Box>
							)}
						</Stack>
					</Grid>
				</Grid>

				<Divider sx={{ mb: 2 }} />
				<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
					Episodes ({episodes?.length ?? 0})
				</Typography>

				{!episodes?.length ? (
					<Paper variant="outlined" sx={{ py: 4, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}>
						<Typography variant="body2" color="text.secondary">No episodes for this audiobook.</Typography>
					</Paper>
				) : (
					<Grid container spacing={1.5}>
						{episodes.map((element: Episode, index: number) => (
							<Grid item xs={12} key={element.id}>
								<Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
									<Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between">
										<Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
											<Box
												sx={{
													width: 32,
													height: 32,
													borderRadius: 1,
													bgcolor: 'grey.100',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													fontWeight: 700,
													fontSize: '0.7rem',
													flexShrink: 0,
												}}
											>
												{index + 1}
											</Box>
											<Box sx={{ minWidth: 0 }}>
												<Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
													<Typography variant="subtitle2" fontWeight={600}>{element.name}</Typography>
													<Chip label={`#${element.id}`} size="small" variant="outlined" sx={{ height: 22, fontFamily: 'monospace', fontSize: '0.65rem' }} />
													<Chip
														label={element.isfree === 1 ? 'Free' : 'Premium'}
														size="small"
														color={element.isfree === 1 ? 'success' : 'default'}
														sx={{ height: 22, fontWeight: 600, fontSize: '0.65rem' }}
													/>
												</Stack>
												<Stack direction="row" alignItems="center" spacing={2} mt={0.5} flexWrap="wrap">
													<Stack direction="row" alignItems="center" spacing={0.5} color="text.secondary">
														<IconHeadphones size={14} />
														<Typography variant="caption">{formatEpisodeDuration(element.duration)}</Typography>
													</Stack>
													<Typography variant="caption" color="text.disabled">
														Created {moment(element.created_at).format('D MMM YYYY')}
													</Typography>
													<Typography variant="caption" color="text.disabled">
														Updated {moment(element.updated_at).format('D MMM YYYY')}
													</Typography>
												</Stack>
											</Box>
										</Stack>
										<Stack spacing={0.75} sx={{ minWidth: { md: 220 } }}>
											<Typography variant="overline" color="text.secondary" lineHeight={1}>Audio</Typography>
											<PathCopyCell value={element.file_path} />
											<Typography variant="overline" color="text.secondary" lineHeight={1}>BGM</Typography>
											{element.bgm_filepath ? (
												<PathCopyCell value={element.bgm_filepath} />
											) : (
												<Typography variant="caption" color="text.disabled">N/A</Typography>
											)}
										</Stack>
									</Stack>
								</Paper>
							</Grid>
						))}
					</Grid>
				)}
			</DialogContent>
		</Dialog>
		</>
	);
}
