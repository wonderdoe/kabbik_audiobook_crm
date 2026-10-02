'use client';
import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	Pagination,
	Paper,
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
			<TableRow key={element.id}>
				<TableCell>{element.full_name || 'N/A'}</TableCell>
				<TableCell>{element.promo_code || 'N/A'}</TableCell>
				<TableCell>
					<Typography variant="body1" fontWeight={900} color="green">
						৳ {element.amount || 'N/A'}
					</Typography>
				</TableCell>
				<TableCell>{moment(element?.payment_time).format('Do MMM YYYY h:mma') || 'N/A'}</TableCell>
				<TableCell>
					<Button
						onClick={() => {
							setModalData(element);
							openModal();
						}}
					>
						Details
					</Button>
				</TableCell>
			</TableRow>
		);
	});

	return (
		<>
			{loading ? (
				<Loader />
			) : (
			<PageContainer title="Day Wise Promo Activation" items={[{ label: 'Day Wise Promo', href: '/dashboard/daywisepromo' }]}>

<MainCard contentSX={{ p: 0 }}>
						<Box sx={{ overflow: "auto" }}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell component="th">Name</TableCell>
										<TableCell component="th">Promo Code</TableCell>
										<TableCell component="th">Amount</TableCell>
										<TableCell component="th">Date</TableCell>
										<TableCell component="th">Action</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>{rows}</TableBody>
							</Table>
						</Box>
						<Divider sx={{ my: 1 }} />
						<Pagination page={currentPage}
							onChange={handlePageChange}
							count={total}
						/>
					</MainCard>
					<Dialog
						
						open={isOpenedModal}
						onClose={closeModal}
						maxWidth="lg" sx={{ width: "100%" }}
					>
<DialogTitle>Promo Activation Details</DialogTitle>
<DialogContent>
						<TableContainer sx={{ minWidth: 100 }}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell component="th">Id</TableCell>
										<TableCell component="th">Phone</TableCell>
										<TableCell component="th">Email</TableCell>
										<TableCell component="th">Source</TableCell>
										<TableCell component="th">Payment Mode</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									<TableRow>
										<TableCell>{modalData?.id || 'N/A'}</TableCell>
										<TableCell>
											{modalData?.phone_no ? formatPhoneNumber(modalData?.phone_no) : 'N/A'}
										</TableCell>
										<TableCell>{modalData?.user_email || 'N/A'}</TableCell>
										<TableCell>{modalData?.source || 'N/A'}</TableCell>
										<TableCell>{modalData?.payment_mode || 'N/A'}</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</TableContainer>
					</DialogContent>
</Dialog>
			</PageContainer>
			)}
		</>
	);
}
