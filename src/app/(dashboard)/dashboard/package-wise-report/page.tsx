'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Grid, Table, Text, Title } from '@mantine/core';
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
		<>
			<Title order={1} mb="md">
				Package Wise Report
			</Title>
			<Card withBorder p="md" radius="md" mb="md">
				<form
					onSubmit={form.handleSubmit(handleSubmit, err => console.error(err))}
					style={{ marginBottom: '20px' }}
				>
					<Grid align="end">
						<Grid.Col span={{ base: 12, xs: 5 }}>
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
						</Grid.Col>
						<Grid.Col span={{ base: 12, xs: 5 }}>
							<CustomDatePicker
								name="endDate"
								label="End Date"
								control={form.control}
								placeholder={'Pick a date'}
								error={
									(form.formState.errors.endDate && form.formState.errors.endDate.message) as string
								}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, xs: 2 }}>
							<Button fullWidth type="submit" variant="filled">
								Submit
							</Button>
						</Grid.Col>
					</Grid>
				</form>
			</Card>
			{isLoading ? (
				<Loader />
			) : (
				<Card withBorder p="md" radius="md">
					<Table.ScrollContainer minWidth={400}>
						<Table>
							<Table.Thead style={{ borderBottom: '1px solid #ccc', height: '50px' }}>
								<Table.Tr>
									<Table.Th ta="left">Package Name</Table.Th>
									<Table.Th ta="right">Amount (Tk)</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{data?.list.map(item => (
									<Table.Tr key={item.name}>
										<Table.Td>{item.name}</Table.Td>
										<Table.Td align="right">{item.total}</Table.Td>
									</Table.Tr>
								))}
								<Table.Tr style={{ height: '50px' }}>
									<Table.Td>
										<Text fw={700}>Total</Text>
									</Table.Td>
									<Table.Td align="right">
										<Text fw={700}>{data?.total}</Text>
									</Table.Td>
								</Table.Tr>
							</Table.Tbody>
						</Table>
					</Table.ScrollContainer>
				</Card>
			)}
		</>
	);
}
