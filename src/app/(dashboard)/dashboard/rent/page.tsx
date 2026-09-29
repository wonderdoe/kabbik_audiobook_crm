'use client';

import {
	Box,
	Button,
	Flex,
	Image,
	Modal,
	Pagination,
	Paper,
	Space,
	Table,
	Text,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
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

	return (
		<>
			{isLoading ? (
				<Loader />
			) : (
				<>
					<Title order={1} mb="md">
						Rent Revenue Report
					</Title>
					<Paper shadow="xs" p="md" px={'lg'}>
						<Flex
							justify={'space-between'}
							gap={'md'}
							direction={{ base: 'column', xs: 'row' }}
							align={'center'}
						>
							<Box>
								<form onSubmit={handleSubmit(handleSubmitForm, err => console.error(err))}>
									<Flex direction={'column'} align={'start'} gap={15}>
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
									</Flex>
								</form>
							</Box>
							<Flex display={'flex'} gap={30}>
								<Flex direction={'column'} align={'end'} gap={8}>
									<Text size="xl" fw={900} c="green">
										Rent Revenue so far
									</Text>
									<Text size="md" fw={700} c={'gray'}>
										Rent Revenue in between range
									</Text>
									<Text size="md" fw={700} c={'gray'}>
										Count of rented books
									</Text>
								</Flex>
								<Flex direction={'column'} gap={8}>
									<Text size="xl" fw={900} c={'green'}>
										{rentData?.total} Tk
									</Text>
									<Text size="md" fw={700} c={'gray'}>
										{rentData?.totalAmountInRange} Tk
									</Text>
									<Text size="md" fw={700} c={'gray'}>
										{rentData?.totalCountInRange}
									</Text>
								</Flex>
							</Flex>
						</Flex>
					</Paper>
					<Space h={'md'} />
					<Paper shadow="xs" p="xl" style={{ padding: 25, marginBottom: '20px' }}>
						<Table.ScrollContainer minWidth={'100%'}>
							<Table>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>User Name</Table.Th>
										<Table.Th>Thumbnail</Table.Th>
										<Table.Th>Audiobook Name</Table.Th>
										<Table.Th>Amount</Table.Th>
										<Table.Th>Payment Date</Table.Th>
										<Table.Th>Action</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{rentData?.data.map((element: any, index: any) => (
										<Table.Tr key={index}>
											<Table.Td> {element.name || 'N/A'} </Table.Td>
											<Table.Td>
												<Image
													src={element.thumb_path}
													alt={element.audiobook_name}
													w={100}
													h={'auto'}
													radius={'md'}
												/>
											</Table.Td>
											<Table.Td>{element.audiobook_name || 'N/A'}</Table.Td>
											<Table.Td className="border border-indigo-600">
												<Text size="sm" fw={700} ta="center" c="green">
													৳ {element.amount || 'N/A'}
												</Text>
											</Table.Td>
											<Table.Td>
												{moment(element.created_at).format('Do MMM YYYY, h:mm:ss a') || 'N/A'}
											</Table.Td>
											<Table.Th>
												<Button
													onClick={() => {
														openDetailsModal();
														setRentDetails(element);
													}}
												>
													Details
												</Button>
											</Table.Th>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</Table.ScrollContainer>

						<Space h={'md'} />

						<Pagination
							value={currentPage}
							total={getTotalPageNumber(rentData.totalCountInRange)}
							onChange={handlePageChange}
							siblings={1}
						/>
					</Paper>
					<Modal
						title="Rent Details"
						opened={isOpenDetailsModal}
						onClose={closeDetailsModal}
						centered
						size={'80%'}
						classNames={{
							title: 'mantine-modal-title',
							close: 'mantine-modal-close',
						}}
					>
						<Table.ScrollContainer minWidth={'100%'}>
							<Table>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Audiobook ID</Table.Th>
										<Table.Th>User ID</Table.Th>
										<Table.Th>Email</Table.Th>
										<Table.Th>Phone</Table.Th>
										<Table.Th>Transaction ID</Table.Th>
										<Table.Th>Platform</Table.Th>
										<Table.Th>Source</Table.Th>
										<Table.Th>Payment Method</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									<Table.Tr>
										<Table.Td>{rentDetails?.product_id || 'N/A'}</Table.Td>
										<Table.Td> {rentDetails?.user_id || 'N/A'} </Table.Td>
										<Table.Td> {rentDetails?.email || 'N/A'} </Table.Td>
										<Table.Td> {formatPhoneNumber(rentDetails?.phone) || 'N/A'} </Table.Td>
										<Table.Td> {rentDetails?.transaction_id || 'N/A'} </Table.Td>
										<Table.Td> {rentDetails?.platform || 'N/A'} </Table.Td>
										<Table.Td> {rentDetails?.source || 'N/A'} </Table.Td>
										<Table.Td> {rentDetails?.payment_method || 'N/A'} </Table.Td>
									</Table.Tr>
								</Table.Tbody>
							</Table>
						</Table.ScrollContainer>
					</Modal>
				</>
			)}
		</>
	);
}
