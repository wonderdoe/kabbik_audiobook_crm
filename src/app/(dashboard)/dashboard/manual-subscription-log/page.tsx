'use client';
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	InputAdornment,
	Pagination,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import { DetailGrid } from '@/components/ui/DetailGrid';
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
				<Chip
					size="small"
					variant="outlined"
					color="primary"
					label={
						element.package_id === '1'
							? 'Monthly'
							: element.package_id === '2'
								? 'Half Yearly'
								: 'Yearly'
					}
				/>
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
			<MainCard title="Search logs">
			<form onSubmit={handleSubmit}>
				<TextField
					name="searchkey"
					fullWidth
					size="small"
					placeholder="Search by subscription id or transaction id..."
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

			<Dialog open={detailsModalOpened} onClose={closeDetailsModal} maxWidth="md" fullWidth>
				<DialogTitle>Details</DialogTitle>
				<DialogContent>
					<DetailGrid
						fields={[
							{ label: 'Subscription Id', value: details?.subscription_id },
							{ label: 'Transaction Id', value: details?.transaction_id },
							{
								label: 'Subscription date',
								value: details?.subscription_date
									? moment(details.subscription_date).format('Do MMM YYYY h:mma')
									: '—',
							},
							{
								label: 'Created at',
								value: details?.created_at
									? moment(details.created_at).format('Do MMM YYYY h:mma')
									: '—',
							},
							{ label: 'Modified by', value: details?.modified_by },
						]}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={closeDetailsModal}>Close</Button>
				</DialogActions>
			</Dialog>
		</PageContainer>
	);
}
