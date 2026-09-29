'use client';
import {
	ActionIcon,
	Button,
	CopyButton,
	Divider,
	Flex,
	Image,
	Modal,
	Pagination,
	Paper,
	Space,
	Switch,
	Table,
	Tabs,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
	IconBan,
	IconCheckbox,
	IconCopy,
	IconEdit,
	IconEye,
	IconList,
	IconSearch,
	IconTrash,
	IconX,
} from '@tabler/icons-react';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
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
	searchAudiobooks,
	updateApproveAudiobook,
} from '@/services/services';
import { Artist, AudiobookCategory, Author, Episode, Publisher } from '@/types/global';
import { combineBanglaEnglishName } from '@/utils/globalHelpers';
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

	const isPodcast = false;
	const [loading, setLoading] = useState(true);
	const [episodes, setEpisodes] = useState<any>([]);

	const [totalData, setTotalData] = useState(0);

	const [currentPage, setCurrentPage] = useState(1);

	const itemsPerPage = 10;
	const [offset, setOffset] = useState(0);
	const [activeTab, setActiveTab] = useState<string | null>('all');
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [searchInputValue, setSearchInputValue] = useState('');

	const [selectionList, setSelectionList] = useState({
		authorList: [],
		publisherList: [],
		artistList: [],
		categoryList: [],
	});

	useEffect(() => {
		const fetchSelectionList = async () => {
			const authorList = await getAuthorList();
			const publisherList = await getPublisherList();
			const artistList = await getArtistList();
			const audiobookCategories = await getAudiobookCategories();
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

	const getData = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/routes/audiobook?limit=${itemsPerPage}&offset=${offset}`, {
				cache: 'no-store',
			});
			const apidata = await response.json();
			setMenuData(apidata.data);
			setTotalData(apidata.total.count);
		} catch (error) {
			createToast('Something Went wrong');
		} finally {
			setLoading(false);
		}
	}, [offset]);

	const getPodcastAudioList = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`/api/routes/podcast-audio?limit=${itemsPerPage}&offset=${offset}`,
				{ cache: 'no-store' },
			);
			const apidata = await response.json();
			setMenuData(apidata.result);
			setTotalData(apidata.total);
		} catch (error) {
			createToast(error);
		} finally {
			setLoading(false);
		}
	}, [offset]);

	const getRentAudioList = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`/api/routes/rent-audiobooks?limit=${itemsPerPage}&offset=${offset}`,
				{ cache: 'no-store' },
			);
			const apidata = await response.json();
			setMenuData(apidata.result);
			setTotalData(apidata.total);
		} catch (error) {
			createToast(error);
		} finally {
			setLoading(false);
		}
	}, [offset]);

	const getPendingAudioList = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`/api/routes/pending-audiobooks?limit=${itemsPerPage}&offset=${offset}`,
				{ cache: 'no-store' },
			);
			if (!response.ok) {
				throw new Error(`Error during fetching pending audiobooks`);
			}
			const apidata = await response.json();
			setMenuData(apidata.result);
			setTotalData(apidata.total);
		} catch (err) {
			console.error(err);
			createToast(err);
		} finally {
			setLoading(false);
		}
	}, [offset]);

	const getRejectedAudioList = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`/api/routes/rejected-audiobooks?limit=${itemsPerPage}&offset=${offset}`,
				{ cache: 'no-store' },
			);
			if (!response.ok) {
				throw new Error(`Error during fetching pending audiobooks`);
			}
			const apidata = await response.json();
			setMenuData(apidata.result);
			setTotalData(apidata.total);
		} catch (err) {
			console.error(err);
			createToast(err);
		} finally {
			setLoading(false);
		}
	}, [offset]);

	useEffect(() => {
		switch (activeTab) {
			case 'all':
				getData();
				break;
			case 'podcasts':
				getPodcastAudioList();
				break;
			case 'rent':
				getRentAudioList();
				break;
			case 'pending':
				getPendingAudioList();
				break;
			case 'rejected':
				getRejectedAudioList();
				break;
			default:
				getData();
				break;
		}
	}, [
		activeTab,
		getData,
		getPendingAudioList,
		getPodcastAudioList,
		getRejectedAudioList,
		getRentAudioList,
	]);

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
		getData();
	};

	const handleDeleteAudiobook = async (audiobookId: number) => {
		const data = await deleteAudiobook(audiobookId);
		if (!data) {
			createToast('Something went wrong');
			return;
		}
		if (data.success) {
			createToast2(data.message);
			getData();
		} else {
			createToast('Could not delete');
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
		const data = await searchAudiobooks(searchInputValue);
		if (data?.success === true) {
			setMenuData(data.data);
			setTotalData(data.data.length);
		} else {
			createToast('Could not get search results');
		}
		setIsSubmitted(true);
	};

	const removeSearchInput = async (e: any) => {
		e.preventDefault();
		setSearchInputValue('');
		setActiveTab(activeTab);
		setIsSubmitted(false);
		getData();
	};

	const rows = menuData?.map((element: any, index: any) => (
		<Table.Tr key={element.id}>
			<Table.Td style={{ fontSize: 14 }}>{element.id}</Table.Td>
			<Table.Td style={{ fontSize: 14 }}>{element.name}</Table.Td>
			<Table.Td style={{ fontSize: 14 }}>{element.en_name}</Table.Td>
			<Table.Td style={{ fontSize: 14, textAlign: 'center' }}>Tk. {element.price}</Table.Td>
			<Table.Td style={{}}>
				<Image
					p={5}
					h={150}
					w={150}
					fit="contain"
					src={element.thumb_path}
					alt={element.thumb_path}
				/>
			</Table.Td>
			<Table.Td style={{ fontSize: 14 }}>{element.author_name}</Table.Td>
			<Table.Td style={{ fontSize: 14 }}>
				{moment(element.created_at).format('Do MMM YYYY h:mma')}
			</Table.Td>

			<Table.Td>
				<Button
					size="compact-md"
					onClick={() => {
						handleEpisodes(element.id);
					}}
					leftSection={<IconList size={15} />}
					variant="default"
					mb={10}
				>
					Episodes
				</Button>
				<Flex mih={50} gap="sm" justify="center" direction="row" wrap="nowrap">
					<ActionIcon onClick={() => handleEditAudiobook(element.id)} variant="default">
						<IconEdit size={15} />
					</ActionIcon>

					<ActionIcon variant="default" onClick={() => handleViewAudiobook(element.id)}>
						<IconEye size={15} />
					</ActionIcon>

					<ActionIcon variant="default" onClick={() => handleDeleteAudiobook(element.id)}>
						<IconTrash size={15} />
					</ActionIcon>
				</Flex>
				<Flex mih={50} gap="sm" justify="center" direction="row" wrap="nowrap">
					<ActionIcon
						variant="default"
						onClick={() => handleApproveAudiobook(element.id, 'approve')}
					>
						<IconCheckbox size={15} />
					</ActionIcon>
					<ActionIcon
						variant="default"
						onClick={() => handleApproveAudiobook(element.id, 'reject')}
					>
						<IconBan size={15} />
					</ActionIcon>
				</Flex>
			</Table.Td>

			<Table.Td style={{ fontSize: 14 }}>
				<Flex gap="md" justify="center" direction="row" wrap="wrap">
					<Switch
						checked={element.premium === 1 ? true : false}
						onChange={() => handlePremium(index)}
						size="xs"
					/>
				</Flex>
			</Table.Td>

			<Table.Td style={{ fontSize: 14 }}>
				<Flex gap="md" justify="center" direction="row" align="center" wrap="wrap">
					<Switch
						checked={element.for_home === 1 ? true : false}
						onChange={e => handleForHome(e, index)}
						size="xs"
					/>
				</Flex>
			</Table.Td>
			<Table.Td style={{ fontSize: 14 }}>
				<Flex gap="md" justify="center" direction="row" align="center" wrap="wrap">
					<Switch
						checked={element.isSubRestricted === 1 ? true : false}
						onChange={e => handlePremium( index,1)}
						size="xs"
					/>
				</Flex>
			</Table.Td>

			<Table.Td style={{ fontSize: 14 }}>
				<Flex gap="md" justify="center" direction="row" align="center" wrap="wrap">
					<Switch
						checked={element.for_rent === 1 ? true : false}
						onChange={e => handleForRent(e, index)}
						size="xs"
					/>
				</Flex>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<>
			{loading ? (
				<Loader />
			) : (
				<>
					<Flex justify="space-between">
						<Title order={1} style={{ marginBottom: 10 }}>
							Audio Book List
						</Title>
						<Button onClick={openAddAudiobook} variant="filled">
							Add Audiobook
						</Button>
					</Flex>
					<form onSubmit={!isSubmitted ? handleSearchResult : removeSearchInput}>
						<Flex>
							<TextInput
								style={{ flexGrow: 1 }}
								classNames={{
									input: 'mantine-search-text-input',
								}}
								value={searchInputValue}
								onChange={e => setSearchInputValue(e.target.value)}
								placeholder="Search by audiobook name, english audiobook name, description, author name or artists ..."
							/>
							<Button
								classNames={{
									root: 'mantine-search-right-button',
								}}
								type="submit"
							>
								{!isSubmitted ? <IconSearch /> : <IconX />}
							</Button>
						</Flex>
					</form>
					<Space h="md" />
					<Tabs value={activeTab} onChange={setActiveTab}>
						<Tabs.List>
							<Tabs.Tab
								value="all"
								onClick={() => {
									getData();
									setCurrentPage(1);
									setOffset(0);
								}}
							>
								All
							</Tabs.Tab>
							<Tabs.Tab
								value="podcasts"
								onClick={() => {
									getPodcastAudioList();
									setCurrentPage(1);
									setOffset(0);
								}}
							>
								Podcast
							</Tabs.Tab>
							<Tabs.Tab
								value="rent"
								onClick={() => {
									getRentAudioList();
									setCurrentPage(1);
									setOffset(0);
								}}
							>
								Rent
							</Tabs.Tab>
							<Tabs.Tab
								value="pending"
								onClick={() => {
									getPendingAudioList();
									setCurrentPage(1);
									setOffset(0);
								}}
							>
								Pending
							</Tabs.Tab>
							<Tabs.Tab
								value="rejected"
								onClick={() => {
									getRejectedAudioList();
									setCurrentPage(1);
									setOffset(0);
								}}
							>
								Rejected
							</Tabs.Tab>
						</Tabs.List>
					</Tabs>
					<Space h="md" />
					<Paper withBorder radius="md" p="md">
						<Space h="md" />
						<Table.ScrollContainer minWidth={800}>
							<Table>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Id</Table.Th>
										<Table.Th>Name</Table.Th>
										<Table.Th>EnName</Table.Th>
										<Table.Th style={{ width: '10%', textAlign: 'center' }}>Price</Table.Th>
										<Table.Th style={{ textAlign: 'center' }}>Image</Table.Th>
										<Table.Th style={{ width: '10%', textAlign: 'center' }}>Author Name</Table.Th>
										<Table.Th style={{ width: '10%', textAlign: 'center' }}>Created At</Table.Th>

										<Table.Th style={{ textAlign: 'center' }}>Action</Table.Th>
										<Table.Th style={{ width: '5%', textAlign: 'center' }}>Premium</Table.Th>
										<Table.Th style={{ width: '10%', textAlign: 'center' }}>From Home</Table.Th>
										<Table.Th style={{ width: '10%', textAlign: 'center' }}>Rent Only</Table.Th>
										<Table.Th style={{ width: '10%', textAlign: 'center' }}>For Rent</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>{rows}</Table.Tbody>
							</Table>
						</Table.ScrollContainer>
						<Divider my="sm" />
						{!isPodcast && (
							<Pagination
								value={currentPage}
								onChange={handlePageChange}
								total={totalPages}
								siblings={1}
							/>
						)}
					</Paper>
				</>
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
