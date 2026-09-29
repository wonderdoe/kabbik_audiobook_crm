'use client';

import {
	ActionIcon,
	Button,
	Center,
	Divider,
	Flex,
	Modal,
	Pagination,
	Paper,
	Space,
	Table,
	Text,
	TextInput,
	Title,
} from '@mantine/core';

import { Loader as MantineLoader } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { CircularProgress, Dialog, Slide } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { IconSearch, IconX } from '@tabler/icons-react';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { forwardRef } from 'react';
import { SubscribeForm } from '@/components/Form/SubscribeForm';
import Loader from '@/components/Loader';
import { formatPhoneNumber } from '@/utils/globalHelpers';

const Transition = forwardRef(function Transition(
	props: TransitionProps & {
		children: React.ReactElement;
	},
	ref: React.Ref<unknown>,
) {
	return <Slide direction="up" ref={ref} {...props} />;
});

export default function Subscription() {
	const [detailsModalOpened, { open: openDetailsModal, close: closeDetailsModal }] =
		useDisclosure(false);
	const [subscribeModalOpened, { open: openSubscribeModal, close: closeSubscribeModal }] =
		useDisclosure(false);
	const [isLoadingDetails,setIsLoadingDetails]=useState(false);

	const [menuData, setMenuData] = useState([]);
	const [filteredData, setFilteredData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [loadingDetails, setLoadingDetails] = useState(true);
	const [details, setDetails] = useState<any>(null);
	const [initialLoader, setInitialLoader] = useState(false);

	const [detailsData, setDetailsData] = useState<any>();
	const [totalUser, setTotalUser] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);

	const limit = 10;
	const [offset, setOffset] = useState(0);
	const [searchKey, setSearchKey] = useState('');

	const [userId, setUserId] = useState<number>();
	const [modifiedBy, setModifiedBy] = useState<number>();

	const totalPages = Math.ceil(totalUser / limit);
	const displayData = searchKey ? filteredData : menuData;

	useEffect(() => {
		setModifiedBy(parseInt(localStorage.getItem('id')!));
	}, []);

	useEffect(() => {
		const getData = async () => {
			try {
				const response = await fetch(`/api/routes/subscription?offset=${offset}&limit=${limit}`);
				if (!response.ok) {
					setInitialLoader(false);
					console.error('response was not ok');
				}
				const apidata = await response.json();
				setInitialLoader(false);
				setFilteredData(apidata.response.results.result);
				setMenuData(apidata.response.results.result);
				setTotalUser(apidata.response.results.totalUser.total_count);
			} catch (error) {
				setInitialLoader(false);
				console.error('Error fetching data:', error);
			}
		};
		// getData();
	}, [currentPage, limit, offset]);

	const handlePageChange = (e: any) => {
		const offsetCount = (e - 1) * limit;
		setCurrentPage(e);
		setOffset(offsetCount);
	};

	const handleDetails = async (element: any) => {
		setIsLoadingDetails(true);
		setDetails(element);
		openDetailsModal();
		try {
			const response = await fetch(`/api/routes/subuserdetails/${element.id}`);
			const apidata = await response.json();
			if (apidata.statusCode === 200) {
				setLoadingDetails(false);
				setDetailsData(apidata.results);
			} else {
				console.error('Error fetching data:', apidata.message);
			}
		} catch (error) {
			console.error('Error fetching data:', error);
		}finally{setIsLoadingDetails(false)}
	};

	const handleSubscribe = async (id: number) => {
		setUserId(id);
		openSubscribeModal();
	};
	const detailsTable: any =isLoadingDetails?(
		<div style={{margin:'20px auto',width:'100%'}}>
			<CircularProgress/>
		</div>
	): detailsData?.length<=0?(
		<p style={{color:'red',textAlign:'center'}}>No Subscription history found</p>
	) :detailsData?.map((element: any) => (
		<Table.Tr style={{ textAlign: 'center' }} key={element.userId}>
			<Table.Td style={{ textAlign: 'center' }}>
				{moment(element.created_at).format('DD MMMM YYYY')}
			</Table.Td>

			<Table.Td style={{ textAlign: 'center' }}>
				{element.name}
			</Table.Td>
			<Table.Td style={{ textAlign: 'center' }}>
				{element.is_subscribed === 1 ? 'Yes' : 'No'}
			</Table.Td>

			<Table.Td style={{ textAlign: 'center' }}>{element.payer || '-'}</Table.Td>
			<Table.Td style={{ textAlign: 'center' }}>{element.payment_status || '-'}</Table.Td>
			<Table.Td style={{ textAlign: 'center' }}>{element.is_first_payment || '-'}</Table.Td>
			<Table.Td style={{ textAlign: 'center' }}>{element.payment_method || '-'}</Table.Td>
			<Table.Td style={{ textAlign: 'center' }}>{element.sub_request_id || '-'}</Table.Td>
			<Table.Td style={{ textAlign: 'center' }}>{element.amount || '-'}</Table.Td>
			{/* <Table.Td style={{ textAlign: 'center' }}>{element.reverseTrxId || 'N/A'}</Table.Td> */}
			<Table.Td style={{ textAlign: 'center' }}>{element.is_recurring || 'N/A'}</Table.Td>

			<Table.Td style={{ textAlign: 'center' }}>
				{moment(element.nextPaymentDate).format('DD MMMM YYYY')}
			</Table.Td>
			{/* <Table.Td style={{ textAlign: 'center' }}>{element.type || 'N/A'}</Table.Td> */}
		</Table.Tr>
	));

	const rows = displayData?.map((element: any) => (
		<>
			<Table.Tr key={element.id}>
				<Table.Td>{element.id || 'N/A'}</Table.Td>
				<Table.Td>{element.user_name || 'N/A'}</Table.Td>
				<Table.Td>{formatPhoneNumber(element.phone_no) || '-'}</Table.Td>
				<Table.Td>{element.user_email|| '-'}</Table.Td>
				<Table.Td>{element.is_subscribed === 1 ? 'Yes' : 'No'}</Table.Td>
				<Table.Td>
					<Flex gap={6}>
						<Button
							size="sm"
							variant="light"
							color="red"
							style={{ border: '1px solid #ff000099', fontSize: '12px' }}
							onClick={() => handleSubscribe(element.id)}
						>
							Subscribe
						</Button>
						<Button
							size="sm"
							variant="light"
							style={{ border: '1px solid green', fontSize: '12px' }}
							onClick={() => handleDetails(element)}
						>
							Details
						</Button>
					</Flex>
				</Table.Td>
			</Table.Tr>

			<Dialog
				fullScreen
				open={detailsModalOpened}
				onClose={closeDetailsModal}
				TransitionComponent={Transition}
			>
				<ActionIcon
					variant="white"
					onClick={closeDetailsModal}
					style={{ margin: '10px 0 0 10px', color: 'black' }}
				>
					<IconX />
				</ActionIcon>
				<Text mb={15} size="xl" fw={900} style={{ fontWeight: 'bold', textAlign: 'center' }}>
					Extra Details
				</Text>
				<div style={{ display: 'flex', justifyContent: 'center', margin: '0 auto', width: '50%' }}>
					<Table mb={50}>
						<Table.Thead>
							<Table.Th>Id</Table.Th>
							<Table.Th>User Name</Table.Th>
							<Table.Th>Email</Table.Th>
							<Table.Th>Created At</Table.Th>
						</Table.Thead>
						<Table.Tbody>
							<Table.Td>{details?.id || 'N/A'}</Table.Td>
							<Table.Td>{details?.user_name || 'N/A'}</Table.Td>
							<Table.Td>{details?.user_email || 'N/A'}</Table.Td>
							<Table.Td>
								{moment(details?.created_at).format('Do MMM YYYY h:mma') || 'N/A'}
							</Table.Td>
						</Table.Tbody>
					</Table>
				</div>
				<Text mb={15} size="xl" fw={900} style={{ fontWeight: 'bold', textAlign: 'center' }}>
					Subscription Details
				</Text>
				<Table.ScrollContainer minWidth={300}>
					<Table m={20}>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Created At</Table.Th>
								<Table.Th>Package</Table.Th>
								<Table.Th>Is Subscribed</Table.Th>
								<Table.Th>Payment Number</Table.Th>
								<Table.Th>Payment Status</Table.Th>
								<Table.Th>FirstPayment</Table.Th>
								<Table.Th>Payment Method</Table.Th>
								<Table.Th>Subscription RequestId</Table.Th>
								<Table.Th>Amount</Table.Th>
								<Table.Th>Recurring Payment</Table.Th>
								{/* <Table.Th>ReversTrxDate</Table.Th> */}
								<Table.Th>Next Payment Date</Table.Th>
								{/* <Table.Th>Type</Table.Th> */}
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>{detailsTable}</Table.Tbody>
					</Table>
				</Table.ScrollContainer>
			</Dialog>

			<Modal
				overlayProps={{
					backgroundOpacity: 0.1,
					blur: 0,
				}}
				size={'80%'}
				opened={subscribeModalOpened}
				onClose={closeSubscribeModal}
				centered
			>
				<SubscribeForm userId={userId!} modifiedBy={modifiedBy!} />
			</Modal>
		</>
	));

	function duration(purchaseDate: any, nextPurchaseDate: any) {
		const purchaseTime = moment(purchaseDate);
		const nextPurchaseTime = moment(nextPurchaseDate);

		const timeDifferenceMilliseconds = nextPurchaseTime.diff(purchaseTime);
		const timeDifferenceDuration = moment.duration(timeDifferenceMilliseconds);

		const daysDifference = timeDifferenceDuration.asDays();

		let formattedTimeDifference;
		if (daysDifference < 1) {
			formattedTimeDifference = 'Less than a day';
		} else if (daysDifference === 1) {
			formattedTimeDifference = '1 day';
		} else {
			formattedTimeDifference = `${Math.floor(daysDifference)} days`;
		}
		return formattedTimeDifference;
	}

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const searchKey = formData.get('searchkey');
		setSearchKey(searchKey as string);
		setLoading(true);
		try {
			const response = await fetch(
				`/api/routes/searchuser?offset=${offset}&limit=${limit}&searchkey=${searchKey}`,
			);
			const apidata = await response.json();
			setFilteredData(apidata.results);
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

	return (
		<div>
			<Title order={1}>Subscription</Title>
			<form style={{ display: 'flex' }} onSubmit={handleSubmit}>
				<TextInput
					name="searchkey"
					mt="md"
					placeholder="Search by name, email or number..."
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
							<Table verticalSpacing="xs" horizontalSpacing="xs">
								<Table.Thead>
									<Table.Tr>
										<Table.Th>ID</Table.Th>
										<Table.Th>Login Id</Table.Th>
										<Table.Th>User Phone</Table.Th>
										<Table.Th>User Email</Table.Th>
										<Table.Th>Subscription</Table.Th>
										<Table.Th>Action</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{displayData?.length > 0 ? (
										rows
									) : (
										<Center>
											<Text>No Data Found</Text>
										</Center>
									)}
								</Table.Tbody>
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
		</div>
	);
}
