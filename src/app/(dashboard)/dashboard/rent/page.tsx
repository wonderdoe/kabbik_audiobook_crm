'use client';

import {
	Avatar,
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	Pagination,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import { StatCard } from '@/components/ui/StatCard';
import { DetailGrid } from '@/components/ui/DetailGrid';
import { useDisclosure } from '@/hooks/use-disclosure';
import { IconBooks, IconCash, IconChartBar } from '@tabler/icons-react';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CustomDatePicker } from '@/components/Form/CustomDatePicker';
import Loader from '@/components/Loader';
import { getRentRevenueReport } from '@/services/services';
import { formatPhoneNumber, getTotalPageNumber } from '@/utils/globalHelpers';

const formSchema = z.object({
	startDate: z.date({ required_error: 'Start date must be selected' }),
	endDate: z.date({ required_error: 'End date must be selected' }),
});

export type FormData = z.infer<typeof formSchema>;

export default function Rent() {
	const [rentData, setRentData] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [date, setDate] = useState<any>({
		startDate: moment().startOf('month').format('YYYY-MM-DD'),
		endDate: moment().format('YYYY-MM-DD'),
	});
	const limit = 10;
	const [offset, setOffset] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [rentDetails, setRentDetails] = useState<any>();
	const [isOpenDetailsModal, { open: openDetailsModal, close: closeDetailsModal }] = useDisclosure(false);
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		defaultValues: {
			startDate: new Date(moment().startOf('month').format('YYYY-MM-DD')),
			endDate: new Date(),
		},
	});

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		const result = await getRentRevenueReport({ ...date, limit, offset });
		setRentData(result);
		setIsLoading(false);
	}, [date, offset]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleSubmitForm = async (formData: FormData) => {
		setCurrentPage(1);
		setOffset(0);
		setDate({
			startDate: moment(formData.startDate).format('YYYY-MM-DD'),
			endDate: moment(formData.endDate).format('YYYY-MM-DD'),
		});
	};

	const handlePageChange = (e: number) => {
		const offsetCount = (e - 1) * limit;
		setCurrentPage(e);
		setOffset(offsetCount);
	};

	if (isLoading && !rentData) return <Loader />;

	return (
		<PageContainer title="Rent Revenue Report" items={[{ label: 'Rent', href: '/dashboard/rent' }]}>
			<Stack spacing={2}>
				<Grid container spacing={2}>
					<Grid item xs={12} md={4}>
						<StatCard
							title="Rent revenue (all time)"
							value={`${rentData?.total ?? 0} Tk`}
							color="success"
							icon={<IconCash size={22} />}
							loading={isLoading}
						/>
					</Grid>
					<Grid item xs={12} md={4}>
						<StatCard
							title="Revenue in range"
							value={`${rentData?.totalAmountInRange ?? 0} Tk`}
							color="primary"
							icon={<IconChartBar size={22} />}
							loading={isLoading}
						/>
					</Grid>
					<Grid item xs={12} md={4}>
						<StatCard
							title="Rented books in range"
							value={rentData?.totalCountInRange ?? 0}
							color="info"
							icon={<IconBooks size={22} />}
							loading={isLoading}
						/>
					</Grid>
				</Grid>

				<MainCard title="Date range">
					<form onSubmit={handleSubmit(handleSubmitForm, err => console.error(err))}>
						<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end">
							<CustomDatePicker
								label="Start Date"
								name="startDate"
								control={control}
								placeholder="Select start date"
								error={(errors.startDate && errors.startDate.message) as string}
							/>
							<CustomDatePicker
								label="End Date"
								name="endDate"
								control={control}
								placeholder="Select end date"
								error={(errors.endDate && errors.endDate.message) as string}
							/>
							<Button type="submit" variant="contained">Apply filter</Button>
						</Stack>
					</form>
				</MainCard>

				<MainCard title="Transactions" contentSX={{ p: 0 }}>
					<TableContainer>
						<Table size="small">
							<TableHead>
								<TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
									<TableCell>User Name</TableCell>
									<TableCell>Thumbnail</TableCell>
									<TableCell>Audiobook Name</TableCell>
									<TableCell>Amount</TableCell>
									<TableCell>Payment Date</TableCell>
									<TableCell>Action</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rentData?.data?.map((element: any, index: number) => (
									<TableRow key={index} hover>
										<TableCell>{element.name || 'N/A'}</TableCell>
										<TableCell>
											<Avatar
												variant="rounded"
												src={element.thumb_path}
												alt={element.audiobook_name}
												sx={{ width: 56, height: 56 }}
											/>
										</TableCell>
										<TableCell>{element.audiobook_name || 'N/A'}</TableCell>
										<TableCell>
											<Chip
												label={`৳ ${element.amount ?? 'N/A'}`}
												color="success"
												variant="outlined"
												size="small"
												sx={{ fontWeight: 700 }}
											/>
										</TableCell>
										<TableCell>
											{moment(element.created_at).format('Do MMM YYYY, h:mm:ss a') || 'N/A'}
										</TableCell>
										<TableCell>
											<Button
												size="small"
												variant="outlined"
												onClick={() => {
													openDetailsModal();
													setRentDetails(element);
												}}
											>
												Details
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
					<Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
						<Pagination
							page={currentPage}
							count={getTotalPageNumber(rentData?.totalCountInRange ?? 0)}
							onChange={(_, p) => handlePageChange(p)}
							siblings={1}
						/>
					</Box>
				</MainCard>

				<Dialog open={isOpenDetailsModal} onClose={closeDetailsModal} maxWidth="md" fullWidth>
					<DialogTitle>Rent details</DialogTitle>
					<DialogContent>
						<DetailGrid
							fields={[
								{ label: 'Audiobook ID', value: rentDetails?.product_id },
								{ label: 'User ID', value: rentDetails?.user_id },
								{ label: 'Email', value: rentDetails?.email },
								{ label: 'Phone', value: formatPhoneNumber(rentDetails?.phone) },
								{ label: 'Transaction ID', value: rentDetails?.transaction_id },
								{ label: 'Platform', value: rentDetails?.platform },
								{ label: 'Source', value: rentDetails?.source },
								{ label: 'Payment method', value: rentDetails?.payment_method },
							]}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={closeDetailsModal}>Close</Button>
					</DialogActions>
				</Dialog>
			</Stack>
		</PageContainer>
	);
}
