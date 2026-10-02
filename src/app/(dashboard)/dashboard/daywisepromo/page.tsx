'use client';

import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	Pagination,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import { directoryTableSx } from '@/components/directory/directoryListUi';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useIsMobileSm } from '@/hooks/use-is-mobile-sm';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import { formatPhoneNumber } from '@/utils/globalHelpers';
import {
	DAYWISE_PROMO_NOT_CACHED_MESSAGE,
	DaywisePromoNotCachedError,
	fetchDaywisePromoSnapshot,
} from './fetchSnapshot';

const limit = 50;

function toYmd(d: Dayjs | null) {
	return d?.isValid() ? d.format('YYYY-MM-DD') : '';
}

export default function DayWisePromo() {
	const isMobileSm = useIsMobileSm();
	const [isOpenedModal, { open: openModal, close: closeModal }] = useDisclosure(false);
	const [apiResponseData, setApiResponseData] = useState<any[]>([]);
	const [offset, setOffset] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [initialLoader, setInitialLoader] = useState(true);
	const [tableLoading, setTableLoading] = useState(false);
	const [modalData, setModalData] = useState<any>(null);
	const [totalData, setTotalData] = useState(0);
	const [draftStart, setDraftStart] = useState<Dayjs | null>(dayjs().subtract(6, 'day'));
	const [draftEnd, setDraftEnd] = useState<Dayjs | null>(dayjs());
	const [queryStart, setQueryStart] = useState(() => dayjs().subtract(6, 'day').format('YYYY-MM-DD'));
	const [queryEnd, setQueryEnd] = useState(() => dayjs().format('YYYY-MM-DD'));
	const [loadError, setLoadError] = useState<string | null>(null);
	const [reloadNonce, setReloadNonce] = useState(0);

	const total = Math.max(1, Math.ceil(totalData / limit));

	const getData = useCallback(async () => {
		const startDate = queryStart;
		const endDate = queryEnd;
		if (!startDate || !endDate) {
			return;
		}
		if (startDate > endDate) {
			return;
		}
		setTableLoading(true);
		setLoadError(null);
		try {
			const apidata = await fetchDaywisePromoSnapshot(offset, limit, startDate, endDate);
			setApiResponseData(apidata?.data ?? []);
			setTotalData(apidata?.total ?? 0);
		} catch (error) {
			console.error(error);
			setApiResponseData([]);
			setTotalData(0);
			if (error instanceof DaywisePromoNotCachedError) {
				setLoadError(error.message);
			} else {
				setLoadError(
					error instanceof Error ? error.message : DAYWISE_PROMO_NOT_CACHED_MESSAGE,
				);
			}
		} finally {
			setInitialLoader(false);
			setTableLoading(false);
		}
	}, [offset, queryStart, queryEnd, reloadNonce]);

	useEffect(() => {
		getData();
	}, [getData]);

	const applyRange = () => {
		const startDate = toYmd(draftStart);
		const endDate = toYmd(draftEnd);
		if (!startDate || !endDate || startDate > endDate) {
			return;
		}
		setQueryStart(startDate);
		setQueryEnd(endDate);
		setCurrentPage(1);
		setOffset(0);
	};

	const handlePageChange = (_e: unknown, page: number) => {
		const offsetCount = (page - 1) * limit;
		setOffset(offsetCount);
		setCurrentPage(page);
	};

	const rows = (apiResponseData ?? []).map((element: any) => (
		<TableRow key={`${element.id}-${element.payment_time}-${element.promo_code}`} hover>
			<TableCell>{element.full_name || 'N/A'}</TableCell>
			<TableCell>{element.promo_code || 'N/A'}</TableCell>
			<TableCell>
				<Typography variant="body2" fontWeight={700} color="success.main">
					৳ {element.amount ?? 'N/A'}
				</Typography>
			</TableCell>
			<TableCell sx={{ whiteSpace: 'nowrap' }}>
				{element?.payment_time ? moment(element.payment_time).format('Do MMM YYYY h:mma') : 'N/A'}
			</TableCell>
			<TableCell>
				<Button
					size="small"
					variant="outlined"
					onClick={() => {
						setModalData(element);
						openModal();
					}}
				>
					Details
				</Button>
			</TableCell>
		</TableRow>
	));

	const hasTableData = (apiResponseData?.length ?? 0) > 0 || totalData > 0;

	if (initialLoader && !hasTableData) {
		return <Loader />;
	}

	if (loadError && !hasTableData) {
		return (
			<PageContainer
				title="Daywise Promo Activation"
				items={[{ label: 'Daywise Promo Activation', href: '/dashboard/daywisepromo' }]}
			>
				<Alert severity="info" sx={{ mb: 2 }}>
					{loadError}
				</Alert>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					Data for the <strong>default last-7-day range</strong> (first page) is refreshed once per day at{' '}
					<strong>2:00 AM Bangladesh time</strong>. After that time, reload this page or tap Check again. If
					it is still empty, contact your administrator.
				</Typography>
				<Button variant="outlined" onClick={() => setReloadNonce(n => n + 1)}>
					Check again
				</Button>
			</PageContainer>
		);
	}

	return (
		<PageContainer
			title="Daywise Promo Activation"
			subtitle={`${totalData.toLocaleString()} activation(s) · ${queryStart} → ${queryEnd} (Dhaka)`}
			items={[{ label: 'Daywise Promo Activation', href: '/dashboard/daywisepromo' }]}
		>
			<MainCard title="Date range">
				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
					<DatePicker
						label="Start date"
						value={draftStart}
						onChange={setDraftStart}
						slotProps={{ textField: { size: 'small', fullWidth: true } }}
					/>
					<DatePicker
						label="End date"
						value={draftEnd}
						onChange={setDraftEnd}
						slotProps={{ textField: { size: 'small', fullWidth: true } }}
					/>
					<Button variant="contained" onClick={applyRange} disabled={tableLoading}>
						Apply
					</Button>
				</Stack>
			</MainCard>
			<Box sx={{ height: 16 }} />
			{loadError && !tableLoading ? (
				<Alert severity="warning" sx={{ mb: 2 }}>
					{loadError}
				</Alert>
			) : null}
			<MainCard contentSX={{ p: 0 }}>
				{tableLoading ? (
					<Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 6 }}>
						<CircularProgress size={28} />
					</Box>
				) : (
					<>
						<TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
							<Table size="small" sx={{ minWidth: 720, ...directoryTableSx }}>
								<TableHead>
									<TableRow>
										<TableCell component="th">Name</TableCell>
										<TableCell component="th">Promo Code</TableCell>
										<TableCell component="th">Amount</TableCell>
										<TableCell component="th">Date</TableCell>
										<TableCell component="th">Action</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{rows.length > 0 ? (
										rows
									) : (
										<TableRow>
											<TableCell colSpan={5}>
												<Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
													No promo activations in this range.
												</Typography>
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</TableContainer>
						<Divider sx={{ my: 1 }} />
						<Box sx={{ px: 2, pb: 2 }}>
							<Pagination
								page={currentPage}
								onChange={handlePageChange}
								count={total}
								color="primary"
							/>
						</Box>
					</>
				)}
			</MainCard>
			<Dialog open={isOpenedModal} onClose={closeModal} maxWidth="lg" fullWidth fullScreen={isMobileSm}>
				<DialogTitle>Promo Activation Details</DialogTitle>
				<DialogContent>
					<TableContainer sx={{ minWidth: 100 }}>
						<Table size="small">
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
	);
}
