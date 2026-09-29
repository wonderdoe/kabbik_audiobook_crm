'use client';

import {
	Button,
	Divider,
	Flex,
	Image,
	Modal,
	Pagination,
	Paper,
	Switch,
	Table,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import moment from 'moment';

import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import { createActivityLog } from '@/helper/Commonfunction';

export default function FeaturedBook() {
	const [featureList, setFeatureList] = useState([]);
	const [offset, setOffset] = useState(0);
	const [limit, setLimit] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalData, setTotalData] = useState(0);
	const [loading, setLoading] = useState(true);

	const [addImage, setAddImage]: any = useState('');
	const [audioBookId, setAudioBookId] = useState<any>();
	const [value, setValue] = useState<any>();
	const [addFeaturedImage, { open: openAddFeaturedImage, close: closeAddFeaturedImage }] =
		useDisclosure(false);

	// openAuthorModal
	const handleToggle = async (index: any) => {
		const tempArr: any = featureList;
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
			const getresponse = await fetch(`/api/routes/toggle-feature-image`, {
				method: 'POST',
				body: JSON.stringify(data),
			});
			let activityLogPayload = {
				name: 'handleToggle,featured/page.tsx',
				action_type: 'update',
				payload: JSON.stringify(data),
				api_end_point: `/api/routes/toggle-feature-image`,
			};
			createActivityLog(activityLogPayload);
			getData();
		} catch (error) {}
	};

	const rows = featureList.map((element: any, index: any) => {
		return (
			<Table.Tr key={element.id}>
				<Table.Td>{element.audiobook_id}</Table.Td>
				<Table.Td>{element.name}</Table.Td>
				<Table.Td>
					<Image
						style={{ objectFit: 'contain' }}
						height={150}
						width={'auto'}
						src={element.thumb_path}
						alt={element.thumb_path}
						radius={'md'}
					/>
				</Table.Td>
				<Table.Td>{element.author_name}</Table.Td>
				<Table.Td>{moment(element.created_at).format('Do MMM YYYY h:mma')}</Table.Td>
				<Table.Td>
					<Switch
						checked={element.status == 1 ? true : false}
						onChange={() => handleToggle(index)}
						size="xs"
					/>
				</Table.Td>
			</Table.Tr>
		);
	});

	async function getData() {
		try {
			const response = await fetch(`/api/routes/featured-image`);
			const apidata = await response.json();

			setLoading(false);
			setFeatureList(apidata);
		} catch (error) {}
	}

	const totalPage = Math.ceil(totalData / limit);

	const handlePageChange = (e: any) => {
		const offsetCount = (e - 1) * limit;
		setCurrentPage(e);
		setOffset(offsetCount);
	};

	const handleAddFeaturedImage = async (event: any) => {
		event.preventDefault();

		try {
			let data = {
				audiobook_id: audioBookId,
			};

			const response = await fetch(`/api/routes/featured-image`, {
				method: 'POST',
				body: JSON.stringify(data),
			});
			let activityLogPayload = {
				name: 'handleAddFeaturedImage,featured/page.tsx',
				action_type: 'create',
				payload: JSON.stringify(data),
				api_end_point: '/api/routes/featured-image',
			};
			createActivityLog(activityLogPayload);
			const apidata = await response.json();

			if (apidata.statusCode == 201) {
				getData();
				closeAddFeaturedImage();
			}
		} catch (error) {}
	};

	useEffect(() => {
		getData();
	}, []);

	return (
		<>
			{loading ? (
				<Loader />
			) : (
				<>
					<Flex justify={'space-between'}>
						<Title order={1} style={{ marginBottom: 20 }}>
							Featured Book List
						</Title>
						<Button onClick={openAddFeaturedImage} variant="filled">
							Add Featured Image
						</Button>
					</Flex>
					<Paper withBorder radius="md" p="md">
						<Table>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Id</Table.Th>
									<Table.Th>Name</Table.Th>
									<Table.Th>Image</Table.Th>
									<Table.Th>Author Name</Table.Th>
									<Table.Th>Created At</Table.Th>
									<Table.Th>Action</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>{rows}</Table.Tbody>
						</Table>
						<Divider my="sm" />
						<Pagination
							value={currentPage}
							onChange={handlePageChange}
							total={totalPage}
							siblings={1}
						/>
					</Paper>

					<Modal opened={addFeaturedImage} onClose={closeAddFeaturedImage} title="" centered>
						<Text size="xl" fw={900} style={{ textAlign: 'center' }}>
							Add Featured Image
						</Text>

						<form onSubmit={handleAddFeaturedImage} action="">
							<TextInput
								label="Audio Book Id"
								py={10}
								onChange={e => setAudioBookId(e.target.value)}
								required
								placeholder="Audio Book Id"
							/>

							<Button type="submit" py={10}>
								Create
							</Button>
						</form>
					</Modal>
				</>
			)}
		</>
	);
}
