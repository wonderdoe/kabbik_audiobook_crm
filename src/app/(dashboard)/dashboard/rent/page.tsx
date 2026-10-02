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
import { useIsMobileSm } from '@/hooks/use-is-mobile-sm';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconBooks, IconCash, IconChartBar, IconSearch } from '@tabler/icons-react';
import moment from 'moment';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CustomDatePicker } from '@/components/Form/CustomDatePicker';
import Loader from '@/components/Loader';
import { getRentRevenueReport } from '@/services/services';
import { formatPhoneNumber, getTotalPageNumber } from '@/utils/globalHelpers';

const formSchema = z
	.object({
		startDate: z.date({ required_error: 'Start date must be selected' }),
		endDate: z.date({ required_error: 'End date must be selected' }),
	})
	.refine(data => data.endDate >= data.startDate, {
		message: 'End date must be on or after start date',
		path: ['endDate'],
	});

export type FormData = z.infer<typeof formSchema>;

function formatTk(amount: unknown): string {
	const n = Number(amount);
	if (!Number.isFinite(n)) return '0 Tk';
	return `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} Tk`;
}

function formatCount(value: unknown): string {
	const n = Number(value);
	if (!Number.isFinite(n)) return '0';
	return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function Rent() {
	const isMobileSm = useIsMobileSm();
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
		resolver: zodResolver(formSchema),
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

	const handleSubmitForm = (formData: FormData) => {
		setCurrentPage(1);
		setOffset(0);
		setDate({
			startDate: dayjs(formData.startDate).format('YYYY-MM-DD'),
			endDate: dayjs(formData.endDate).format('YYYY-MM-DD'),
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
			<Stack spacing={2} sx={{ minWidth: 0, width: '100%' }}>
				<Grid container spacing={2}>
					<Grid item xs={12} sm={6} lg={4} sx={{ display: 'flex' }}>
						<StatCard
							title="Rent revenue (all time)"
							value={formatTk(rentData?.total)}
							color="success"
							icon={<IconCash size={22} />}
							loading={isLoading}
						/>
					</Grid>
					<Grid item xs={12} sm={6} lg={4} sx={{ display: 'flex' }}>
						<StatCard
							title="Revenue in range"
							value={formatTk(rentData?.totalAmountInRange)}
							color="primary"
							icon={<IconChartBar size={22} />}
							loading={isLoading}
						/>
					</Grid>
					<Grid item xs={12} sm={6} lg={4} sx={{ display: 'flex' }}>
						<StatCard
							title="Rented books in range"
							value={formatCount(rentData?.totalCountInRange)}
							color="info"
							icon={<IconBooks size={22} />}
							loading={isLoading}
						/>
					</Grid>
				</Grid>

				<MainCard title="Date range">
					<form onSubmit={handleSubmit(handleSubmitForm, err => console.error(err))}>
						<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
							<Box
								sx={{
									flex: 1,
									minWidth: { sm: 200 },
									'& .MuiFormControl-root': { mt: 0, mb: 0 },
									'& .MuiFormHelperText-root': { display: errors.startDate ? 'block' : 'none' },
								}}
							>
								<CustomDatePicker
									label="Start Date"
									name="startDate"
									control={control}
									placeholder="Select start date"
									error={(errors.startDate && errors.startDate.message) as string}
								/>
							</Box>
							<Box
								sx={{
									flex: 1,
									minWidth: { sm: 200 },
									'& .MuiFormControl-root': { mt: 0, mb: 0 },
									'& .MuiFormHelperText-root': { display: errors.endDate ? 'block' : 'none' },
								}}
							>
								<CustomDatePicker
									label="End Date"
									name="endDate"
									control={control}
									placeholder="Select end date"
									error={(errors.endDate && errors.endDate.message) as string}
								/>
							</Box>
							<Button
								type="submit"
								variant="contained"
								startIcon={<IconSearch size={16} />}
								sx={{ px: 3, py: 1.25, whiteSpace: 'nowrap', flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'auto' } }}
							>
								Apply filter
							</Button>
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

				<Dialog open={isOpenDetailsModal} onClose={closeDetailsModal} maxWidth="md" fullWidth fullScreen={isMobileSm}>
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
