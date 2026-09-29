'use client';

import {
	Avatar,
	Button,
	Divider,
	Flex,
	Image,
	InputWrapper,
	Modal,
	Pagination,
	Paper,
	Table,
	Textarea,
	TextInput,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import moment from 'moment';

import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import { createActivityLog } from '@/helper/Commonfunction';

export default function Authors() {
	const [authorList, setAuthorList] = useState([]);
	const [offset, setOffset] = useState(0);
	const [limit, setLimit] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalData, setTotalData] = useState(0);
	const [loading, setLoading] = useState(true);
	const [addImage, setAddImage]: any = useState('');
	const [editImage, setEditImage]: any = useState('');
	const [name, setName] = useState('');
	const [enName, setEnName] = useState('');
	const [description, setDescription] = useState('');
	const [id, setId]: any = useState();
	const [showFullDescription, setShowFullDescription] = useState<number>();
	const [addAuthorModal, { open: openAuthorModal, close: closeAuthorModal }] = useDisclosure(false);
	const [editAuthorModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);

	const rows = authorList.map((element: any, index: any) => {
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
				<Table.Td>{element.name || 'N/A'}</Table.Td>
				<Table.Td>{element.en_name || 'N/A'}</Table.Td>
				<Table.Td>
					<div
						className={`${showFullDescription === index ? '' : 'three-line-ellipsis'}`}
						style={{ width: '200px' }}
						onClick={() =>
							setShowFullDescription(index === showFullDescription ? undefined : index)
						}
					>
						{element.description || 'N/A'}
					</div>
				</Table.Td>
				<Table.Td>{moment(element.created_at).format('Do MMM YYYY h:mma') || 'N/A'}</Table.Td>
				<Table.Td>
					<Button onClick={() => handleEditId(index)}>Edit</Button>
				</Table.Td>
			</Table.Tr>
		);
	});

	const handleEditId = (index: any) => {
		try {
			openEditModal();
			const tempArr = authorList;
			const item = tempArr[index] as any;

			setId(item.id);
			setName(item.name);
			setEnName(item.en_name);
			setDescription(item.description);
			setEditImage(item.imageUrl);
		} catch (error) {}
	};

	async function getData() {
		try {
			const response = await fetch(`/api/routes/authors?offset=${offset}&limit=${limit}`);
			const apidata = await response.json();
			setLoading(false);
			setAuthorList(apidata.data);
			setTotalData(apidata.total.count);
		} catch (error) {}
	}

	const totalPage = Math.ceil(totalData / limit);

	const handlePageChange = (e: any) => {
		const offsetCount = (e - 1) * limit;
		setCurrentPage(e);
		setOffset(offsetCount);
	};

	const handleAddImage = async (event: any) => {
		try {
			const formData = new FormData();
			formData.append('files', event.target.files[0]);
			formData.append('size', event.target.files[0].size);

			const response = await fetch('https://api.kabbik.com/v3/audiobooks/upload-image-in-stack', {
				method: 'POST',
				body: formData,
			});
			let activityLogPayload = {
				name: 'handleAddImage,authors/page.tsx',
				action_type: 'create',
				payload: JSON.stringify({ fileName: event.target.files[0]?.name }),
				api_end_point: 'https://api.kabbik.com/v3/audiobooks/upload-image-in-stack',
			};
			createActivityLog(activityLogPayload);

			const res = await response.json();

			setAddImage(res.image_file_url);
		} catch (error) {
			return;
		}
	};

	const handleEditImage = async (event: any) => {
		try {
			const formData = new FormData();
			formData.append('files', event.target.files[0]);
			formData.append('size', event.target.files[0].size);

			const response = await fetch('https://api.kabbik.com/v3/audiobooks/upload-image-in-stack', {
				method: 'POST',
				body: formData,
			});
			let activityLogPayload = {
				name: 'handleEditImage,authors/page.tsx',
				action_type: 'update',
				payload: JSON.stringify({ fileName: event.target.files[0]?.name }),
				api_end_point: 'https://api.kabbik.com/v3/audiobooks/upload-image-in-stack',
			};
			createActivityLog(activityLogPayload);

			const res = await response.json();

			setEditImage(res.image_file_url);
		} catch (error) {
			return;
		}
	};

	const handleAddAuthor = async (event: any) => {
		event.preventDefault();

		try {
			let data = {
				name: name,
				description: description,
				en_name: enName,
				imageUrl: addImage,
			};

			const response = await fetch(`/api/routes/authors`, {
				method: 'POST',
				body: JSON.stringify(data),
			});
			let activityLogPayload = {
				name: 'handleAddAuthor,authors/page.tsx',
				action_type: 'create',
				payload: JSON.stringify(data),
				api_end_point: `/api/routes/authors`,
			};
			createActivityLog(activityLogPayload);
			const apidata = await response.json();

			if (apidata.statusCode === 201) {
				getData();
				closeAuthorModal();
			}
		} catch (error) {}
	};

	const handleEditAuthor = async (event: any) => {
		event.preventDefault();
		try {
			let data = {
				name: name,
				description: description,
				en_name: enName,
				imageUrl: editImage,
			};

			const response = await fetch(`/api/routes/authors/${id}`, {
				method: 'POST',
				body: JSON.stringify(data),
			});

			let activityLogPayload = {
				name: 'handleEditAuthor,authors/page.tsx',
				action_type: 'update',
				payload: JSON.stringify(data),
				api_end_point: `/api/routes/authors/${id}`,
			};
			createActivityLog(activityLogPayload);

			const apidata = await response.json();

			if (apidata.statusCode === 201) {
				closeEditModal();
				getData();
			}
		} catch (error) {}
	};
	useEffect(() => {
		getData();
	}, [offset]);

	return (
		<>
			{loading ? (
				<Loader />
			) : (
				<>
					<Flex justify={'space-between'}>
						<Title order={1} style={{ marginBottom: 20 }}>
							Author List
						</Title>
						<Button onClick={openAuthorModal} variant="filled">
							Add Author
						</Button>
					</Flex>
					<Paper withBorder radius="md" p="md" pt="0">
						<Table.ScrollContainer minWidth={100}>
							<Table>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Image</Table.Th>
										<Table.Th>Name</Table.Th>
										<Table.Th>En Name</Table.Th>
										<Table.Th>Description</Table.Th>
										<Table.Th>Created At</Table.Th>
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
					</Paper>

					<Modal
						opened={addAuthorModal}
						onClose={closeAuthorModal}
						title="Add Author"
						size={'lg'}
						centered
						classNames={{ title: 'mantine-modal-title', close: 'mantine-modal-close' }}
					>
						<form onSubmit={handleAddAuthor} action="">
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
							<Textarea
								label="Description"
								py={10}
								autosize
								onChange={e => setDescription(e.target.value)}
								required
								placeholder="Description"
							/>

							<InputWrapper label="Image" required>
								<Flex
									mih={50}
									gap="md"
									justify="flex-start"
									align="flex-start"
									direction="column"
									wrap="wrap"
								>
									<input type="file" onChange={handleAddImage} />

									{addImage && (
										<Image
											style={{ paddingBottom: 10 }}
											src={addImage}
											height={150}
											width={'auto'}
											alt={addImage}
											radius={'md'}
										/>
									)}
								</Flex>
							</InputWrapper>
							<Button type="submit" py={10}>
								Create
							</Button>
						</form>
					</Modal>

					<Modal
						opened={editAuthorModal}
						onClose={closeEditModal}
						title="Edit Author"
						size={'lg'}
						centered
						classNames={{ title: 'mantine-modal-title', close: 'mantine-modal-close' }}
					>
						<form onSubmit={handleEditAuthor} action="">
							<TextInput
								label="Name"
								py={10}
								value={name ? name : ''}
								onChange={e => setName(e.target.value)}
								required
								placeholder="Name"
							/>
							<TextInput
								label="En Name"
								py={10}
								value={enName ? enName : ''}
								onChange={e => setEnName(e.target.value)}
								required
								placeholder="En Name"
							/>
							<Textarea
								label="Description"
								value={description ? description : ''}
								py={10}
								autosize
								onChange={e => setDescription(e.target.value)}
								required
								placeholder="Description"
							/>

							<InputWrapper label="Image" required>
								<Flex justify={'space-between'}>
									<Flex direction={'column'} justify={'space-between'}>
										<input type="file" onChange={handleEditImage} />
										<Button type="submit" py={10}>
											Update
										</Button>
									</Flex>
									{editImage && (
										<Image
											style={{ paddingBottom: 10 }}
											src={editImage}
											height={150}
											width={'auto'}
											alt={editImage}
											radius={'md'}
										/>
									)}
								</Flex>
							</InputWrapper>
						</form>
					</Modal>
				</>
			)}
		</>
	);
}
