'use client';

import {
	Alert,
	Avatar,
	Box,
	Button,
	Chip,
	CircularProgress,
	IconButton,
	Pagination,
	Skeleton,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
} from '@mui/material';
import { decodeWord } from '@/helper/Commonfunction';
import { deleteScheduleUrl, scheduleListUrl } from '@/utils/constant';
import {
	extractScheduledNotificationList,
	formatScheduleListDateTime,
	getScheduleItemDateTimeRaw,
	getScheduleItemName,
	getScheduleItemTitle,
	parseScheduleItemDate,
} from '@/utils/pushNotificationSchedule';
import { IconBell, IconCalendarEvent, IconRefresh, IconTrash } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

const tableSx = {
	'& .MuiTableCell-head': {
		py: 1.25,
		px: 2,
		fontWeight: 700,
		bgcolor: 'grey.50',
		borderBottom: 1,
		borderColor: 'divider',
	},
	'& .MuiTableCell-body': {
		px: 2,
		py: 1.5,
		borderColor: 'divider',
		verticalAlign: 'middle',
	},
};

type ScheduleListProps = {
	refreshToken?: number;
};

function LoadingSkeletonRows() {
	return (
		<>
			{[0, 1, 2].map(i => (
				<TableRow key={i}>
					<TableCell>
						<Stack direction="row" spacing={1.5} alignItems="center">
							<Skeleton variant="circular" width={36} height={36} />
							<Skeleton variant="text" width="70%" />
						</Stack>
					</TableCell>
					<TableCell><Skeleton variant="rounded" width={140} height={28} /></TableCell>
					<TableCell align="right"><Skeleton variant="circular" width={32} height={32} sx={{ ml: 'auto' }} /></TableCell>
				</TableRow>
			))}
		</>
	);
}

const ScheduleList = ({ refreshToken = 0 }: ScheduleListProps) => {
	const [schedules, setSchedules] = useState<Record<string, unknown>[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [nextTokens, setNextTokens] = useState<string[]>([]);
	const [page, setPage] = useState(1);

	const getSchedules = useCallback(async (pageToLoad: number = 1, tokens: string[] = nextTokens) => {
		try {
			setIsLoading(true);
			setLoadError(null);
			const tokenIndex = pageToLoad - 2;
			const pageNextToken =
				tokenIndex >= 0 && tokenIndex < tokens.length ? tokens[tokenIndex] : undefined;
			const bodyPayload: Record<string, string> = {};
			if (pageNextToken !== undefined) bodyPayload.nextToken = pageNextToken;

			const response = await fetch(scheduleListUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(bodyPayload),
			});
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
			const data = await response.json();
			const { items, nextToken: listNextToken } = extractScheduledNotificationList(data);

			const formatted = [...items].sort((a, b) => {
				const ta = parseScheduleItemDate(a)?.getTime() ?? 0;
				const tb = parseScheduleItemDate(b)?.getTime() ?? 0;
				return ta - tb;
			});
			setSchedules(formatted);

			const newNextToken = listNextToken ?? data?.nextToken;
			if (newNextToken != null) {
				setNextTokens(prev => {
					const idx = pageToLoad - 1;
					if (idx < prev.length) return [...prev.slice(0, idx), newNextToken, ...prev.slice(idx + 1)];
					return [...prev, newNextToken];
				});
			}
		} catch (err) {
			console.error('API call failed:', err);
			setLoadError('Could not load scheduled notifications. Please try again.');
			setSchedules([]);
		} finally {
			setIsLoading(false);
		}
	}, [nextTokens]);

	const refreshList = () => {
		setPage(1);
		setNextTokens([]);
		getSchedules(1, []);
	};

	const handlePageChange = (pageNumber: number) => {
		setPage(pageNumber);
		getSchedules(pageNumber);
	};

	const deleteSchedule = async (name: string) => {
		const confirm = await Swal.fire({
			title: 'Delete this schedule?',
			text: 'This cannot be undone.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#d33',
			cancelButtonColor: '#aaa',
			confirmButtonText: 'Delete',
		});
		if (!confirm.isConfirmed) return;

		try {
			const response = await fetch(`${deleteScheduleUrl}?scheduleName=${encodeURIComponent(name)}`);
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
			await response.json();
			getSchedules(page);
			Swal.fire({ icon: 'success', title: 'Deleted', text: 'Schedule removed successfully.' });
		} catch (err) {
			console.error(err);
			Swal.fire({ icon: 'error', title: 'Failed', text: 'Something went wrong. Please try again.' });
		}
	};

	useEffect(() => {
		getSchedules(1, []);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
	}, []);

	useEffect(() => {
		if (!refreshToken) return;
		refreshList();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- refresh when parent schedules
	}, [refreshToken]);

	const totalPages = Math.max(nextTokens.length + 1, 1);

	const nextUpcoming = useMemo(() => {
		const now = Date.now();
		return schedules.find(s => {
			const t = parseScheduleItemDate(s)?.getTime();
			return t != null && t >= now;
		});
	}, [schedules]);

	return (
		<Stack spacing={2}>
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				alignItems={{ xs: 'flex-start', sm: 'center' }}
				justifyContent="space-between"
				spacing={1.5}
			>
				<Box>
					<Typography variant="h6" fontWeight={600}>Scheduled notifications</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
						Upcoming push notifications queued to send automatically
					</Typography>
				</Box>
				<Button
					variant="outlined"
					size="small"
					startIcon={
						isLoading ? (
							<CircularProgress size={14} sx={{ color: 'inherit' }} />
						) : (
							<IconRefresh size={16} />
						)
					}
					disabled={isLoading}
					onClick={refreshList}
				>
					Refresh
				</Button>
			</Stack>

			<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
				<Box
					sx={{
						flex: 1,
						p: 2,
						borderRadius: 2,
						border: 1,
						borderColor: 'divider',
						bgcolor: 'grey.50',
					}}
				>
					<Typography variant="overline" color="text.secondary" fontWeight={700}>
						Total queued
					</Typography>
					<Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
						{isLoading ? '—' : schedules.length}
					</Typography>
				</Box>
				<Box
					sx={{
						flex: 2,
						p: 2,
						borderRadius: 2,
						border: 1,
						borderColor: 'divider',
					}}
				>
					<Typography variant="overline" color="text.secondary" fontWeight={700}>
						Next to send
					</Typography>
					<Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }} noWrap>
						{isLoading
							? '—'
							: nextUpcoming
								? formatScheduleListDateTime(getScheduleItemDateTimeRaw(nextUpcoming))
								: 'None scheduled'}
					</Typography>
					{!isLoading && nextUpcoming && (
						<Typography variant="caption" color="text.secondary" noWrap display="block">
							{decodeWord(getScheduleItemTitle(nextUpcoming))}
						</Typography>
					)}
				</Box>
			</Stack>

			{loadError && (
				<Alert severity="error" onClose={() => setLoadError(null)}>
					{loadError}
				</Alert>
			)}

			<Box sx={{ borderRadius: 2, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
				<TableContainer>
					<Table size="small" stickyHeader sx={tableSx}>
						<TableHead>
							<TableRow>
								<TableCell>Notification</TableCell>
								<TableCell sx={{ width: 200 }}>Send at (Dhaka)</TableCell>
								<TableCell align="right" sx={{ width: 72 }}>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{isLoading ? (
								<LoadingSkeletonRows />
							) : schedules.length > 0 ? (
								schedules.map((item, index) => {
									const title = decodeWord(getScheduleItemTitle(item));
									const scheduleName = getScheduleItemName(item);
									const when = formatScheduleListDateTime(getScheduleItemDateTimeRaw(item));
									const whenDate = parseScheduleItemDate(item);
									const isPast = whenDate != null && whenDate.getTime() < Date.now();

									return (
										<TableRow key={scheduleName ?? index} hover>
											<TableCell sx={{ maxWidth: 360 }}>
												<Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
													<Avatar
														variant="rounded"
														sx={{
															width: 36,
															height: 36,
															bgcolor: 'primary.50',
															color: 'primary.main',
														}}
													>
														<IconBell size={18} stroke={1.75} />
													</Avatar>
													<Box minWidth={0}>
														<Typography variant="body2" fontWeight={600} noWrap title={title}>
															{title}
														</Typography>
														{scheduleName && (
															<Typography variant="caption" color="text.secondary" noWrap display="block">
																ID: {scheduleName}
															</Typography>
														)}
													</Box>
												</Stack>
											</TableCell>
											<TableCell>
												<Chip
													icon={<IconCalendarEvent size={14} />}
													label={when}
													size="small"
													color={isPast ? 'default' : 'primary'}
													variant={isPast ? 'outlined' : 'filled'}
													sx={{ fontWeight: 600, maxWidth: '100%' }}
												/>
											</TableCell>
											<TableCell align="right">
												<Tooltip title={scheduleName ? 'Delete schedule' : 'Missing schedule id'}>
													<span>
														<IconButton
															size="small"
															color="error"
															disabled={!scheduleName}
															onClick={() => scheduleName && deleteSchedule(scheduleName)}
														>
															<IconTrash size={16} stroke={1.5} />
														</IconButton>
													</span>
												</Tooltip>
											</TableCell>
										</TableRow>
									);
								})
							) : (
								<TableRow>
									<TableCell colSpan={3}>
										<Stack alignItems="center" spacing={1} sx={{ py: 6, px: 2 }}>
											<Avatar sx={{ width: 48, height: 48, bgcolor: 'grey.100', color: 'text.secondary' }}>
												<IconCalendarEvent size={24} stroke={1.5} />
											</Avatar>
											<Typography variant="subtitle2" fontWeight={600}>
												No scheduled notifications
											</Typography>
											<Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={360}>
												Use Audiobook Details or Common tabs with &quot;Schedule for later&quot; to queue a notification here.
											</Typography>
										</Stack>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>

				{!isLoading && schedules.length > 0 && totalPages > 1 && (
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						alignItems={{ xs: 'stretch', sm: 'center' }}
						justifyContent="space-between"
						gap={1}
						sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}
					>
						<Typography variant="body2" color="text.secondary">
							Page {page} of {totalPages}
						</Typography>
						<Pagination
							page={page}
							count={totalPages}
							onChange={(_, p) => handlePageChange(p)}
							size="small"
							color="primary"
							siblingCount={1}
							sx={{ '& .MuiPagination-ul': { justifyContent: { xs: 'center', sm: 'flex-end' } } }}
						/>
					</Stack>
				)}
			</Box>
		</Stack>
	);
};

export default ScheduleList;
