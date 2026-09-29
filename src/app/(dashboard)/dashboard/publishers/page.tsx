'use client';

import {
	Avatar,
	Button,
	Divider,
	Flex,
	Image,
	Modal,
	Pagination,
	Paper,
	Table,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import moment from 'moment';

import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import { formatPhoneNumber } from '@/utils/globalHelpers';
import { createActivityLog } from '@/helper/Commonfunction';

export default function Publisher() {
	const [isOpenedDetailsModal, { open: openDetailsModal, close: closeDetailsModal }] =
		useDisclosure(false);
	const [publisherModal, setPublisherModal] = useState<any>(null);
	const [publisherList, setPublisherList] = useState([]);
	const [offset, setOffset] = useState(0);
	const [limit, setLimit] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalData, setTotalData] = useState(0);
	const [loading, setLoading] = useState(true);
	const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
	const [id, setId]: any = useState();
	const [name, setName] = useState('');
	const [enName, setEnName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [phone, setPhone] = useState('');
	const [address, setAddress] = useState('');
	const [image, setImage]: any = useState();
	const [addPublisherOpened, { open: openAddPublisher, close: closeAddPublisher }] =
		useDisclosure(false);

	async function getData() {
		try {
			setLoading(true);
			const response = await fetch(`/api/routes/publishers?offset=${offset}&limit=${limit}`);
			const apidata = await response.json();
			setPublisherList(apidata.data);
			setTotalData(apidata.total.count);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}

	const handleEdit = async (event: any, index: any) => {
		try {
			openEdit();
			const tempArr: any = publisherList;
			const item = tempArr[index];

			setId(item.id);
			setName(item.full_name);
			setEmail(item.email);
			setEnName(item.en_name);
			setAddress(item.address);
			setImage(item.imageUrl);
		} catch (error) {}
	};
	const totalPage = Math.ceil(totalData / limit);

	const handlePageChange = (e: any) => {
		const offsetCount = (e - 1) * limit;
		setCurrentPage(e);
		setOffset(offsetCount);
	};

	const handleOpenAddPublisher = async (e: any) => {
		e.preventDefault();

		try {
			let data = {
				full_name: name,
				en_name: enName,
				email: email,
				phone: phone,
				address: address,
				password: password,
				imageUrl: image,
			};

			const response = await fetch(`/api/routes/publishers`, {
				method: 'POST',
				body: JSON.stringify(data),
			});

			let activityLogPayload = {
				name: 'handleOpenAddPublisher',
				action_type: 'create',
				payload: JSON.stringify(data),
				api_end_point: `/api/routes/publishers`,
			};
			createActivityLog(activityLogPayload);
			const apidata = await response.json();

			if (apidata.statusCode === 201) {
				getData();
				closeAddPublisher();
			}
		} catch (error) {}
	};

	const handleEditPublisher = async (e: any) => {
		e.preventDefault();

		try {
			let data = {
				full_name: name,
				en_name: enName,
				email: email,
				phone: phone,
				address: address,

				imageUrl: image,
			};

			const response = await fetch(`/api/routes/publishers/${id}`, {
				method: 'POST',
				body: JSON.stringify(data),
			});

			let activityLogPayload = {
				name: 'handleEditPublisher',
				action_type: 'update',
				payload: JSON.stringify({ id, data }),
				api_end_point: `/api/routes/publishers/${id}`,
			};
			createActivityLog(activityLogPayload);

			const apidata = await response.json();

			if (apidata.statusCode === 200) {
				getData();
				closeEdit();
			}
		} catch (error) {}
	};

	const handleImage = async (event: any) => {
		try {
			const formData = new FormData();
			formData.append('files', event.target.files[0]);
			formData.append('size', event.target.files[0].size);

			const response = await fetch('https://api.kabbik.com/v3/audiobooks/upload-image-in-stack', {
				method: 'POST',
				body: formData,
			});

			let activityLogPayload = {
				name: 'handleImage',
				action_type: 'create',
				payload: JSON.stringify({ fileName: event.target?.files?.[0]?.name }),
				api_end_point: 'https://api.kabbik.com/v3/audiobooks/upload-image-in-stack',
			};

			createActivityLog(activityLogPayload);

			const res = await response.json();

			setImage(res.image_file_url);
		} catch (error) {
			return;
		}
	};

	useEffect(() => {
		getData();
	}, [offset]);

	const rows = publisherList.map((element: any, index: any) => {
		return (
			<Table.Tr key={element.id}>
				<Table.Td>
					<Avatar
						style={{ objectFit: 'contain' }}
						src={element.imageUrl}
						alt={element.imageUrl}
						radius={'xs'}
						size={'100px'}
						visibleFrom="sm"
					/>
					<Avatar
						style={{ objectFit: 'contain' }}
						src={element.imageUrl}
						alt={element.imageUrl}
						radius={'xs'}
						hiddenFrom="sm"
					/>
				</Table.Td>
				<Table.Td>{element.full_name || 'N/A'}</Table.Td>
				<Table.Td>
					{element.phone
						.split(',')
						.map((phone: string) => formatPhoneNumber(phone))
						.join(', ') || 'N/A'}
				</Table.Td>
				<Table.Td style={{ width: '300px' }}>{element.address || 'N/A'}</Table.Td>
				<Table.Td>
					<Flex gap={10}>
						<Button onClick={event => handleEdit(event, index)}>Edit</Button>
						<Button
							onClick={() => {
								setPublisherModal(element);
								openDetailsModal();
							}}
						>
							Details
						</Button>
					</Flex>
				</Table.Td>
			</Table.Tr>
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
							Publisher List
						</Title>
						<Button onClick={openAddPublisher} variant="filled">
							Add Publisher
						</Button>
					</Flex>
					<Paper withBorder radius="md" p="md" pt="0">
						<Table.ScrollContainer minWidth={100}>
							<Table>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Image</Table.Th>
										<Table.Th>Name</Table.Th>
										<Table.Th>Phone</Table.Th>
										<Table.Th>Address</Table.Th>
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
							total={totalPage}
							siblings={1}
						/>
						<Modal opened={addPublisherOpened} onClose={closeAddPublisher} title="" centered>
							<Text size="xl" fw={900} style={{ textAlign: 'center' }}>
								Add Publisher
							</Text>
							<Paper shadow="xs" p="xl">
								<form onSubmit={handleOpenAddPublisher} action="">
									<TextInput
										label="Name"
										py={10}
										onChange={e => setName(e.target.value)}
										required
										placeholder="Name"
									/>
									<TextInput
										label="En Name"
										py={10}
										onChange={e => setEnName(e.target.value)}
										required
										placeholder="En Name"
									/>
									<TextInput
										label="Email"
										type="email"
										py={10}
										onChange={e => setEmail(e.target.value)}
										required
										placeholder="Email"
									/>
									<TextInput
										label="Password"
										type="password"
										py={10}
										onChange={e => setPassword(e.target.value)}
										required
										placeholder="Password"
									/>
									<TextInput
										label="Phone"
										py={10}
										onChange={e => setPhone(e.target.value)}
										required
										placeholder="Phone"
									/>

									<TextInput
										label="Address"
										py={10}
										onChange={e => setAddress(e.target.value)}
										required
										placeholder="Address"
									/>
									<label htmlFor="Image">Image</label>
									<input type="file" onChange={handleImage} />
									{image && <Image src={image} height={200} width={200} alt="Uploaded" />}
									<Button type="submit" py={10}>
										Create
									</Button>
								</form>
							</Paper>
						</Modal>

						<Modal
							opened={editOpened}
							onClose={closeEdit}
							title="Edit Publisher"
							centered
							classNames={{
								title: 'mantine-modal-title',
								close: 'mantine-modal-close',
							}}
							size="lg"
						>
							<Paper shadow="xs" p="xs">
								<form onSubmit={handleEditPublisher} action="">
									<TextInput
										label="Name"
										value={name ? name : ''}
										py={10}
										onChange={e => setName(e.target.value)}
										required
										placeholder="Name"
									/>
									<TextInput
										label="En Name"
										value={enName ? enName : ''}
										py={10}
										onChange={e => setEnName(e.target.value)}
										required
										placeholder="En Name"
									/>
									<TextInput
										label="Email"
										value={email ? email : ''}
										type="email"
										py={10}
										onChange={e => setEmail(e.target.value)}
										required
										placeholder="Email"
									/>

									<TextInput
										label="Address"
										value={address ? address : ''}
										py={10}
										onChange={e => setAddress(e.target.value)}
										required
										placeholder="Address"
									/>
									<Flex direction={{ base: 'column', xs: 'row' }} justify={'space-between'}>
										<Flex direction={'column'} gap={10}>
											<Flex direction={'column'}>
												<label htmlFor="Image">Image</label>
												<input type="file" onChange={handleImage} />
											</Flex>
											<div>
												<Button type="submit" py={10}>
													Update
												</Button>
											</div>
										</Flex>
										<div>{image && <Avatar src={image} alt={image} size={'70px'} />}</div>
									</Flex>
								</form>
							</Paper>
						</Modal>
						<Modal
							title="Publisher Details"
							opened={isOpenedDetailsModal}
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
										<Table.Tr>
											<Table.Th>Id</Table.Th>
											<Table.Th>English Name</Table.Th>
											<Table.Th>Email</Table.Th>
											<Table.Th>Created At</Table.Th>
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										<Table.Tr>
											<Table.Td>{publisherModal?.id}</Table.Td>
											<Table.Td>{publisherModal?.en_name || 'N/A'}</Table.Td>
											<Table.Td>{publisherModal?.email || 'N/A'}</Table.Td>
											<Table.Td>
												{moment(publisherModal?.created_at).format('Do MMM YYYY h:mma') || 'N/A'}
											</Table.Td>
										</Table.Tr>
									</Table.Tbody>
								</Table>
							</Table.ScrollContainer>
						</Modal>
					</Paper>
				</>
			)}
		</>
	);
}
