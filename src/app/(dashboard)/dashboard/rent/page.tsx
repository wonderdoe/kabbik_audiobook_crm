'use client';

import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Pagination,
	Stack,
	Tab,
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
import { useDisclosure } from '@/hooks/use-disclosure';
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
	const [isOpenDetailsModal, { open: openDetailsModal, close: closeDetailsModal }] =
		useDisclosure(false);
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
		setCurrentPage(1)
		setOffset(0);
		setDate({
			startDate: moment(formData.startDate).format('YYYY-MM-DD'),
			endDate: moment(formData.endDate).format('YYYY-MM-DD'),
		});
	};

	const handlePageChange = (e: any) => {
		const offsetCount = (e - 1) * limit;
		setCurrentPage(e);
		setOffset(offsetCount);
	};

	return isLoading ? (
		<Loader />
	) : (
		<PageContainer title="Rent Revenue Report" items={[{ label: 'Rent', href: '/dashboard/rent' }]}>
					<MainCard content={false} sx={{ p: 2, mb: 2 }}>
						<Stack
							direction={{ xs: 'column', sm: 'row' }}
							flexWrap="wrap"
							justifyContent="space-between"
							alignItems="center"
							spacing={2}
						>
							<Box>
								<form onSubmit={handleSubmit(handleSubmitForm, err => console.error(err))}>
									<Stack direction="column" alignItems="flex-start" spacing={1}>
										<div
											style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: 10 }}
										>
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
										</div>
										<Button type="submit">Filter</Button>
									</Stack>
								</form>
							</Box>
							<Stack direction="row" spacing={3} sx={{ display: 'flex' }}>
								<Stack direction="column" alignItems="flex-end" spacing={1}>
									<Typography variant="h5" fontWeight={900} color="success.main">
										Rent Revenue so far
									</Typography>
									<Typography variant="body1" fontWeight={700} color="text.secondary">
										Rent Revenue in between range
									</Typography>
									<Typography variant="body1" fontWeight={700} color="text.secondary">
										Count of rented books
									</Typography>
								</Stack>
								<Stack direction="column" spacing={1}>
									<Typography variant="h5" fontWeight={900} color="success.main">
										{rentData?.total} Tk
									</Typography>
									<Typography variant="body1" fontWeight={700} color="text.secondary">
										{rentData?.totalAmountInRange} Tk
									</Typography>
									<Typography variant="body1" fontWeight={700} color="text.secondary">
										{rentData?.totalCountInRange}
									</Typography>
								</Stack>
							</Stack>
						</Stack>
					</MainCard>
					<Box sx={{ height: 16 }} />
					<MainCard content={false} sx={{ p: 2.5, mb: 2 }}>
						<TableContainer sx={{ minWidth: '100%' }}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell component="th">User Name</TableCell>
										<TableCell component="th">Thumbnail</TableCell>
										<TableCell component="th">Audiobook Name</TableCell>
										<TableCell component="th">Amount</TableCell>
										<TableCell component="th">Payment Date</TableCell>
										<TableCell component="th">Action</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{rentData?.data.map((element: any, index: any) => (
										<TableRow key={index}>
											<TableCell> {element.name || 'N/A'} </TableCell>
											<TableCell>
												<Box
													component="img"
													src={element.thumb_path}
													alt={element.audiobook_name}
													sx={{ width: 100, height: 'auto', borderRadius: 1 }}
												/>
											</TableCell>
											<TableCell>{element.audiobook_name || 'N/A'}</TableCell>
											<TableCell className="border border-indigo-600">
												<Typography variant="body2" fontWeight={700} textAlign="center" color="success.main">
													৳ {element.amount || 'N/A'}
												</Typography>
											</TableCell>
											<TableCell>
												{moment(element.created_at).format('Do MMM YYYY, h:mm:ss a') || 'N/A'}
											</TableCell>
											<TableCell component="th">
												<Button
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

						<Box sx={{ height: 16 }} />

						<Pagination page={currentPage} count={getTotalPageNumber(rentData.totalCountInRange)} onChange={(_, p) => handlePageChange(p)}
							siblings={1}
						/>
					</MainCard>
					<Dialog open={isOpenDetailsModal} onClose={closeDetailsModal} maxWidth="lg" fullWidth>
<DialogTitle>Rent Details</DialogTitle>
<DialogContent>
						<TableContainer sx={{ minWidth: '100%' }}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell component="th">Audiobook ID</TableCell>
										<TableCell component="th">User ID</TableCell>
										<TableCell component="th">Email</TableCell>
										<TableCell component="th">Phone</TableCell>
										<TableCell component="th">Transaction ID</TableCell>
										<TableCell component="th">Platform</TableCell>
										<TableCell component="th">Source</TableCell>
										<TableCell component="th">Payment Method</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									<TableRow>
										<TableCell>{rentDetails?.product_id || 'N/A'}</TableCell>
										<TableCell> {rentDetails?.user_id || 'N/A'} </TableCell>
										<TableCell> {rentDetails?.email || 'N/A'} </TableCell>
										<TableCell> {formatPhoneNumber(rentDetails?.phone) || 'N/A'} </TableCell>
										<TableCell> {rentDetails?.transaction_id || 'N/A'} </TableCell>
										<TableCell> {rentDetails?.platform || 'N/A'} </TableCell>
										<TableCell> {rentDetails?.source || 'N/A'} </TableCell>
										<TableCell> {rentDetails?.payment_method || 'N/A'} </TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</TableContainer>
					</DialogContent>
					</Dialog>
				</PageContainer>
	);
}
