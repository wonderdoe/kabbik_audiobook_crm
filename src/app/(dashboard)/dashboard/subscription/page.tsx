'use client';
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	InputAdornment,
	Pagination,
	Slide,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import { MainCard } from '@/components/mantis/MainCard';
import { DetailGrid } from '@/components/ui/DetailGrid';
import { PageContainer } from '@/components/PageContainer/PageContainer';

import { useDisclosure } from '@/hooks/use-disclosure';
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
			<Loader />
		</div>
	): detailsData?.length<=0?(
		<p style={{color:'red',textAlign:'center'}}>No Subscription history found</p>
	) :detailsData?.map((element: any) => (
		<TableRow style={{ textAlign: 'center' }} key={element.userId}>
			<TableCell style={{ textAlign: 'center' }}>
				{moment(element.created_at).format('DD MMMM YYYY')}
			</TableCell>

			<TableCell style={{ textAlign: 'center' }}>
				{element.name}
			</TableCell>
			<TableCell style={{ textAlign: 'center' }}>
				{element.is_subscribed === 1 ? 'Yes' : 'No'}
			</TableCell>

			<TableCell style={{ textAlign: 'center' }}>{element.payer || '-'}</TableCell>
			<TableCell style={{ textAlign: 'center' }}>{element.payment_status || '-'}</TableCell>
			<TableCell style={{ textAlign: 'center' }}>{element.is_first_payment || '-'}</TableCell>
			<TableCell style={{ textAlign: 'center' }}>{element.payment_method || '-'}</TableCell>
			<TableCell style={{ textAlign: 'center' }}>{element.sub_request_id || '-'}</TableCell>
			<TableCell style={{ textAlign: 'center' }}>{element.amount || '-'}</TableCell>
			{/* <TableCell style={{ textAlign: 'center' }}>{element.reverseTrxId || 'N/A'}</TableCell> */}
			<TableCell style={{ textAlign: 'center' }}>{element.is_recurring || 'N/A'}</TableCell>

			<TableCell style={{ textAlign: 'center' }}>
				{moment(element.nextPaymentDate).format('DD MMMM YYYY')}
			</TableCell>
			{/* <TableCell style={{ textAlign: 'center' }}>{element.type || 'N/A'}</TableCell> */}
		</TableRow>
	));

	const rows = displayData?.map((element: any) => (
		<>
			<TableRow key={element.id}>
				<TableCell>{element.id || 'N/A'}</TableCell>
				<TableCell>{element.user_name || 'N/A'}</TableCell>
				<TableCell>{formatPhoneNumber(element.phone_no) || '-'}</TableCell>
				<TableCell>{element.user_email|| '-'}</TableCell>
				<TableCell>
					<Chip
						size="small"
						variant="outlined"
						color={element.is_subscribed === 1 ? 'success' : 'default'}
						label={element.is_subscribed === 1 ? 'Subscribed' : 'Not subscribed'}
					/>
				</TableCell>
				<TableCell>
					<Stack direction="row" flexWrap="wrap" spacing={6}>
						<Button
							variant="body2"
							variant="outlined"
							color="red"
							style={{ border: '1px solid #ff000099', fontSize: '12px' }}
							onClick={() => handleSubscribe(element.id)}
						>
							Subscribe
						</Button>
						<Button
							variant="body2"
							variant="outlined"
							style={{ border: '1px solid green', fontSize: '12px' }}
							onClick={() => handleDetails(element)}
						>
							Details
						</Button>
					</Stack>
				</TableCell>
			</TableRow>

			<Dialog
				fullScreen
				open={detailsModalOpened}
				onClose={closeDetailsModal}
				TransitionComponent={Transition}
			>
				<IconButton
					variant="white"
					onClick={closeDetailsModal}
					style={{ margin: '10px 0 0 10px', color: 'black' }}
				>
					<IconX />
				</IconButton>
				<Typography mb={15} maxWidth="xl" sx={{ width: "100%" }} fontWeight={900} style={{ fontWeight: 'bold', textAlign: 'center' }}>
					Extra Details
				</Typography>
				<Box sx={{ px: 3, maxWidth: 720, mx: 'auto' }}>
					<DetailGrid
						title="User"
						fields={[
							{ label: 'Id', value: details?.id },
							{ label: 'User name', value: details?.user_name },
							{ label: 'Email', value: details?.user_email },
							{
								label: 'Created at',
								value: details?.created_at
									? moment(details.created_at).format('Do MMM YYYY h:mma')
									: 'N/A',
							},
						]}
					/>
				</Box>
				<Typography mb={15} maxWidth="xl" sx={{ width: "100%" }} fontWeight={900} style={{ fontWeight: 'bold', textAlign: 'center' }}>
					Subscription Details
				</Typography>
				<TableContainer sx={{ minWidth: 300 }}>
					<Table m={20}>
						<TableHead>
							<TableRow>
								<TableCell component="th">Created At</TableCell>
								<TableCell component="th">Package</TableCell>
								<TableCell component="th">Is Subscribed</TableCell>
								<TableCell component="th">Payment Number</TableCell>
								<TableCell component="th">Payment Status</TableCell>
								<TableCell component="th">FirstPayment</TableCell>
								<TableCell component="th">Payment Method</TableCell>
								<TableCell component="th">Subscription RequestId</TableCell>
								<TableCell component="th">Amount</TableCell>
								<TableCell component="th">Recurring Payment</TableCell>
								{/* <TableCell component="th">ReversTrxDate</TableCell> */}
								<TableCell component="th">Next Payment Date</TableCell>
								{/* <TableCell component="th">Type</TableCell> */}
							</TableRow>
						</TableHead>
						<TableBody>{detailsTable}</TableBody>
					</Table>
				</TableContainer>
			</Dialog>

			<Dialog
				maxWidth="lg"
				fullWidth
				open={subscribeModalOpened}
				onClose={closeSubscribeModal}
			>
				<SubscribeForm userId={userId!} modifiedBy={modifiedBy!} />
			</Dialog>
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
		<PageContainer title="Subscription" items={[{ label: 'Subscription', href: '/dashboard/subscription' }]}>
			<MainCard title="Search users">
			<form onSubmit={handleSubmit}>
				<TextField
					name="searchkey"
					fullWidth
					size="small"
					placeholder="Search by name, email or number..."
					InputProps={{
						endAdornment: (
							<InputAdornment position="end">
								<IconButton type="submit" edge="end" aria-label="Search">
									<IconSearch size={18} />
								</IconButton>
							</InputAdornment>
						),
					}}
				/>
			</form>
			</MainCard>
			<Box sx={{ height: 16 }} />
			<MainCard contentSX={{ p: 0 }}>
				{initialLoader ? (
					<Loader />
				) : loading ? (
					<Box display="flex" justifyContent="center" alignItems="center">
						<CircularProgress size={24} />
					</Box>
				) : (
					<>
						<TableContainer sx={{ minWidth: 800 }}>
							<Table size="small">
								<TableHead>
									<TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
										<TableCell component="th">ID</TableCell>
										<TableCell component="th">Login Id</TableCell>
										<TableCell component="th">User Phone</TableCell>
										<TableCell component="th">User Email</TableCell>
										<TableCell component="th">Subscription</TableCell>
										<TableCell component="th">Action</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{displayData?.length > 0 ? (
										rows
									) : (
										<Box display="flex" justifyContent="center" alignItems="center">
											<Typography>No Data Found</Typography>
										</Box>
									)}
								</TableBody>
							</Table>
						</TableContainer>
						<Divider sx={{ my: 1 }} />
						<Pagination page={currentPage}
							onChange={handlePageChange}
							count={totalPages}
						/>
					</>
				)}
			</MainCard>
		</PageContainer>
	);
}
