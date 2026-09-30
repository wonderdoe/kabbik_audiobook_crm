'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Grid, Group, Image, Table, Text, Title } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CustomDatePicker } from '@/components/Form/CustomDatePicker';
import Loader from '@/components/Loader';
import { checkgetPermission } from '@/helper/Commonfunction';

const formSchema = z.object({
	startDate: z.date({ required_error: 'Start date must be selected' }),
	endDate: z.date({ required_error: 'End date must be selected' }),
});

type FormData = z.infer<typeof formSchema>;

export default function PaymentGateWiseRevenue() {

	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [updatedAt, setUpdatedAt] = useState<string | null>(null);
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

	const getData = useCallback(async (refresh = false) => {
		try {
			setIsLoading(true);
			const refreshParam = refresh ? '&refresh=1' : '';
			const response = await fetch(
				`/api/routes/pgw-revenue?startDate=${date.startDate}&endDate=${date.endDate}${refreshParam}`,
				{ cache: 'no-store' },
			);
			if (!response.ok) {
				throw new Error('Failed to fetch data');
			}
			const apidata = await response.json();
			setUpdatedAt(apidata.updatedAt ?? null);
			const rows = Array.isArray(apidata) ? apidata : (apidata.data ?? []);
			setData(rows);
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			setIsLoading(false);
		}
	}, [date]);

	const handleRefresh = async () => {
		if (!checkgetPermission('see_payment_gateway_wise_report')) return;
		setRefreshing(true);
		try {
			await getData(true);
		} finally {
			setRefreshing(false);
		}
	};

	const updatedLabel = updatedAt ? `Updated ${moment(updatedAt).fromNow()}` : null;

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
			<Group justify="space-between" mb="md" align="flex-end">
				<Title order={1}>Payment Gateway Wise Report.</Title>
				<Group gap="sm">
					{updatedLabel ? (
						<Text size="sm" c="dimmed">
							{updatedLabel}
						</Text>
					) : null}
					{checkgetPermission('see_payment_gateway_wise_report') ? (
						<Button
							variant="light"
							size="xs"
							leftSection={<IconRefresh size={14} />}
							loading={refreshing}
							onClick={handleRefresh}
						>
							Refresh
						</Button>
					) : null}
				</Group>
			</Group>
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
									<Table.Th ta="left" miw={100}>
										Logo
									</Table.Th>
									<Table.Th ta="left">Payment Gateway</Table.Th>
									<Table.Th ta="right">Amount (Tk)</Table.Th>
									<Table.Th ta="right">Existing User</Table.Th>
									<Table.Th ta="right">New Subscribers</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{data.map((item: any) => (
									<Table.Tr key={item?.payment_source}>
										<Table.Td>
											{/* {item?.image !== '' && ( */}
											{item?.image ? (
												<Image
													h={40}
													w={40}
													src={item?.image}
													alt={item?.image}
													style={{ objectFit: 'contain' }}
													radius="md"
												/>
											) : null}
											{/* )} */}
										</Table.Td>
										<Table.Td>{item?.payment_source}</Table.Td>
										<Table.Td align="right">{item?.total_amount}</Table.Td>
										<Table.Td align="right">{item?.old_subscribers}</Table.Td>
										<Table.Td align="right">{item?.new_subscribers}</Table.Td>
									</Table.Tr>
								))}
								<Table.Tr style={{ height: '50px' }}>
									<Table.Td></Table.Td>
									<Table.Td>
										<Text fw={700}>Total</Text>
									</Table.Td>
									<Table.Td align="right">
										<Text fw={700}>
											{data.reduce((acc: number, item: any) => acc + (item?.total_amount ?? 0), 0)}
										</Text>
									</Table.Td>
									<Table.Td align="right">
										<Text fw={700}>
											{data.reduce(
												(acc: number, item: any) => acc + (Number(item?.old_subscribers ?? 0) ),
												0,
											)}
										</Text>
									</Table.Td>
									<Table.Td align="right">
										<Text fw={700}>
											{data.reduce(
												(acc: number, item: any) => acc + (Number(item?.new_subscribers ?? 0) ),
												0,
											)}
										</Text>
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
