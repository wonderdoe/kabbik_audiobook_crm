'use client';

import {
	Button,
	Center,
	Divider,
	Image,
	Modal,
	Pagination,
	Paper,
	Space,
	Table,
	TextInput,
	Title,
} from '@mantine/core';
import { Loader as MantineLoader } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import { useDisclosure } from '@mantine/hooks';

export default function ManualSubscriptionLog() {
	const limit = 10;
	const [offset, setOffset] = useState(0);
	const [searchKey, setSearchKey] = useState('');
	const [totalUser, setTotalUser] = useState(0);
	const [initialLoader, setInitialLoader] = useState(true);
	const [loading, setLoading] = useState(false);
	const [menuData, setMenuData] = useState([]);
	const [filteredData, setFilteredData] = useState([]);
	const displayData = searchKey ? filteredData : menuData;
	const [currentPage, setCurrentPage] = useState(1);
	const totalPages = Math.ceil(totalUser / limit);
	const [details, setDetails] = useState<any>(null);

	const [detailsModalOpened, { open: openDetailsModal, close: closeDetailsModal }] =
		useDisclosure(false);

	useEffect(() => {
		const getData = async () => {
			try {
				const response = await fetch(
					`/api/routes/manual-subscription-log?offset=${offset}&limit=${limit}`,
				);
				if (!response.ok) {
					setInitialLoader(false);
					throw new Error('Failed to fetch data');
				}
				const apidata = await response.json();
				setInitialLoader(false);
				setMenuData(apidata.response.response);
				setTotalUser(apidata.response.totalCount[0].total_manual_subscription);
			} catch (error) {
				setInitialLoader(false);
				console.error('Error fetching data:', error);
			}
		};
		getData();
	}, [limit, offset]);

	const handlePageChange = (e: any) => {
		const offsetCount = (e - 1) * limit;
		setCurrentPage(e);
		setOffset(offsetCount);
	};

	const handleSearch = async (e: any) => {
		try {
			setSearchKey(e.target.value);
			setLoading(true);
			const response = await fetch(
				`/api/routes/subuser/manual-subscription-log?offset=${offset}&limit=${limit}&searchkey=${searchKey}`,
			);
			setLoading(false);
			const apiData = await response.json();
			setFilteredData(apiData.results.result);
			setMenuData(apiData.results.result);
		} catch (error) {
			console.error('Error occurred while searching:', error);
			setLoading(false);
		}
	};

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const searchKey = formData.get('searchkey');
		setSearchKey(searchKey as string);
		setLoading(true);
		try {
			const response = await fetch(
				`/api/routes/search-manual-subscription-log?offset=${offset}&limit=${limit}&searchkey=${searchKey}`,
			);
			const apidata = await response.json();
			setFilteredData(apidata);
		} catch (error: any) {
			if (error.name === 'AbortError') {
				console.error('Error occurred for aborting request: ', error);
			} else {
				console.error('Error occurred while searching:', error);
			}
		} finally {
			setLoading(false);
		}
	};

	const manualRows = displayData?.map((element: any) => (
		<Table.Tr key={element.id}>
			<Table.Td>{element.user_id}</Table.Td>
			<Table.Td>
				{element.package_id === '1'
					? 'Monthly'
					: element.package_id === '2'
						? 'Half Yearly'
						: 'Yearly'}
			</Table.Td>
			<Table.Td>{element.payment_method}</Table.Td>
			<Table.Td maw={300}>
				<Image fit="contain" height={80} src={element.payment_proof} alt={element.payment_method} />
			</Table.Td>
			<Table.Td>
				<Button
					onClick={() => {
						setDetails(element);
						openDetailsModal();
					}}
				>
					Details
				</Button>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<div>
			<Title order={1}>Manual Subscription</Title>
			<form style={{ display: 'flex' }} onSubmit={handleSubmit}>
				<TextInput
					name="searchkey"
					mt="md"
					placeholder="Search by subscription id or transaction id..."
					rightSection={<IconSearch size={16} />}
					style={{ width: '100%' }}
				/>
			</form>
			<Space h="md" />
			<Paper withBorder radius="md" p="md">
				{initialLoader ? (
					<Loader />
				) : loading ? (
					<Center>
						<MantineLoader size={24} />
					</Center>
				) : (
					<>
						<Table.ScrollContainer minWidth={800}>
							<Table verticalSpacing="xs" horizontalSpacing="xs" captionSide="top">
								<Table.Caption>{displayData?.length === 0 ? 'No data found' : ''}</Table.Caption>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>User Id</Table.Th>
										<Table.Th>Package Id</Table.Th>
										<Table.Th>Payment Method</Table.Th>
										<Table.Th>Proof Of Payment</Table.Th>
										<Table.Th>Action</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>{displayData?.length > 0 ? manualRows : null}</Table.Tbody>
							</Table>
						</Table.ScrollContainer>
						<Divider my="sm" />
						<Pagination
							value={currentPage}
							onChange={handlePageChange}
							total={totalPages}
							siblings={1}
						/>
					</>
				)}
			</Paper>

			<Modal
				title="Details"
				opened={detailsModalOpened}
				onClose={closeDetailsModal}
				size="xl"
				centered
				classNames={{ title: 'mantine-modal-title', close: 'mantine-modal-close' }}
			>
				<Table.ScrollContainer minWidth={200}>
					<Table>
						<Table.Thead>
							<Table.Th>Subscription Id</Table.Th>
							<Table.Th>Transaction Id</Table.Th>
							<Table.Th>Subscription Date</Table.Th>
							<Table.Th>Created At</Table.Th>
							<Table.Th>Modified By</Table.Th>
						</Table.Thead>
						<Table.Tbody>
							<Table.Td>{details?.subscription_id}</Table.Td>
							<Table.Td>{details?.transaction_id}</Table.Td>
							<Table.Td>{moment(details?.subscription_date).format('Do MMM YYYY h:mma')}</Table.Td>
							<Table.Td>{moment(details?.created_at).format('Do MMM YYYY h:mma')}</Table.Td>
							<Table.Td>{details?.modified_by}</Table.Td>
						</Table.Tbody>
					</Table>
				</Table.ScrollContainer>
			</Modal>
		</div>
	);
}
