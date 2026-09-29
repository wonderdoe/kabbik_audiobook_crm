'use client';

import {
	Button,
	Divider,
	Image,
	Modal,
	Pagination,
	Paper,
	ScrollArea,
	Table,
	Title,
} from '@mantine/core';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import { getTotalPageNumber } from '@/utils/globalHelpers';
import { useDisclosure } from '@mantine/hooks';

export default function BookReview() {
	const [reviewData, setReviewData] = useState([]);

	const [currentPage, setCurrentPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [offset, setOffset] = useState(0);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [details, setDetails] = useState<any>(null);
	const [detailsModalOpened, { open: openDetailsModal, close: closeDetailsModal }] =
		useDisclosure(false);

	async function getData() {
		const response = await fetch(`/api/routes/bookreview?offset=${offset}&limit=${limit}`);
		const apidata = await response.json();
		setLoading(false);
		setReviewData(apidata.data);
		setTotal(apidata.total);
	}

	const handlePageChange = (e: any) => {
		const offsetCount = (e - 1) * limit;
		setCurrentPage(e);
		setOffset(offsetCount);
	};

	function decodeHTMLEntities(text: any) {
		var textArea = document.createElement('textarea');
		textArea.innerHTML = text;
		return textArea.value;
	}

	useEffect(() => {
		getData();
	}, [offset, limit]);

	const rows = reviewData.map((element: any) => {
		return (
			<>
				<Table.Tr key={element.id}>
					<Table.Td>{element.full_name || 'N/A'}</Table.Td>
					<Table.Td>{element.name || 'N/A'}</Table.Td>
					<Image
						h={150}
						w={'auto'}
						radius={'md'}
						src={element.thumb_path}
						alt={element.thumb_path}
						style={{ margin: '10px 0', borderRadius: '7px' }}
					/>
					<Table.Td>{element.rating || 'N/A'}</Table.Td>
					<Table.Td>{decodeURIComponent(element.review) || 'N/A'}</Table.Td>
					<Table.Td>
						<Button
							onClick={() => {
								openDetailsModal();
								setDetails(element);
							}}
						>
							Details
						</Button>
					</Table.Td>
				</Table.Tr>
			</>
		);
	});

	return (
		<>
			{loading ? (
				<Loader />
			) : (
				<>
					<Title order={1} style={{ marginBottom: 20 }}>
						Book Review
					</Title>
					<Paper withBorder radius="md" p="md">
						<ScrollArea>
							<Table>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Name</Table.Th>
										<Table.Th>Audiobook Title</Table.Th>
										<Table.Th>Image</Table.Th>
										<Table.Th>Rating</Table.Th>
										<Table.Th>Review</Table.Th>
										<Table.Th>Created At</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>{rows}</Table.Tbody>
							</Table>
						</ScrollArea>
						<Divider my="sm" />
						<Pagination
							value={currentPage}
							onChange={handlePageChange}
							total={getTotalPageNumber(total)}
							siblings={1}
						/>
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
									<Table.Th>Created at</Table.Th>
								</Table.Thead>
								<Table.Tbody>
									<Table.Tr>
										<Table.Td>
											{moment(details?.created_at).format('Do MMM YYYY h:mma') || 'N/A'}
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
