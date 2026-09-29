'use client';

import {
	Button,
	Divider,
	Modal,
	Pagination,
	Paper,
	ScrollArea,
	Table,
	Text,
	Title,
} from '@mantine/core';

import { useDisclosure } from '@mantine/hooks';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import { formatPhoneNumber } from '@/utils/globalHelpers';

export default function DayWisePromo() {
	const [isOpenedModal, { open: openModal, close: closeModal }] = useDisclosure(false);
	const [apiResponseData, setApiResponseData]: any = useState([]);
	const [offset, setOffset] = useState(0);
	const limit = 50;
	const [currentPage, setCurrentPage] = useState(1);
	const [loading, setLoading] = useState(true);
	const [modalData, setModalData] = useState<any>(null);

	const [totalData, setTotalData] = useState(0);

	const getData = useCallback(async () => {
		try {
			const response = await fetch(
				`/api/routes/daywise-promo-active?offset=${offset}&limit=${limit}`,
			);
			const apidata = await response.json();
			setLoading(false);
			setApiResponseData(apidata?.data);
			setTotalData(apidata?.total);
		} catch (error) {
			console.error(error);
		}
	}, [limit, offset]);

	const total = Math.ceil(totalData / limit);

	const handlePageChange = (e: any) => {
		const offsetCount = (e - 1) * limit;
		setOffset(offsetCount);
		setCurrentPage(e);
	};

	useEffect(() => {
		getData();
	}, [getData]);

	const rows = apiResponseData.map((element: any) => {
		return (
			<Table.Tr key={element.id}>
				<Table.Td>{element.full_name || 'N/A'}</Table.Td>
				<Table.Td>{element.promo_code || 'N/A'}</Table.Td>
				<Table.Td>
					<Text size="md" fw={900} c="green">
						৳ {element.amount || 'N/A'}
					</Text>
				</Table.Td>
				<Table.Td>{moment(element?.payment_time).format('Do MMM YYYY h:mma') || 'N/A'}</Table.Td>
				<Table.Td>
					<Button
						onClick={() => {
							setModalData(element);
							openModal();
						}}
					>
						Details
					</Button>
				</Table.Td>
			</Table.Tr>
		);
	});

	return (
		<>
			{loading ? (
				<Loader />
			) : (
				<>
					<Title order={1} style={{ marginBottom: 20 }}>
						Day Wise Promo Activation
					</Title>
					<Paper withBorder radius="md" p="md">
						<ScrollArea>
							<Table>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Name</Table.Th>
										<Table.Th>Promo Code</Table.Th>
										<Table.Th>Amount</Table.Th>
										<Table.Th>Date</Table.Th>
										<Table.Th>Action</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>{rows}</Table.Tbody>
							</Table>
						</ScrollArea>
						<Divider my="sm" />
						<Pagination
							value={currentPage}
							onChange={handlePageChange}
							total={total}
							siblings={1}
						/>
					</Paper>
					<Modal
						title="Promo Activation Details"
						opened={isOpenedModal}
						onClose={closeModal}
						size={'lg'}
						centered
						classNames={{ title: 'mantine-modal-title', close: 'mantine-modal-close' }}
					>
						<Table.ScrollContainer minWidth={100}>
							<Table>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Id</Table.Th>
										<Table.Th>Phone</Table.Th>
										<Table.Th>Email</Table.Th>
										<Table.Th>Source</Table.Th>
										<Table.Th>Payment Mode</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									<Table.Tr>
										<Table.Td>{modalData?.id || 'N/A'}</Table.Td>
										<Table.Td>
											{modalData?.phone_no ? formatPhoneNumber(modalData?.phone_no) : 'N/A'}
										</Table.Td>
										<Table.Td>{modalData?.user_email || 'N/A'}</Table.Td>
										<Table.Td>{modalData?.source || 'N/A'}</Table.Td>
										<Table.Td>{modalData?.payment_mode || 'N/A'}</Table.Td>
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
