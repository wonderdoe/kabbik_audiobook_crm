'use client';
import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	Pagination,
	Paper,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import { TableThumbnail } from '@/components/mantis/TableThumbnail';

import { IconSearch } from '@tabler/icons-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import { useDisclosure } from '@/hooks/use-disclosure';
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
		<TableRow key={element.id}>
			<TableCell>{element.user_id}</TableCell>
			<TableCell>
				{element.package_id === '1'
					? 'Monthly'
					: element.package_id === '2'
						? 'Half Yearly'
						: 'Yearly'}
			</TableCell>
			<TableCell>{element.payment_method}</TableCell>
			<TableCell sx={{ maxWidth: 300 }}>
				<TableThumbnail src={element.payment_proof} alt={element.payment_method} objectFit="contain" />
			</TableCell>
			<TableCell>
				<Button
					onClick={() => {
						setDetails(element);
						openDetailsModal();
					}}
				>
					Details
				</Button>
			</TableCell>
		</TableRow>
	));

	return (
		<PageContainer
			title="Manual Subscription"
			items={[{ label: 'Manual Subscription', href: '/dashboard/manual-subscription-log' }]}
		>
			<form style={{ display: 'flex' }} onSubmit={handleSubmit}>
				<TextField
					name="searchkey"
					placeholder="Search by subscription id or transaction id..."
					endIcon={<IconSearch size={16} />}
					style={{ width: '100%' }}
				/>
			</form>
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
							<Table verticalSpacing="xs" horizontalSpacing="xs" captionSide="top">
								<Table.Caption>{displayData?.length === 0 ? 'No data found' : ''}</Table.Caption>
								<TableHead>
									<TableRow>
										<TableCell component="th">User Id</TableCell>
										<TableCell component="th">Package Id</TableCell>
										<TableCell component="th">Payment Method</TableCell>
										<TableCell component="th">Proof Of Payment</TableCell>
										<TableCell component="th">Action</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>{displayData?.length > 0 ? manualRows : null}</TableBody>
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

			<Dialog
				
				open={detailsModalOpened}
				onClose={closeDetailsModal}
				maxWidth="xl" sx={{ width: "100%" }}
			>
<DialogTitle>Details</DialogTitle>
<DialogContent>
				<TableContainer sx={{ minWidth: 200 }}>
					<Table>
						<TableHead>
							<TableCell component="th">Subscription Id</TableCell>
							<TableCell component="th">Transaction Id</TableCell>
							<TableCell component="th">Subscription Date</TableCell>
							<TableCell component="th">Created At</TableCell>
							<TableCell component="th">Modified By</TableCell>
						</TableHead>
						<TableBody>
							<TableCell>{details?.subscription_id}</TableCell>
							<TableCell>{details?.transaction_id}</TableCell>
							<TableCell>{moment(details?.subscription_date).format('Do MMM YYYY h:mma')}</TableCell>
							<TableCell>{moment(details?.created_at).format('Do MMM YYYY h:mma')}</TableCell>
							<TableCell>{details?.modified_by}</TableCell>
						</TableBody>
					</Table>
				</TableContainer>
			</DialogContent>
</Dialog>
		</PageContainer>
	);
}
