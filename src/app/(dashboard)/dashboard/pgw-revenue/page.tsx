'use client';

import {
	Avatar,
	Box,
	Button,
	Chip,
	CircularProgress,
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
import { MainCard } from '@/components/mantis/MainCard';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	IconCoin,
	IconMoodEmpty,
	IconRefresh,
	IconSearch,
	IconUserCheck,
	IconUserPlus,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CustomDatePicker } from '@/components/Form/CustomDatePicker';
import { checkgetPermission } from '@/helper/Commonfunction';

const formSchema = z.object({
	startDate: z.date({ required_error: 'Required' }),
	endDate:   z.date({ required_error: 'Required' }),
});
type FormData = z.infer<typeof formSchema>;

/* ── Inline summary stat ─────────────────────── */
function StatPill({ label, value, color }: { label: string; value: string | number; color: 'success' | 'primary' | 'warning' }) {
	const theme = useTheme();
	const main = theme.palette[color].main;
	return (
		<Box sx={{
			flex: 1, p: 2, borderRadius: 2,
			border: `1px solid ${alpha(main, 0.24)}`,
			bgcolor: alpha(main, 0.06), textAlign: 'center',
		}}>
			<Typography variant="caption" sx={{ color: main, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.5 }}>
				{label}
			</Typography>
			<Typography variant="h5" fontWeight={800} color="text.primary">{value}</Typography>
		</Box>
	);
}

export default function PaymentGateWiseRevenue() {
	const [data, setData] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [updatedAt, setUpdatedAt] = useState<string | null>(null);
	const theme = useTheme();
	const [date, setDate] = useState({
		startDate: moment().format('YYYY-MM-DD'),
		endDate:   moment().format('YYYY-MM-DD'),
	});
	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: { startDate: new Date(), endDate: new Date() },
	});

	const getData = useCallback(async (refresh = false) => {
		try {
			setIsLoading(true);
			const r = refresh ? '&refresh=1' : '';
			const res = await fetch(`/api/routes/pgw-revenue?startDate=${date.startDate}&endDate=${date.endDate}${r}`, { cache: 'no-store' });
			if (!res.ok) throw new Error('Failed');
			const apidata = await res.json();
			setUpdatedAt(apidata.updatedAt ?? null);
			setData(Array.isArray(apidata) ? apidata : (apidata.data ?? []));
		} catch (e) { console.error(e); }
		finally { setIsLoading(false); }
	}, [date]);

	const handleRefresh = async () => {
		if (!checkgetPermission('see_payment_gateway_wise_report')) return;
		setRefreshing(true);
		try { await getData(true); } finally { setRefreshing(false); }
	};

	useEffect(() => { getData(); }, [getData]);

	const handleSubmit = (fd: FormData) => {
		setDate({
			startDate: moment(fd.startDate).format('YYYY-MM-DD'),
			endDate:   moment(fd.endDate).format('YYYY-MM-DD'),
		});
	};

	const totalAmount   = data.reduce((a, d) => a + (d?.total_amount ?? 0), 0);
	const totalNew      = data.reduce((a, d) => a + Number(d?.new_subscribers ?? 0), 0);
	const totalExisting = data.reduce((a, d) => a + Number(d?.old_subscribers ?? 0), 0);
	const updatedLabel  = updatedAt ? `Updated ${moment(updatedAt).fromNow()}` : null;

	return (
		<PageContainer
			title="Payment Gateway Report"
			items={[{ label: 'PGW Revenue', href: '/dashboard/pgw-revenue' }]}
			subtitle={updatedLabel
				? <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{updatedLabel}</Typography>
				: undefined
			}
			actions={
				checkgetPermission('see_payment_gateway_wise_report') ? (
					<Button variant="outlined" size="small"
						startIcon={refreshing ? <CircularProgress size={13} /> : <IconRefresh size={14} />}
						disabled={refreshing} onClick={handleRefresh}>
						Refresh
					</Button>
				) : undefined
			}
		>
			<MainCard contentSX={{ p: 3 }}>
				<Stack spacing={3}>

					{/* ── Date filter ── */}
					<Box sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
						<Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 2, display: 'block' }}>
							Date range
						</Typography>
						<form onSubmit={form.handleSubmit(handleSubmit, e => console.error(e))}>
							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
								<Box sx={{ flex: 1, '& .MuiFormControl-root': { mt: 0, mb: 0 }, '& .MuiFormHelperText-root': { display: 'none' } }}>
									<CustomDatePicker name="startDate" label="Start Date" control={form.control}
										placeholder="Pick a date" error={(form.formState.errors.startDate?.message) as string} />
								</Box>
								<Box sx={{ flex: 1, '& .MuiFormControl-root': { mt: 0, mb: 0 }, '& .MuiFormHelperText-root': { display: 'none' } }}>
									<CustomDatePicker name="endDate" label="End Date" control={form.control}
										placeholder="Pick a date" error={(form.formState.errors.endDate?.message) as string} />
								</Box>
								<Button type="submit" variant="contained" startIcon={<IconSearch size={15} />}
									sx={{ px: 3, whiteSpace: 'nowrap', flexShrink: 0 }}>
									Apply
								</Button>
							</Stack>
						</form>
					</Box>

					{/* ── Results ── */}
					{isLoading ? (
						<Box sx={{ py: 6, textAlign: 'center' }}>
							<CircularProgress size={32} />
						</Box>
					) : data.length === 0 ? (
						<Box sx={{ py: 6, textAlign: 'center' }}>
							<IconMoodEmpty size={36} stroke={1.5} style={{ color: theme.palette.text.disabled, marginBottom: 8 }} />
							<Typography variant="body2" color="text.disabled">No data for selected date range</Typography>
						</Box>
					) : (
						<>
							{/* ── Summary stats ── */}
							<Box sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
								<Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 2, display: 'block' }}>
									Summary
								</Typography>
								<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
									<StatPill label="Total Revenue" value={`${totalAmount.toLocaleString()} Tk`} color="success" />
									<StatPill label="New Subscribers" value={totalNew.toLocaleString()} color="primary" />
									<StatPill label="Existing Users" value={totalExisting.toLocaleString()} color="warning" />
								</Stack>
							</Box>

							{/* ── Gateway table ── */}
							<Box sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
								<Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 2, display: 'block' }}>
									Gateway breakdown · {date.startDate} → {date.endDate}
								</Typography>
								<TableContainer>
									<Table size="small">
										<TableHead>
											<TableRow sx={{ bgcolor: 'grey.50' }}>
												<TableCell sx={{ fontWeight: 700, width: 64 }}>Logo</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Gateway</TableCell>
												<TableCell sx={{ fontWeight: 700, minWidth: 160 }}>Revenue share</TableCell>
												<TableCell sx={{ fontWeight: 700 }} align="right">Amount (Tk)</TableCell>
												<TableCell sx={{ fontWeight: 700 }} align="right">Existing</TableCell>
												<TableCell sx={{ fontWeight: 700 }} align="right">New</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{data.map((item: any, index: number) => {
												const pct = Math.round(((item?.total_amount ?? 0) / Math.max(totalAmount, 1)) * 100);
												return (
													<TableRow
														key={item?.payment_source}
														component={motion.tr as any}
														initial={{ opacity: 0, x: -6 }}
														animate={{ opacity: 1, x: 0 }}
														transition={{ duration: 0.2, delay: index * 0.04 }}
														hover
														sx={{ '&:hover': { bgcolor: 'grey.50' } }}
													>
														<TableCell>
															{item?.image ? (
																<Box
																	component="img"
																	src={item.image}
																	alt={item.payment_source}
																	sx={{
																		width: 52, height: 52,
																		objectFit: 'contain',
																		borderRadius: 1.5,
																		border: `1px solid ${theme.palette.divider}`,
																		bgcolor: '#fff',
																		p: 0.5,
																		display: 'block',
																	}}
																/>
															) : (
																<Avatar variant="rounded" sx={{ width: 52, height: 52, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 700, fontSize: '0.8rem' }}>
																	{(item?.payment_source ?? '?').slice(0, 2).toUpperCase()}
																</Avatar>
															)}
														</TableCell>
														<TableCell>
															<Typography variant="body2" fontWeight={600}>{item?.payment_source}</Typography>
														</TableCell>
														<TableCell>
															<Stack spacing={0.5}>
																<Typography variant="caption" color="text.secondary">{pct}%</Typography>
																<Tooltip title={`${pct}% of total`}>
																	<LinearProgress variant="determinate" value={pct} sx={{
																		height: 5, borderRadius: 3,
																		bgcolor: alpha(theme.palette.success.main, 0.12),
																		'& .MuiLinearProgress-bar': { bgcolor: 'success.main', borderRadius: 3 },
																	}} />
																</Tooltip>
															</Stack>
														</TableCell>
														<TableCell align="right">
															<Typography variant="body2" fontWeight={700} color="success.main">
																{(item?.total_amount ?? 0).toLocaleString()}
															</Typography>
														</TableCell>
														<TableCell align="right">
															<Chip label={item?.old_subscribers ?? 0} size="small" color="warning" variant="outlined" sx={{ fontWeight: 600, minWidth: 38 }} />
														</TableCell>
														<TableCell align="right">
															<Chip label={item?.new_subscribers ?? 0} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600, minWidth: 38 }} />
														</TableCell>
													</TableRow>
												);
											})}
											{/* Totals */}
											<TableRow sx={{ bgcolor: 'grey.50', borderTop: `2px solid ${theme.palette.divider}` }}>
												<TableCell />
												<TableCell><Typography fontWeight={800} variant="body2">Total</Typography></TableCell>
												<TableCell />
												<TableCell align="right"><Typography fontWeight={800} color="success.main">{totalAmount.toLocaleString()}</Typography></TableCell>
												<TableCell align="right"><Typography fontWeight={800}>{totalExisting.toLocaleString()}</Typography></TableCell>
												<TableCell align="right"><Typography fontWeight={800}>{totalNew.toLocaleString()}</Typography></TableCell>
											</TableRow>
										</TableBody>
									</Table>
								</TableContainer>
							</Box>
						</>
					)}
				</Stack>
			</MainCard>
		</PageContainer>
	);
}
