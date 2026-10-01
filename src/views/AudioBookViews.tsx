'use client';
import {
	Badge,
	Box,
	Button,
	Collapse,
	CopyButton,
	Divider,
	Flex,
	Grid,
	Group,
	Image,
	Modal,
	NumberInput,
	Pagination,
	Paper,
	Select,
	Stack,
	Switch,
	Table,
	Tabs,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import '@mantine/dates/styles.css';
import { useDisclosure } from '@mantine/hooks';
import {
	IconBan,
	IconCheckbox,
	IconCopy,
	IconEdit,
	IconEye,
	IconChevronDown,
	IconChevronUp,
	IconDownload,
	IconFilter,
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

const TAB_LABELS: Record<string, string> = {
	all: 'All',
	podcasts: 'Podcast',
	rent: 'Rent',
	pending: 'Pending',
	rejected: 'Rejected',
};

function countActiveFilters(filters: AudiobookFilterState) {
	let count = 0;
	if (filters.category) count += 1;
	if (filters.premium) count += 1;
	if (filters.for_rent) count += 1;
	if (filters.has_bgm) count += 1;
	if (filters.author) count += 1;
	if (filters.price_min) count += 1;
	if (filters.price_max) count += 1;
	if (filters.date_from || filters.date_to) count += 1;
	return count;
}

function approvalStatusMeta(status: number) {
	if (status === 1) return { label: 'Approved', color: 'green' as const };
	if (status === 2) return { label: 'Rejected', color: 'red' as const };
	return { label: 'Pending', color: 'yellow' as const };
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

export default function AudiobookViews({ cookie }: any) {
	const token = cookie?.value;

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

	const handlePageChange = (e: any) => {
		const offsetCount = (e - 1) * itemsPerPage;
		setCurrentPage(e);
		setOffset(offsetCount);
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
		<Table.Tr key={element.id}>
			<Table.Td>
				<Text size="sm" c="dimmed" ff="monospace">#{element.id}</Text>
			</Table.Td>
			<Table.Td>
				<Stack gap={4}>
					<Text size="sm" fw={500} lineClamp={2} maw={220}>
						{element.name}
					</Text>
					<Badge size="xs" variant="dot" color={approval.color}>
						{approval.label}
					</Badge>
				</Stack>
			</Table.Td>
			<Table.Td>
				<Text size="sm" c="dimmed" lineClamp={2} maw={180}>
					{element.en_name || '—'}
				</Text>
			</Table.Td>
			<Table.Td ta="center" style={{ whiteSpace: 'normal' }}>
				<Flex direction="column" align="center" gap={4}>
					<Badge
						color={bgmCount > 0 ? 'green' : 'gray'}
						variant="light"
						size="md"
						styles={{ root: { textTransform: 'none', whiteSpace: 'nowrap' } }}
					>
						{bgmCount > 0 ? 'Has BGM' : 'No BGM'}
					</Badge>
					<Text size="xs" c="dimmed">
						({bgmCount}/{totalEpisodes})
					</Text>
				</Flex>
			</Table.Td>
			<Table.Td ta="center" style={{ whiteSpace: 'normal', minWidth: 100 }}>
				<Text size="sm" fw={600} c="teal" style={{ whiteSpace: 'nowrap' }}>
					Tk. {element.price}
				</Text>
			</Table.Td>
			<Table.Td>
				<Box
					p={4}
					style={{
						borderRadius: 12,
						border: '1px solid var(--mantine-color-gray-3)',
						background: 'var(--mantine-color-gray-0)',
					}}
				>
					<Image
						h={120}
						w={120}
						fit="cover"
						radius="md"
						src={element.thumb_path}
						alt={element.name || 'Audiobook cover'}
					/>
				</Box>
			</Table.Td>
			<Table.Td>
				<Text size="sm">{element.author_name || '—'}</Text>
			</Table.Td>
			<Table.Td>
				<Text size="xs" c="dimmed">
					{moment(element.created_at).format('Do MMM YYYY')}
				</Text>
				<Text size="xs" c="dimmed">
					{moment(element.created_at).format('h:mma')}
				</Text>
			</Table.Td>

			<Table.Td style={{ textAlign: 'left', whiteSpace: 'normal' }}>
				<Flex direction="column" align="flex-start" gap={6} w="100%">
					<Button
						size="compact-sm"
						onClick={() => handleEpisodes(element.id)}
						leftSection={<IconList size={15} />}
						variant="light"
						color="blue"
					>
						Episodes
					</Button>
					<Button
						size="compact-sm"
						variant="light"
						color="indigo"
						leftSection={<IconEdit size={15} />}
						onClick={() => handleEditAudiobook(element.id)}
					>
						Edit audiobook
					</Button>
					<Button
						size="compact-sm"
						variant="light"
						color="cyan"
						leftSection={<IconEye size={15} />}
						onClick={() => handleViewAudiobook(element.id)}
					>
						View details
					</Button>
					<Button
						size="compact-sm"
						variant="light"
						color="red"
						leftSection={<IconTrash size={15} />}
						onClick={() => handleDeleteAudiobook(element.id)}
					>
						Delete
					</Button>
					{Number(element.approval_status) === 1 ? (
						<Button
							size="compact-sm"
							variant="light"
							color="orange"
							leftSection={<IconBan size={15} />}
							onClick={() => handleApproveAudiobook(element.id, 'reject')}
						>
							Reject
						</Button>
					) : (
						<Button
							size="compact-sm"
							variant="light"
							color="green"
							leftSection={<IconCheckbox size={15} />}
							onClick={() => handleApproveAudiobook(element.id, 'approve')}
						>
							Approve
						</Button>
					)}
				</Flex>
			</Table.Td>

			<Table.Td>
				<Flex justify="center">
					<Switch
						checked={element.premium === 1 ? true : false}
						onChange={() => handlePremium(index)}
						size="sm"
						color="violet"
					/>
				</Flex>
			</Table.Td>

			<Table.Td>
				<Flex justify="center">
					<Switch
						checked={element.for_home === 1 ? true : false}
						onChange={e => handleForHome(e, index)}
						size="sm"
						color="blue"
					/>
				</Flex>
			</Table.Td>
			<Table.Td>
				<Flex justify="center">
					<Switch
						checked={element.isSubRestricted === 1 ? true : false}
						onChange={e => handlePremium(index, 1)}
						size="sm"
						color="orange"
					/>
				</Flex>
			</Table.Td>

			<Table.Td>
				<Flex justify="center">
					<Switch
						checked={element.for_rent === 1 ? true : false}
						onChange={e => handleForRent(e, index)}
						size="sm"
						color="teal"
					/>
				</Flex>
			</Table.Td>
		</Table.Tr>
		);
	});

	const activeFilterCount = countActiveFilters(appliedFilters);
	const tabLabel = TAB_LABELS[activeTab ?? 'all'] ?? 'All';

	return (
		<>
			{loading ? (
				<Loader />
			) : (
				<Stack gap="lg" pb="xl">
					<Flex justify="space-between" align="flex-end" wrap="wrap" gap="md">
						<Stack gap={4}>
							<Title order={2} fw={700}>Audiobooks</Title>
							<Text size="sm" c="dimmed">
								Manage catalog, episodes, and publishing flags
							</Text>
							<Group gap="xs">
								<Badge variant="light" color="gray" size="lg" radius="sm">
									{TAB_LABELS[activeTab ?? 'all']}: {totalData.toLocaleString()} items
								</Badge>
								{activeSearch ? (
									<Badge variant="outline" color="blue" size="sm" radius="sm">
										Search: {activeSearch}
									</Badge>
								) : null}
							</Group>
						</Stack>
						<Group>
							<Button
								variant="light"
								color="gray"
								leftSection={<IconDownload size={16} />}
								onClick={handleExportCsv}
								loading={exporting}
							>
								Export CSV
							</Button>
							<Button
								onClick={openAddAudiobook}
								leftSection={<IconPlus size={16} />}
							>
								Add audiobook
							</Button>
						</Group>
					</Flex>

					<Paper shadow="xs" radius="lg" p="md" withBorder>
						<Stack gap="md">
							<form onSubmit={!isSubmitted ? handleSearchResult : removeSearchInput}>
								<Group align="flex-end" wrap="wrap" gap="sm">
									<TextInput
										style={{ flex: 1, minWidth: 280 }}
										radius="md"
										size="md"
										leftSection={<IconSearch size={16} stroke={1.5} />}
										value={searchInputValue}
										onChange={e => setSearchInputValue(e.target.value)}
										placeholder="Search name, English name, description, author, artists…"
									/>
									<Button
										type="submit"
										variant={isSubmitted ? 'light' : 'filled'}
										color={isSubmitted ? 'red' : 'blue'}
										leftSection={isSubmitted ? <IconX size={16} /> : <IconSearch size={16} />}
									>
										{isSubmitted ? 'Clear search' : 'Search'}
									</Button>
									<Button
										type="button"
										variant={filtersOpen ? 'light' : 'default'}
										color="blue"
										leftSection={<IconFilter size={16} />}
										rightSection={filtersOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
										onClick={() => setFiltersOpen(open => !open)}
									>
										Filters
										{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
									</Button>
								</Group>
							</form>

					<Collapse in={filtersOpen}>
						<Paper
							p="md"
							radius="md"
							bg="var(--mantine-color-gray-0)"
							style={{ border: '1px solid var(--mantine-color-gray-2)' }}
						>
							<Text size="sm" fw={600} mb="sm">Refine results</Text>
							<Grid>
								<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
									<Select
										label="Category"
										placeholder="All"
										clearable
										data={selectionList.categoryList}
										value={filterDraft.category || null}
										onChange={v => setFilterDraft(prev => ({ ...prev, category: v ?? '' }))}
									/>
								</Grid.Col>
								<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
									<Select
										label="Author"
										placeholder="All"
										clearable
										searchable
										data={selectionList.authorList}
										value={filterDraft.author || null}
										onChange={v => setFilterDraft(prev => ({ ...prev, author: v ?? '' }))}
									/>
								</Grid.Col>
								<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
									<Select
										label="Premium"
										placeholder="All"
										clearable
										data={yesNoSelectData}
										value={filterDraft.premium || null}
										onChange={v => setFilterDraft(prev => ({ ...prev, premium: v ?? '' }))}
									/>
								</Grid.Col>
								<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
									<Select
										label="For Rent"
										placeholder="All"
										clearable
										data={yesNoSelectData}
										value={filterDraft.for_rent || null}
										onChange={v => setFilterDraft(prev => ({ ...prev, for_rent: v ?? '' }))}
									/>
								</Grid.Col>
								<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
									<Select
										label="BGM"
										placeholder="All"
										clearable
										data={bgmFilterSelectData}
										value={filterDraft.has_bgm || null}
										onChange={v => setFilterDraft(prev => ({ ...prev, has_bgm: v ?? '' }))}
									/>
								</Grid.Col>
								<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
									<NumberInput
										label="Price min"
										placeholder="Min"
										min={0}
										value={filterDraft.price_min === '' ? '' : Number(filterDraft.price_min)}
										onChange={v =>
											setFilterDraft(prev => ({
												...prev,
												price_min: v === '' || v === undefined ? '' : String(v),
											}))
										}
									/>
								</Grid.Col>
								<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
									<NumberInput
										label="Price max"
										placeholder="Max"
										min={0}
										value={filterDraft.price_max === '' ? '' : Number(filterDraft.price_max)}
										onChange={v =>
											setFilterDraft(prev => ({
												...prev,
												price_max: v === '' || v === undefined ? '' : String(v),
											}))
										}
									/>
								</Grid.Col>
								<Grid.Col span={{ base: 12, sm: 6, md: 8 }}>
									<DatePickerInput
										type="range"
										label="Created at"
										placeholder="Select range"
										value={[filterDraft.date_from, filterDraft.date_to]}
										onChange={range =>
											setFilterDraft(prev => ({
												...prev,
												date_from: range[0],
												date_to: range[1],
											}))
										}
										clearable
									/>
								</Grid.Col>
							</Grid>
							<Group mt="md">
								<Button onClick={applyFilters}>Apply filters</Button>
								<Button variant="default" onClick={clearFilters}>Reset</Button>
							</Group>
						</Paper>
					</Collapse>

							<Tabs
								value={activeTab}
								onChange={tab => {
									setActiveTab(tab);
									setCurrentPage(1);
									setOffset(0);
								}}
								variant="pills"
								radius="md"
							>
								<Tabs.List grow>
									<Tabs.Tab value="all">All</Tabs.Tab>
									<Tabs.Tab value="podcasts">Podcast</Tabs.Tab>
									<Tabs.Tab value="rent">Rent</Tabs.Tab>
									<Tabs.Tab value="pending">Pending</Tabs.Tab>
									<Tabs.Tab value="rejected">Rejected</Tabs.Tab>
								</Tabs.List>
							</Tabs>
						</Stack>
					</Paper>

					<Paper shadow="xs" radius="lg" withBorder style={{ overflow: 'hidden' }}>
						<Box px="md" py="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
							<Text size="sm" fw={600}>{tabLabel} catalog</Text>
							<Text size="xs" c="dimmed">
								Page {currentPage} of {totalPages || 1}
							</Text>
						</Box>
						<Box w="100%" p="md" pt={0} style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
							<Table.ScrollContainer minWidth={1500} type="native">
								<Table
									striped
									highlightOnHover
									withTableBorder
									verticalSpacing="md"
									horizontalSpacing="md"
									style={{ tableLayout: 'auto', whiteSpace: 'nowrap' }}
								>
									<Table.Thead
										style={{
											position: 'sticky',
											top: 0,
											zIndex: 2,
											background: 'var(--mantine-color-body)',
										}}
									>
										<Table.Tr>
											<Table.Th style={{ minWidth: 56 }}><Text size="xs" fw={700} tt="uppercase" c="dimmed">ID</Text></Table.Th>
											<Table.Th style={{ minWidth: 200 }}><Text size="xs" fw={700} tt="uppercase" c="dimmed">Title</Text></Table.Th>
											<Table.Th style={{ minWidth: 140 }}><Text size="xs" fw={700} tt="uppercase" c="dimmed">English</Text></Table.Th>
											<Table.Th style={{ minWidth: 120, textAlign: 'center' }}><Text size="xs" fw={700} tt="uppercase" c="dimmed">BGM</Text></Table.Th>
											<Table.Th style={{ minWidth: 110, textAlign: 'center' }}><Text size="xs" fw={700} tt="uppercase" c="dimmed">Price</Text></Table.Th>
											<Table.Th style={{ minWidth: 140, textAlign: 'center' }}><Text size="xs" fw={700} tt="uppercase" c="dimmed">Cover</Text></Table.Th>
											<Table.Th style={{ minWidth: 120 }}><Text size="xs" fw={700} tt="uppercase" c="dimmed">Author</Text></Table.Th>
											<Table.Th style={{ minWidth: 120 }}><Text size="xs" fw={700} tt="uppercase" c="dimmed">Created</Text></Table.Th>
											<Table.Th style={{ minWidth: 220 }}><Text size="xs" fw={700} tt="uppercase" c="dimmed">Actions</Text></Table.Th>
											<Table.Th style={{ minWidth: 88, textAlign: 'center' }}><Text size="xs" fw={700} tt="uppercase" c="dimmed">Premium</Text></Table.Th>
											<Table.Th style={{ minWidth: 100, textAlign: 'center' }}><Text size="xs" fw={700} tt="uppercase" c="dimmed">Home</Text></Table.Th>
											<Table.Th style={{ minWidth: 100, textAlign: 'center' }}><Text size="xs" fw={700} tt="uppercase" c="dimmed">Rent only</Text></Table.Th>
											<Table.Th style={{ minWidth: 100, textAlign: 'center' }}><Text size="xs" fw={700} tt="uppercase" c="dimmed">For rent</Text></Table.Th>
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{rows?.length ? rows : (
											<Table.Tr>
												<Table.Td colSpan={13}>
													<Text ta="center" c="dimmed" py="xl" size="sm">
														No audiobooks match your filters. Try adjusting search or filters.
													</Text>
												</Table.Td>
											</Table.Tr>
										)}
									</Table.Tbody>
								</Table>
							</Table.ScrollContainer>
						</Box>
						<Divider />
						<Flex justify="space-between" align="center" wrap="wrap" gap="sm" p="md">
							<Text size="sm" c="dimmed">
								Showing {menuData.length} of {totalData.toLocaleString()}
							</Text>
							<Pagination
								value={currentPage}
								onChange={handlePageChange}
								total={totalPages || 1}
								siblings={1}
								radius="md"
							/>
						</Flex>
					</Paper>
				</Stack>
			)}

			<Modal
				size={'xl'}
				opened={addAudiobookOpened}
				onClose={closeAddAudiobook}
				title="Add Audiobook"
				centered
				classNames={{ title: 'mantine-modal-title', close: 'mantine-modal-close' }}
			>
				<AudiobookUploadForm token={token} selectionList={selectionList} />
			</Modal>

			<Modal
				size={'xl'}
				opened={editAudiobookOpened}
				onClose={closeEditAudiobook}
				title="Edit Audiobook"
				centered
				classNames={{ title: 'mantine-modal-title', close: 'mantine-modal-close' }}
			>
				<AudiobookEditForm audiobook={audiobookDetails} selectionList={selectionList} />
			</Modal>

			<Modal
				size={'80%'}
				opened={assignOpened}
				onClose={closeAssign}
				title="Episode List"
				centered
				classNames={{ title: 'mantine-modal-title', close: 'mantine-modal-close' }}
			>
				<EpisodesEditForm
					audiobook={audiobookDetails}
					episodes={episodes}
					closeAssign={closeAssign}
				/>
			</Modal>
			<Modal
				size={'95%'}
				opened={viewAudiobookOpened}
				onClose={closeViewAudiobook}
				title="Audiobook View"
				centered
				classNames={{ title: 'mantine-modal-title', close: 'mantine-modal-close' }}
				style={{ fontSize: '12px' }}
			>
				<div style={{ display: 'flex', gap: 20 }}>
					<div style={{ width: '33.33%' }}>
						<Image
							src={audiobookDetails?.thumb_path}
							alt={audiobookDetails?.thumb_path}
							radius={5}
						/>
					</div>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							width: '66.67%',
							gap: 10,
						}}
					>
						<Text style={{ fontSize: 32, fontWeight: 100 }}>{audiobookDetails?.id}</Text>
						<Text style={{ fontSize: 32, fontWeight: 100 }}>{audiobookDetails?.name}</Text>
						<div
							className="text-ellipsis"
							style={{
								maxHeight: '110px',
								whiteSpace: 'wrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								fontSize: '14px',
								display: '-webkit-box',
							}}
						>
							{audiobookDetails?.description}
						</div>
						<Text>Price: {Number(audiobookDetails?.price)} Tk</Text>
						<Text>
							Publisher:{' '}
							{audiobookDetails?.publisher_id
								? (
										selectionList.publisherList.find(
											(p: { label: string; value: string }) =>
												Number(p.value) === audiobookDetails.publisher_id,
										) as any
									)?.label
								: 'BLANK'}
						</Text>
						<Text>
							Artists:{' '}
							<span>
								{audiobookDetails?.contributing_artists
									.split(',')
									.map((n: string) => n.trim())
									.join(', ')}
							</span>
						</Text>
					</div>
				</div>
				<Table.ScrollContainer minWidth={800} style={{ marginTop: '30px' }}>
					<Table>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Id</Table.Th>
								<Table.Th>Name</Table.Th>
								<Table.Th>Free</Table.Th>
								<Table.Th>Duration</Table.Th>
								<Table.Th>Created At</Table.Th>
								<Table.Th>Updated At</Table.Th>
								<Table.Th>Audio Filepath</Table.Th>
								<Table.Th>Background Music Filepath</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{episodes?.map((element: Episode) => (
								<Table.Tr key={element.id}>
									<Table.Td>{element.id}</Table.Td>
									<Table.Td>{element.name}</Table.Td>
									<Table.Td>
										<Switch checked={element.isfree ? true : false} />
									</Table.Td>
									<Table.Td>{element.duration}s</Table.Td>
									<Table.Td>{moment(element.created_at).format('DD MMMM YYYY')}</Table.Td>
									<Table.Td>{moment(element.updated_at).format('DD MMMM YYYY')}</Table.Td>
									<Table.Td>
										<Flex>
											<div
												className="single-line-ellipsis"
												style={{
													border: '1px solid #5553',
													width: '150px',
													borderRadius: '5px',
													padding: '5px 10px',
												}}
											>
												{element.file_path}
											</div>
											<CopyButton value={element.file_path}>
												{({ copied, copy }) => (
													<Button style={{ padding: '5px' }} onClick={copy} variant="default">
														{!copied ? <IconCopy /> : <IconCheckbox />}
													</Button>
												)}
											</CopyButton>
										</Flex>
									</Table.Td>
									<Table.Td>
										{element.bgm_filepath ? (
											<Flex>
												<div
													className="single-line-ellipsis"
													style={{
														border: '1px solid #5553',
														width: '150px',
														borderRadius: '5px',
														padding: '5px 10px',
													}}
												>
													{element.bgm_filepath}
												</div>
												<CopyButton value={element.bgm_filepath}>
													{({ copied, copy }) => (
														<Button style={{ padding: '5px' }} onClick={copy} variant="default">
															{!copied ? <IconCopy /> : <IconCheckbox />}
														</Button>
													)}
												</CopyButton>
											</Flex>
										) : (
											'N/A'
										)}
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</Table.ScrollContainer>
			</Modal>
		</>
	);
}
