'use client';
import { Button, Divider, Modal, Pagination, Paper, ScrollArea, Table, Title } from '@mantine/core';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import { useDisclosure } from '@mantine/hooks';

export default function BookRequest() {
	const [bookRequestList, setBookRequestList] = useState<any>([]);
	const [totalData, setTotalData] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [offset, setOffset] = useState(0);
	const [limit, setLimit] = useState(25);
	const [loading, setLoading] = useState(true);
	const [details, setDetails] = useState<any>(null);

	const [detailsModalOpened, { open: openDetailsModal, close: closeDetailsModal }] =
		useDisclosure(false);

	const rows = bookRequestList.map((element: any) => {
		return (
			<Table.Tr key={element.id}>
				<Table.Td>{element.name}</Table.Td>
				<Table.Td>{element.bookname}</Table.Td>
				<Table.Td>{element.writer}</Table.Td>
				<Table.Td>
					<Button
						onClick={() => {
							setDetails(element);
							openDetailsModal();
						}}
					>
						Details
					</Button>
				</Table.Td>
			</Table.Tr>
		);
	});

	async function getData() {
		setLoading(true);
		const response = await fetch(`/api/routes/bookrequest?offset=${offset}&limit=${limit}`);
		const apidata = await response.json();
		setLoading(false);
		setBookRequestList(apidata.data);
		setTotalData(apidata.total.count);
	}
	const totalPage = Math.ceil(totalData / limit);
	const handlePage = (e: any) => {
		const offsetCount = (e - 1) * limit;
		setCurrentPage(e);
		setOffset(offsetCount);
	};

	useEffect(() => {
		getData();
	}, [offset]);

	return (
		<>
			{loading ? (
				<Loader />
			) : (
				<>
					<Title order={1} style={{ marginBottom: 20 }}>
						Book Request
					</Title>
					<Paper withBorder radius="md" p="md">
						<ScrollArea>
							<Table>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Name</Table.Th>
										<Table.Th>Book Name</Table.Th>
										<Table.Th>Writer</Table.Th>
										<Table.Th>Action</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>{rows}</Table.Tbody>
							</Table>
						</ScrollArea>
						<Divider my="sm" />
						<Pagination value={currentPage} total={totalPage} onChange={handlePage} siblings={1} />
					</Paper>
					<Modal
						title="Details"
						opened={detailsModalOpened}
						onClose={closeDetailsModal}
						classNames={{
							title: 'mantine-modal-title',
							close: 'mantine-modal-close',
						}}
						size={'lg'}
						centered
					>
						<Table.ScrollContainer minWidth={100}>
							<Table>
								<Table.Thead>
									<Table.Th>Language</Table.Th>
									<Table.Th>Category</Table.Th>
									<Table.Th>Created at</Table.Th>
								</Table.Thead>
								<Table.Tbody>
									<Table.Tr>
										<Table.Td>{details?.language || 'N/A'}</Table.Td>
										<Table.Td>{details?.category || 'N/A'}</Table.Td>
										<Table.Td>
											{moment(details?.created_at || 'N/A').format('Do MMM YYYY h:mma')}
										</Table.Td>
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
