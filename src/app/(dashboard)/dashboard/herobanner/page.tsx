'use client';

import {
	Button,
	Divider,
	Flex,
	Image,
	Modal,
	Pagination,
	Paper,
	Select,
	Switch,
	Table,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import Loader from '@/components/Loader';
import { createActivityLog } from '@/helper/Commonfunction';

export default function HeroBanner() {
	const [bannerData, setBannerData] = useState([]);

	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [offset, setOffset] = useState(0);
	const [totalData, setTotalData] = useState(0);
	const [loading, setLoading] = useState(true);

	// hero banner add
	const [audioBookId, setAudioBookId] = useState('');
	const [value, setValue] = useState('');
	const [imageFile, setImageFile] = useState(null);

	const [addBannerOpened, { open: openAddBanner, close: closeAddBanner }] = useDisclosure(false);
	const [details, setDetails] = useState<any>(null);
	const [detailsModalOpened, { open: openDetailsModal, close: closeDetailsModal }] =
		useDisclosure(false);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const totalPages = Math.ceil(totalData / itemsPerPage);

	const getBannerData = async () => {
		try {
			const response = await fetch(
				`/api/routes/herobanner?offset=${offset}&limit=${itemsPerPage}`,
				{
					method: 'GET',
				},
			);

			const res = await response.json();
			setLoading(false);
			setBannerData(res.data);
			setTotalData(res.total.count);
		} catch (error) {}
	};

	const handleHeroImage = async (event: any, index: any) => {
		try {
			const tempArray: any = bannerData;
			const item = tempArray[index];
			const formData = new FormData();
			formData.append('files', event.target.files[0]);
			formData.append('size', event.target.files[0].size);

			const response = await fetch('https://api.kabbik.com/v3/audiobooks/upload-image-in-stack', {
				method: 'POST',
				body: formData,
			});
			let activityLogPayload = {
				name: 'handleHeroImage,herobanner/page.tsx',
				action_type: 'update',
				payload: JSON.stringify({ fileName: event.target.files[0].name }),
				api_end_point: 'https://api.kabbik.com/v3/audiobooks/upload-image-in-stack',
			};
			createActivityLog(activityLogPayload);

			const res = await response.json();

			const data = {
				image_url: res.image_file_url,
			};
			if (res.image_file_url) {
				const getresponse = await fetch(`/api/routes/herobanner/${item.id}`, {
					method: 'PATCH',
					body: JSON.stringify(data),
				});
				let activityLogPayload = {
					name: 'handleHeroImage,herobanner/page.tsx',
					action_type: 'update',
					payload: JSON.stringify(data),
					api_end_point: `/api/routes/herobanner/${item.id}`,
				};
				createActivityLog(activityLogPayload);
			}
			const updatedBannerData: any = bannerData.map((element: any) => {
				if (element.id === item.id) {
					return { ...element, image_url: res.image_file_url };
				}
				return element;
			});

			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}

			setBannerData(updatedBannerData);
		} catch (error) {
			return;
		}
	};

	const addHeroImage = async (event: any) => {
		try {
			const formData = new FormData();
			formData.append('files', event.target.files[0]);
			formData.append('size', event.target.files[0].size);

			const response = await fetch('https://api.kabbik.com/v3/audiobooks/upload-image-in-stack', {
				method: 'POST',
				body: formData,
			});
			let activityLogPayload = {
				name: 'addHeroImage,herobanner/page.tsx',
				action_type: 'create',
				payload: JSON.stringify({ fileName: event.target.files[0].name }),
				api_end_point: 'https://api.kabbik.com/v3/audiobooks/upload-image-in-stack',
			};
			createActivityLog(activityLogPayload);

			const res = await response.json();

			setImageFile(res.image_file_url);
		} catch (error) {
			return;
		}
	};

	const handleAddHeroBanner = async (e: any) => {
		e.preventDefault();
		try {
			const data = {
				audiobook_id: audioBookId,
				image_url: imageFile,
				title: value,
			};

			const getresponse = await fetch(`/api/routes/herobanner`, {
				method: 'POST',
				body: JSON.stringify(data),
			});
			let activityLogPayload = {
				name: 'handleAddHeroBanner,herobanner/page.tsx',
				action_type: 'create',
				payload: JSON.stringify({ audiobook_id: audioBookId, image_url: imageFile, title: value }),
				api_end_point: '/api/routes/herobanner',
			};
			createActivityLog(activityLogPayload);

			getBannerData();
			closeAddBanner();
			setAudioBookId('');
			setValue('');
			setImageFile(null);
		} catch (error) {}
	};

	const handleToggle = async (index: any) => {
		const tempArr: any = bannerData;
		const item = tempArr[index];

		if (tempArr[index].status == 0) {
			tempArr[index].status = 1;
			item.status = 1;
		} else {
			tempArr[index].status = 1;
			item.status = 0;
		}
		try {
			let data = {
				audiobook_id: item.audiobook_id,
				status: item.status,
			};
			const getresponse = await fetch(`/api/routes/hero-banner-toggle`, {
				method: 'POST',
				body: JSON.stringify(data),
			});
			let activityLogPayload = {
				name: 'handleToggle,herobanner/page.tsx',
				action_type: 'update',
				payload: JSON.stringify({ id: item.id, status: item.status }),
				api_end_point: `/api/routes/popup/${item.id}`,
			};
			createActivityLog(activityLogPayload);
			getBannerData();
		} catch (error) {}
	};

	const deleteHeroImage = async (id: any) => {
		try {
			Swal.fire({
				title: 'Are you sure?',
				text: "You won't be able to revert this!",
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, delete it!',
			}).then(async (result: any) => {
				if (result.isConfirmed) {
					const response = await fetch(`/api/routes/herobanner/${id}`, {
						method: 'DELETE',
					});
					let activityLogPayload = {
						name: 'deleteHeroImage,herobanner/page.tsx',
						action_type: 'delete',
						payload: JSON.stringify({ id }),
						api_end_point: `/api/routes/herobanner/${id}`,
					};
					createActivityLog(activityLogPayload);

					const res = await response.json();
					if (res.statusCode === 200) {
						Swal.fire({
							title: 'Deleted!',
							text: 'Item has been deleted.',
							icon: 'success',
						});
						getBannerData();
					}
				}
			});
		} catch (error) {
			return;
		}
	};

	const handlePageChange = (e: any) => {
		const offsetCount = (e - 1) * itemsPerPage;
		setCurrentPage(e);
		setOffset(offsetCount);
	};

	useEffect(() => {
		getBannerData();
	}, [offset, itemsPerPage]);

	const rows = bannerData?.map((element: any, index: any) => {
		return (
			<>
				<Table.Tr key={element.id}>
					<Table.Td>{element.audiobook_id || 'N/A'}</Table.Td>
					<Table.Td>{element.title || 'N/A'}</Table.Td>
					<Table.Td>
						<Flex direction={'column'} gap={10}>
							<Image
								radius="sm"
								h={200}
								w={200}
								fit="contain"
								p="6px"
								src={element.image_url}
								alt={element.image_url}
							/>
							<input
								ref={fileInputRef}
								type="file"
								onChange={event => handleHeroImage(event, index)}
							/>
						</Flex>
					</Table.Td>
					<Table.Td>
						<Switch
							checked={element.status == 1 ? true : false}
							onChange={() => handleToggle(index)}
							size="xs"
						/>
					</Table.Td>
					<Table.Td>
						<Button
							onClick={() => {
								openDetailsModal();
								setDetails(element);
							}}
						>
							Details
						</Button>
					</Table.Td>
				</Table.Tr>
			</>
		);
	});

	return (
		<>
			{loading ? (
				<Loader />
			) : (
				<>
					<Flex justify={'space-between'}>
						<Title order={1} style={{ marginBottom: 20 }}>
							Hero Banner List
						</Title>
						<Button onClick={openAddBanner} variant="filled">
							Add Hero Banner
						</Button>
					</Flex>
					<Paper withBorder radius="md" p="md">
						<Table.ScrollContainer minWidth={200}>
							<Table>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Audiobook Id</Table.Th>
										<Table.Th>Title</Table.Th>
										<Table.Th>Image</Table.Th>
										<Table.Th>Toggle</Table.Th>
										<Table.Th>Action</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>{rows}</Table.Tbody>
							</Table>
						</Table.ScrollContainer>
						<Divider my="sm" />
						<Pagination
							value={currentPage}
							onChange={handlePageChange}
							total={totalPages}
							siblings={1}
						/>
					</Paper>

					<Modal opened={addBannerOpened} onClose={closeAddBanner} title="" centered>
						<Text size="xl" fw={900} style={{ textAlign: 'center' }}>
							Add Hero Banner
						</Text>
						<Paper shadow="xs" p="xl">
							<form onSubmit={handleAddHeroBanner}>
								<TextInput
									value={audioBookId}
									onChange={(e: any) => setAudioBookId(e.target.value)}
									py={10}
									required
									placeholder="Type Audiobook Id"
								/>
								<Select
									py={10}
									data={[
										{ value: 'subscription', label: 'SUBSCRIPTION' },
										{ value: 'audiobook', label: 'AUDIOBOOK' },
									]}
									placeholder="Pick value"
									value={value}
									onChange={(option: any) => {
										setValue(option);
									}}
								/>
								<input
									style={{ paddingTop: 10, paddingBottom: 10 }}
									type="file"
									onChange={event => addHeroImage(event)}
								/>
								{imageFile && (
									<Image
										style={{ objectFit: 'contain' }}
										height={200}
										width={200}
										src={imageFile}
										alt={imageFile}
									/>
								)}

								<Button type="submit">Create</Button>
							</form>
						</Paper>
					</Modal>
					<Modal
						title="Details"
						opened={detailsModalOpened}
						onClose={closeDetailsModal}
						classNames={{
							title: 'mantine-modal-title',
							close: 'mantine-modal-close',
						}}
						size={'lg'}
						centered
					>
						<Table.ScrollContainer minWidth={100}>
							<Table>
								<Table.Thead>
									<Table.Th>Id</Table.Th>
									<Table.Th>Created at</Table.Th>
									<Table.Th>Updated at</Table.Th>
								</Table.Thead>
								<Table.Tbody>
									<Table.Tr>
										<Table.Td>{details?.id || 'N/A'}</Table.Td>
										<Table.Td>
											{moment(details?.created_at).format('Do MMM YYYY h:mma') || 'N/A'}
										</Table.Td>
										<Table.Td>
											{moment(details?.updated_at).format('Do MMM YYYY h:mma') || 'N/A'}
										</Table.Td>
									</Table.Tr>
								</Table.Tbody>
							</Table>
						</Table.ScrollContainer>
					</Modal>
				</>
			)}
		</>
	);
}
