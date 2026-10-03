'use client';

import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Grid,
	LinearProgress,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
	alpha,
	useTheme,
} from '@mui/material';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { PackageWiseRevenueChart } from '@/components/Charts/PackageWiseRevenueChart';
import { MainCard } from '@/components/mantis/MainCard';
import { StatCard } from '@/components/ui/StatCard';
import { CustomDatePicker } from '@/components/Form/CustomDatePicker';
import { checkgetPermission } from '@/helper/Commonfunction';
import { getPackageWiseRevenueUrl } from '@/utils/constant';
import { defaultPackageWiseReportRangeClient } from '@/utils/dhaka-date-client';
import { formatCompactCurrency } from '@/utils/formatCompactNumber';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	IconBox,
	IconChartBar,
	IconCoin,
	IconMoodEmpty,
	IconRefresh,
	IconSearch,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState, type ElementType } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z
	.object({
		startDate: z.date({ required_error: 'Start date is required' }),
		endDate: z.date({ required_error: 'End date is required' }),
	})
	.refine(data => data.endDate >= data.startDate, {
		message: 'End date must be on or after start date',
		path: ['endDate'],
	});

type FormData = z.infer<typeof formSchema>;

type PackageRow = { name: string; total: number };

type ReportPayload = {
	list: PackageRow[];
	total: number;
	updatedAt?: string;
};

function ymdToDate(ymd: string) {
	return moment(ymd, 'YYYY-MM-DD').toDate();
}

function truncateLabel(name: string, max = 18) {
	if (name.length <= max) return name;
	return `${name.slice(0, max - 1)}…`;
}

export default function PackageWiseReport() {
	const theme = useTheme();
	const initialRange = useMemo(() => defaultPackageWiseReportRangeClient(), []);
	const [data, setData] = useState<ReportPayload | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [updatedAt, setUpdatedAt] = useState<string | null>(null);
	const [date, setDate] = useState(initialRange);

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			startDate: ymdToDate(initialRange.startDate),
			endDate: ymdToDate(initialRange.endDate),
		},
	});

	const getData = useCallback(
		async (refresh = false) => {
			setIsLoading(true);
			setLoadError(null);
			try {
				const refreshParam = refresh ? '&refresh=1' : '';
				const res = await fetch(
					`${getPackageWiseRevenueUrl}?startDate=${date.startDate}&endDate=${date.endDate}${refreshParam}`,
					{ cache: 'no-store' },
				);
				if (!res.ok) {
					const body = await res.json().catch(() => ({}));
					throw new Error(body?.message ?? 'Request failed');
				}
				const result = (await res.json()) as ReportPayload;
				setData(result);
				setUpdatedAt(result.updatedAt ?? null);
			} catch (error) {
				console.error('Package wise report fetch failed:', error);
				setLoadError('Could not load report. Try again or use a shorter date range.');
			} finally {
				setIsLoading(false);
			}
		},
		[date],
	);

	useEffect(() => {
		getData();
	}, [getData]);

	const handleSubmit = (formData: FormData) => {
		setDate({
			startDate: moment(formData.startDate).format('YYYY-MM-DD'),
			endDate: moment(formData.endDate).format('YYYY-MM-DD'),
		});
	};

	const handleRefresh = async () => {
		if (!checkgetPermission('see_package_wise_report')) return;
		setRefreshing(true);
		try {
			await getData(true);
		} finally {
			setRefreshing(false);
		}
	};

	const sortedList = useMemo(() => {
		const list = data?.list ?? [];
		return [...list].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
	}, [data?.list]);

	const total = data?.total ?? 0;
	const packageCount = sortedList.filter(row => row.total > 0).length;
	const topRow = sortedList[0];
	const topSharePct = total > 0 && topRow ? Math.round((topRow.total / total) * 100) : 0;

	const chartRows = useMemo(
		() =>
			sortedList
				.filter(row => row.total > 0)
				.slice(0, 8)
				.map(row => ({
					name: truncateLabel(row.name, 14),
					fullName: row.name,
					Amount: row.total,
				})),
		[sortedList],
	);

	const rangeLabel = `${date.startDate} → ${date.endDate}`;
	const updatedLabel = updatedAt ? `Updated ${moment(updatedAt).fromNow()}` : null;
	const canRefresh = checkgetPermission('see_package_wise_report');

	return (
		<PageContainer
			title="Package Wise Report"
			subtitle={
				updatedLabel ? (
					<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
						{updatedLabel} · {rangeLabel} (Dhaka)
					</Typography>
				) : (
					<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
						{rangeLabel} · subscription package revenue (BDT)
					</Typography>
				)
			}
			items={[{ label: 'Package Wise Report', href: '/dashboard/package-wise-report' }]}
			actions={
				canRefresh ? (
					<Button
						variant="outlined"
						size="small"
						startIcon={refreshing ? <CircularProgress size={13} /> : <IconRefresh size={14} />}
						disabled={refreshing || isLoading}
						onClick={handleRefresh}
					>
						Refresh
					</Button>
				) : undefined
			}
		>
			<Stack spacing={2} sx={{ minWidth: 0, width: '100%' }}>
				<Grid container spacing={2}>
					<Grid item xs={12} sm={6} lg={4} sx={{ display: 'flex' }}>
						<StatCard
							title="Total revenue"
							value={formatCompactCurrency(total)}
							color="success"
							icon={<IconCoin size={22} />}
							loading={isLoading && !data}
							subtitle={total > 0 ? `${total.toLocaleString()} Tk` : undefined}
						/>
					</Grid>
					<Grid item xs={12} sm={6} lg={4} sx={{ display: 'flex' }}>
						<StatCard
							title="Packages with sales"
							value={packageCount}
							color="primary"
							icon={<IconBox size={22} />}
							loading={isLoading && !data}
						/>
					</Grid>
					<Grid item xs={12} sm={6} lg={4} sx={{ display: 'flex' }}>
						<StatCard
							title="Top package share"
							value={topRow ? `${topSharePct}%` : '—'}
							color="info"
							icon={<IconChartBar size={22} />}
							loading={isLoading && !data}
							subtitle={topRow?.name}
						/>
					</Grid>
				</Grid>

				<MainCard title="Date range">
					<form onSubmit={form.handleSubmit(handleSubmit, err => console.error(err))}>
						<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
							<Box
								sx={{
									flex: 1,
									minWidth: { sm: 200 },
									'& .MuiFormControl-root': { mt: 0, mb: 0 },
									'& .MuiFormHelperText-root': {
										display: form.formState.errors.startDate ? 'block' : 'none',
									},
								}}
							>
								<CustomDatePicker
									name="startDate"
									label="Start date"
									control={form.control}
									placeholder="Select start date"
									error={(form.formState.errors.startDate?.message) as string}
								/>
							</Box>
							<Box
								sx={{
									flex: 1,
									minWidth: { sm: 200 },
									'& .MuiFormControl-root': { mt: 0, mb: 0 },
									'& .MuiFormHelperText-root': {
										display: form.formState.errors.endDate ? 'block' : 'none',
									},
								}}
							>
								<CustomDatePicker
									name="endDate"
									label="End date"
									control={form.control}
									placeholder="Select end date"
									error={(form.formState.errors.endDate?.message) as string}
								/>
							</Box>
							<Button
								type="submit"
								variant="contained"
								startIcon={<IconSearch size={16} />}
								sx={{ px: 3, whiteSpace: 'nowrap', flexShrink: 0 }}
							>
								Apply
							</Button>
						</Stack>
					</form>
				</MainCard>

				{loadError ? (
					<Alert severity="warning" onClose={() => setLoadError(null)}>
						{loadError}
					</Alert>
				) : null}

				<MainCard
					title="Package breakdown"
					subtitle={rangeLabel}
					secondary={
						!isLoading && sortedList.length > 0 ? (
							<Chip label={`${packageCount} package${packageCount === 1 ? '' : 's'}`} size="small" color="primary" variant="outlined" />
						) : undefined
					}
				>
					{isLoading ? (
						<Box sx={{ py: 6, textAlign: 'center' }}>
							<CircularProgress size={32} />
						</Box>
					) : sortedList.length === 0 ? (
						<Box sx={{ py: 6, textAlign: 'center' }}>
							<IconMoodEmpty
								size={36}
								stroke={1.5}
								style={{ color: theme.palette.text.disabled, marginBottom: 8 }}
							/>
							<Typography variant="body2" color="text.disabled">
								No package revenue for this range
							</Typography>
						</Box>
					) : (
						<Stack spacing={3}>
							{chartRows.length > 1 ? (
								<Box sx={{ width: '100%', minWidth: 0 }}>
									<Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 1.5, display: 'block' }}>
										Top packages by revenue
									</Typography>
									<PackageWiseRevenueChart data={chartRows} h={300} />
								</Box>
							) : null}

							<TableContainer sx={{ overflowX: 'auto' }}>
								<Table size="small">
									<TableHead>
										<TableRow sx={{ bgcolor: 'grey.50' }}>
											<TableCell sx={{ fontWeight: 700 }}>#</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Package</TableCell>
											<TableCell sx={{ fontWeight: 700, minWidth: 160 }}>Share</TableCell>
											<TableCell sx={{ fontWeight: 700 }} align="right">
												Amount (Tk)
											</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{sortedList.map((item, index) => {
											const pct = Math.round((item.total / Math.max(total, 1)) * 100);
											return (
												<TableRow
													key={item.name}
													component={motion.tr as ElementType}
													initial={{ opacity: 0, x: -6 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ duration: 0.2, delay: index * 0.03 }}
													hover
													sx={{ '&:hover': { bgcolor: 'grey.50' } }}
												>
													<TableCell>
														<Typography variant="caption" color="text.secondary" fontWeight={700}>
															{index + 1}
														</Typography>
													</TableCell>
													<TableCell>
														<Typography variant="body2" fontWeight={600}>
															{item.name}
														</Typography>
													</TableCell>
													<TableCell>
														<Stack spacing={0.5}>
															<Typography variant="caption" color="text.secondary">
																{pct}%
															</Typography>
															<Tooltip title={`${pct}% of range total`}>
																<LinearProgress
																	variant="determinate"
																	value={pct}
																	sx={{
																		height: 5,
																		borderRadius: 3,
																		bgcolor: alpha(theme.palette.primary.main, 0.12),
																		'& .MuiLinearProgress-bar': {
																			bgcolor: 'primary.main',
																			borderRadius: 3,
																		},
																	}}
																/>
															</Tooltip>
														</Stack>
													</TableCell>
													<TableCell align="right">
														<Typography variant="body2" fontWeight={700} color="success.main">
															{item.total.toLocaleString()}
														</Typography>
													</TableCell>
												</TableRow>
											);
										})}
										<TableRow sx={{ bgcolor: 'grey.50', borderTop: `2px solid ${theme.palette.divider}` }}>
											<TableCell />
											<TableCell>
												<Typography fontWeight={800} variant="body2">Total</Typography>
											</TableCell>
											<TableCell />
											<TableCell align="right">
												<Typography fontWeight={800} color="success.main">
													{total.toLocaleString()}
												</Typography>
											</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</TableContainer>
						</Stack>
					)}
				</MainCard>
			</Stack>
		</PageContainer>
	);
}
