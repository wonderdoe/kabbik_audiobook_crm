'use client';

import {
	Button,
	Divider,
	Flex,
	Image,
	Modal,
	Paper,
	Space,
	Table,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import { createToast2 } from 'helpers/SweetAlert';
import { createActivityLog } from '@/helper/Commonfunction';

export default function AdminCategory() {
	const [categoryList, setCategoryList] = useState([]);
	const [name, setName] = useState('');
	const [image, setImage] = useState('');
	const [addImage, setAddImage] = useState('');
	const [priority, setPriority] = useState('');

	const [categoryId, setCategoryId] = useState();
	const [updateCategory, { open: openUpdateCategory, close: closeUpdateCategory }] =
		useDisclosure(false);

	const [isLoading, setIsLoading] = useState(true);
	const [addCategory, { open: openAddCategory, close: closeAddCategory }] = useDisclosure(false);
	const [changePriority, { open: openChangePriority, close: closeChangePriority }] =
		useDisclosure(false);

	const handleUpdateData = (element: any) => {
		try {
			setName(element.name);
			setImage(element.thumb_path);
			setCategoryId(element.id);
			openUpdateCategory();
		} catch (error) {}
	};

	async function getData() {
		try {
			const response = await fetch('/api/routes/audio-category', {
				cache: 'no-store',
			});
			const apidata = await response.json();
			setIsLoading(false);
			setCategoryList(apidata);
		} catch (error) {}
	}

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
				name: 'handleAddImage,category/page.tsx',
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

	const handleUpdate = async (e: any) => {
		e.preventDefault();

		try {
			let data = {
				id: categoryId,
				name: name,
				thumb_path: addImage || image,
			};

			const response = await fetch('/api/routes/category-update', {
				method: 'POST',
				body: JSON.stringify(data),
			});
			let activityLogPayload = {
				name: 'handleUpdate,category/page.tsx',
				action_type: 'update',
				payload: JSON.stringify(data),
				api_end_point: '/api/routes/category-update',
			};
			createActivityLog(activityLogPayload);
			const apidata = await response.json();

			if (apidata.statusCode === 200) {
				getData();
				closeUpdateCategory();
			}
		} catch (error) {}
	};

	const handleAddCategory = async (e: any) => {
		e.preventDefault();

		try {
			let data = {
				name: name,
				thumb_path: addImage,
				priority: priority,
			};

			const response = await fetch('/api/routes/add-category', {
				method: 'POST',
				body: JSON.stringify(data),
			});
			let activityLogPayload = {
				name: 'handleAddCategory,category/page.tsx',
				action_type: 'create',
				payload: JSON.stringify(data),
				api_end_point: '/api/routes/add-category',
			};
			createActivityLog(activityLogPayload);
			const apidata = await response.json();
			if (apidata.statusCode === 200) {
				getData();
				closeAddCategory();
			}
		} catch (error) {}
	};

	const handleChangePriority = (element: any) => {
		openChangePriority();
		setPriority(element.priority);
		setCategoryId(element.id);
	};

	const changePriorityApi = async (e: any) => {
		e.preventDefault();
		const data = {
			id: categoryId,
			priority: priority,
		};

		try {
			const response = await fetch('/api/routes/priority-update', {
				method: 'POST',
				body: JSON.stringify(data),
			});
			let activityLogPayload = {
				name: 'changePriorityApi,category/page.tsx',
				action_type: 'update',
				payload: JSON.stringify(data),
				api_end_point: '/api/routes/priority-update',
			};
			createActivityLog(activityLogPayload);

			const apidata = await response.json();
			if (apidata.statusCode === 200) {
				createToast2(apidata.message);
				getData();
				closeChangePriority();
			}
		} catch (error) {}
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch('/api/routes/audio-category', {
					cache: 'no-store',
				});
				const apidata = await response.json();
				setIsLoading(false);
				setCategoryList(apidata);
			} catch (error) {
				console.error(error);
			}
		};
		fetchData();
	}, []);

	const rows = categoryList?.map((element: any) => (
		<Table.Tr key={element.id}>
			<Table.Td>{element.id}</Table.Td>
			<Table.Td>{element.name}</Table.Td>
			<Table.Td>
				<Image
					radius="sm"
					h={150}
					w={'auto'}
					fit="contain"
					src={element.thumb_path ?? ''}
					alt={element.thumb_path ?? ''}
				/>
			</Table.Td>
			<Table.Td>{element.priority}</Table.Td>
			<Table.Td>
				<Flex mih={50} gap="md" justify="flex-start" align="flex-start" direction="row" wrap="wrap">
					<Button onClick={() => handleUpdateData(element)} variant="filled" color="green">
						Update
					</Button>
					<Button onClick={() => handleChangePriority(element)} variant="filled" color="green">
						Change Priority
					</Button>
				</Flex>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<>
			{isLoading ? (
				<Loader />
			) : (
				<>
					<Flex justify={'space-between'}>
						<Title order={1} style={{ marginBottom: 20 }}>
							Category List
						</Title>
						<Button onClick={openAddCategory} variant="filled">
							Add Category
						</Button>
					</Flex>
					<Paper withBorder radius="md" p="md">
						<Space h="md" />
						<Table>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Id</Table.Th>
									<Table.Th>Name</Table.Th>
									<Table.Th>Image</Table.Th>
									<Table.Th>Priority</Table.Th>
									<Table.Th>Action</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>{rows}</Table.Tbody>
						</Table>
						<Divider my="sm" />
					</Paper>
				</>
			)}

			{/* ADD ROLE MODAL STARTS */}

			<Modal opened={addCategory} onClose={closeAddCategory} title="" centered>
				<Text size="xl" fw={900} style={{ textAlign: 'center' }}>
					Add Category
				</Text>
				<Paper shadow="xs" p="xl">
					<form onSubmit={handleAddCategory}>
						<TextInput
							label="Name"
							required
							py={10}
							onChange={e => setName(e.target.value)}
							placeholder="Category Name"
						/>
						<TextInput
							label="Priority"
							required
							py={10}
							value={priority}
							onChange={e => setPriority(e.target.value)}
							placeholder="Priority"
						/>
						<div>
							<span style={{ marginLeft: 10 }}>Thumb Image</span>
							<input required type="file" onChange={handleAddImage} />
							{addImage && (
								<Image
									style={{ paddingBottom: 10 }}
									src={addImage}
									height={200}
									width={200}
									alt={addImage}
								/>
							)}
						</div>
						<Button type="submit" py={10}>
							Create
						</Button>
					</form>
				</Paper>
			</Modal>

			{/* ADD ROLE MODAL ends */}

			{/* ASSIGN MODAL STARTS */}

			<Modal opened={updateCategory} onClose={closeUpdateCategory} title="" centered>
				<Text size="xl" fw={900} style={{ textAlign: 'center' }}>
					Update Category
				</Text>
				<Paper shadow="xs" p="xl">
					<form onSubmit={handleUpdate}>
						<TextInput
							label="Name"
							py={10}
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder="Category Name"
						/>
						<div>
							<span style={{ marginLeft: 10 }}>Present Thumb Image</span>
							<Image style={{ paddingBottom: 10 }} src={image} height={200} width={200} alt="" />
						</div>
						<div>
							<span style={{ marginLeft: 10 }}>Thumb Image</span>
							<input type="file" onChange={handleAddImage} />
							{addImage && (
								<Image
									style={{ paddingBottom: 10 }}
									src={addImage}
									height={200}
									width={200}
									alt="Uploaded"
								/>
							)}
						</div>
						<Button type="submit" py={10}>
							Update
						</Button>
					</form>
				</Paper>
			</Modal>
			{/* ASSIGN MODAL ENDS */}

			{/* CHANGE PRIORITY MODAL */}
			<Modal opened={changePriority} onClose={closeChangePriority} title="" centered>
				<Text size="xl" fw={900} style={{ textAlign: 'center' }}>
					Change Priority
				</Text>
				<Paper shadow="xs" p="xl">
					<form onSubmit={changePriorityApi}>
						<TextInput
							label="Priority"
							required
							py={10}
							value={priority}
							onChange={e => setPriority(e.target.value)}
							placeholder="Priority"
						/>

						<Button type="submit" py={10}>
							change
						</Button>
					</form>
				</Paper>
			</Modal>
		</>
	);
}
