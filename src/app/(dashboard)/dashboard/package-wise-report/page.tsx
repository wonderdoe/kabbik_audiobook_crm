'use client';

import {
	Button,
	Card,
	Grid,
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
import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CustomDatePicker } from '@/components/Form/CustomDatePicker';
import Loader from '@/components/Loader';
import { getPackageWiseRevenue } from '@/services/services';

const formSchema = z.object({
	startDate: z.date({ required_error: 'Start date must be selected' }),
	endDate: z.date({ required_error: 'End date must be selected' }),
});

type FormData = z.infer<typeof formSchema>;

export default function PackageWiseReport() {
	const [data, setData] = useState<{ list: { total: number; name: string }[]; total: number }>();
	const [isLoading, setIsLoading] = useState(false);
	const [date, setDate] = useState({
		startDate: moment().format('YYYY-MM-DD'),
		endDate: moment().format('YYYY-MM-DD'),
	});
	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			startDate: new Date(),
			endDate: new Date(),
		},
	});

	const getData = useCallback(async () => {
		setIsLoading(true);
		const data = await getPackageWiseRevenue(date.startDate, date.endDate);
		setData(data);
		setIsLoading(false);
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
			<Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
				<form
					onSubmit={form.handleSubmit(handleSubmit, err => console.error(err))}
					style={{ marginBottom: '20px' }}
				>
					<Grid align="end">
						<Grid item xs={12} sm={5} >
							<CustomDatePicker
								name="startDate"
								label="Start Date"
								control={form.control}
								placeholder={'Pick a date'}
								error={
									(form.formState.errors.startDate &&
										form.formState.errors.startDate.message) as string
								}
							/>
						</Grid>
						<Grid item xs={12} sm={5} >
							<CustomDatePicker
								name="endDate"
								label="End Date"
								control={form.control}
								placeholder={'Pick a date'}
								error={
									(form.formState.errors.endDate && form.formState.errors.endDate.message) as string
								}
							/>
						</Grid>
						<Grid item xs={12} sm={2} >
							<Button sx={{ width: "100%" }} type="submit" variant="contained">
								Submit
							</Button>
						</Grid>
					</Grid>
				</form>
			</Card>
			{isLoading ? (
				<Loader />
			) : (
				<Card variant="outlined" sx={{ p: 2 }} sx={{ borderRadius: 2 }}>
					<TableContainer sx={{ minWidth: 400 }}>
						<Table>
							<TableHead style={{ borderBottom: '1px solid #ccc', height: '50px' }}>
								<TableRow>
									<TableCell component="th" textAlign="left">Package Name</TableCell>
									<TableCell component="th" textAlign="right">Amount (Tk)</TableCell>
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
