'use client';

import {
	Box,
	Button,
	Chip,
	CircularProgress,
	IconButton,
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
import { MainCard } from '@/components/mantis/MainCard';
import { decodeWord } from '@/helper/Commonfunction';
import { deleteScheduleUrl, scheduleListUrl } from '@/utils/constant';
import { IconRefresh, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const tableHeadSx = {
	'& .MuiTableCell-head': {
		py: 1,
		px: 1.5,
		bgcolor: 'grey.50',
		borderBottom: 1,
		borderColor: 'divider',
	},
};

const ScheduleList = () => {
	const [schedules, setSchedules] = useState<any[]>([]);
	const [isLoader, setIsLoader] = useState(false);
	const [nextTokens, setNextTokens] = useState<string[]>([]);
	const [page, setPage] = useState(1);

	async function getSchedules(pageToLoad: number = 1) {
		try {
			setIsLoader(true);
			const tokenIndex = pageToLoad - 2;
			const pageNextToken =
				tokenIndex >= 0 && tokenIndex < nextTokens.length ? nextTokens[tokenIndex] : undefined;
			const bodyPayload: any = {};
			if (pageNextToken !== undefined) bodyPayload.nextToken = pageNextToken;

			const response = await fetch(scheduleListUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(bodyPayload),
			});
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
			const data = await response.json();

			const formatted = [...(data?.data ?? [])].sort(
				(a, b) => new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime(),
			);
			setSchedules(formatted);

			const newNextToken = data?.nextToken;
			if (newNextToken != null) {
				setNextTokens(prev => {
					const idx = pageToLoad - 1;
					if (idx < prev.length) return [...prev.slice(0, idx), newNextToken, ...prev.slice(idx + 1)];
					return [...prev, newNextToken];
				});
			}
			return data;
		} catch (err) {
			console.error('API call failed:', err);
		} finally {
			setIsLoader(false);
		}
	}

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
			const response = await fetch(`${deleteScheduleUrl}?scheduleName=${name}`);
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
			await response.json();
			getSchedules(page);
			Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Schedule removed successfully.' });
		} catch (err) {
			console.error(err);
			Swal.fire({ icon: 'error', title: 'Failed', text: 'Something went wrong. Please try again.' });
		}
	};

	const getLocaleDateTime = (dateTime: string) =>
		dateTime
			? new Date(new Date(dateTime).getTime() + 6 * 60 * 60 * 1000).toLocaleString('en-US', {
					timeZone: 'Asia/Dhaka',
					year: 'numeric',
					month: 'short',
					day: '2-digit',
					hour: 'numeric',
					minute: '2-digit',
					hour12: true,
			  })
			: '—';

	useEffect(() => { getSchedules(1); }, []);

	const totalPages = nextTokens.length + 1;

	return (
		<Stack spacing={0}>
			{/* Header row */}
			<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
				<Box>
					<Typography variant="h6" fontWeight={600}>Scheduled notifications</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
						{schedules.length} upcoming schedule{schedules.length === 1 ? '' : 's'}
					</Typography>
				</Box>
				<Button
					variant="outlined"
					size="small"
					startIcon={isLoader ? <CircularProgress size={14} sx={{ color: 'inherit' }} /> : <IconRefresh size={16} />}
					disabled={isLoader}
					onClick={() => { setPage(1); setNextTokens([]); getSchedules(1); }}
				>
					Refresh
				</Button>
			</Stack>

			<MainCard contentSX={{ p: 0 }}>
				<TableContainer>
					<Table size="small" stickyHeader sx={tableHeadSx}>
						<TableHead>
							<TableRow>
								{['Title', 'Scheduled time', 'Actions'].map(label => (
									<TableCell key={label} component="th" align={label === 'Actions' ? 'right' : 'left'}>
										<Typography variant="overline" color="text.secondary" fontWeight={700}>{label}</Typography>
									</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{schedules.length > 0 ? (
								schedules.map((item: any, index: number) => (
									<TableRow key={index} hover sx={{ '& td': { py: 1, px: 1.5 } }}>
										<TableCell sx={{ maxWidth: 320 }}>
											<Typography variant="body2" noWrap title={decodeWord(item.title)}>
												{decodeWord(item.title)}
											</Typography>
										</TableCell>
										<TableCell>
											<Chip
												label={getLocaleDateTime(item.scheduleTime)}
												size="small"
												variant="outlined"
												sx={{ fontWeight: 600 }}
											/>
										</TableCell>
										<TableCell align="right">
											<Tooltip title="Delete schedule">
												<IconButton
													size="small"
													color="error"
													onClick={() => deleteSchedule(item?.Name)}
												>
													<IconTrash size={16} stroke={1.5} />
												</IconButton>
											</Tooltip>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={3}>
										<Typography textAlign="center" color="text.secondary" variant="body2" sx={{ py: 4 }}>
											{isLoader ? 'Loading…' : 'No scheduled notifications'}
										</Typography>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</MainCard>

			{/* Pagination */}
			{totalPages > 1 && (
				<Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'flex-end' }}>
					{Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
						<Button
							key={pageNumber}
							size="small"
							variant={page === pageNumber ? 'contained' : 'outlined'}
							disabled={isLoader}
							onClick={() => handlePageChange(pageNumber)}
							sx={{ minWidth: 36 }}
						>
							{pageNumber}
						</Button>
					))}
				</Stack>
			)}
		</Stack>
	);
};

export default ScheduleList;
