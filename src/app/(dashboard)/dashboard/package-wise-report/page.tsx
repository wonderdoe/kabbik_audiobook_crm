'use client';

import {
	Alert,
	Button,
	Card,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CustomDatePicker } from '@/components/Form/CustomDatePicker';
import Loader from '@/components/Loader';
import { getPackageWiseRevenue } from '@/services/services';
import { defaultPackageWiseReportRangeClient } from '@/utils/dhaka-date-client';

const formSchema = z.object({
	startDate: z.date({ required_error: 'Start date must be selected' }),
	endDate: z.date({ required_error: 'End date must be selected' }),
});

type FormData = z.infer<typeof formSchema>;

function ymdToDate(ymd: string) {
	return moment(ymd, 'YYYY-MM-DD').toDate();
}

export default function PackageWiseReport() {
	const initialRange = useMemo(() => defaultPackageWiseReportRangeClient(), []);
	const [data, setData] = useState<{ list: { total: number; name: string }[]; total: number }>();
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [date, setDate] = useState(initialRange);

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			startDate: ymdToDate(initialRange.startDate),
			endDate: ymdToDate(initialRange.endDate),
		},
	});

	const getData = useCallback(async () => {
		setIsLoading(true);
		setLoadError(null);
		try {
			const result = await getPackageWiseRevenue(date.startDate, date.endDate);
			setData(result);
		} catch (error) {
			console.error('Package wise report fetch failed:', error);
			setLoadError('Could not load report. Try again or use a shorter date range.');
		} finally {
			setIsLoading(false);
		}
	}, [date]);

	useEffect(() => {
		getData();
	}, [getData]);

	const handleSubmit = async (formData: FormData) => {
		setDate({
			startDate: moment(formData.startDate).format('YYYY-MM-DD'),
			endDate: moment(formData.endDate).format('YYYY-MM-DD'),
		});
	};

	return (
		<PageContainer
			title="Package Wise Report"
			items={[{ label: 'Package Wise Report', href: '/dashboard/package-wise-report' }]}
		>
			<Card variant="outlined" sx={{ borderRadius: 2, p: 2, mb: 2 }}>
				<form onSubmit={form.handleSubmit(handleSubmit, err => console.error(err))}>
					<Grid container spacing={2} alignItems="flex-end">
						<Grid item xs={12} sm={5}>
							<CustomDatePicker
								name="startDate"
								label="Start Date"
								control={form.control}
								placeholder="Pick a date"
								error={
									(form.formState.errors.startDate &&
										form.formState.errors.startDate.message) as string
								}
							/>
						</Grid>
						<Grid item xs={12} sm={5}>
							<CustomDatePicker
								name="endDate"
								label="End Date"
								control={form.control}
								placeholder="Pick a date"
								error={
									(form.formState.errors.endDate && form.formState.errors.endDate.message) as string
								}
							/>
						</Grid>
						<Grid item xs={12} sm={2}>
							<Button sx={{ width: '100%' }} type="submit" variant="contained">
								Submit
							</Button>
						</Grid>
					</Grid>
				</form>
			</Card>
			{loadError && (
				<Alert severity="warning" sx={{ mb: 2 }}>
					{loadError}
				</Alert>
			)}
			{isLoading ? (
				<Loader />
			) : (
				<Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
					<TableContainer sx={{ minWidth: 400 }}>
						<Table>
							<TableHead style={{ borderBottom: '1px solid #ccc', height: '50px' }}>
								<TableRow>
									<TableCell component="th">Package Name</TableCell>
									<TableCell component="th" align="right">Amount (Tk)</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{data?.list.map(item => (
									<TableRow key={item.name}>
										<TableCell>{item.name}</TableCell>
										<TableCell align="right">{item.total}</TableCell>
									</TableRow>
								))}
								<TableRow style={{ height: '50px' }}>
									<TableCell>
										<Typography fontWeight={700}>Total</Typography>
									</TableCell>
									<TableCell align="right">
										<Typography fontWeight={700}>{data?.total}</Typography>
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</TableContainer>
				</Card>
			)}
		</PageContainer>
	);
}
