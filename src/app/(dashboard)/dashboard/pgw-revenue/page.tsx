'use client';

import {
	Avatar,
	Box,
	Button,
	Chip,
	CircularProgress,
	Grid,
	LinearProgress,
	Stack,
	Tooltip,
	Typography,
	alpha,
	useTheme,
} from '@mui/material';
import {
	IconCash,
	IconMoodEmpty,
	IconRefresh,
	IconSearch,
	IconTrendingUp,
	IconUserCheck,
	IconUserPlus,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CustomDatePicker } from '@/components/Form/CustomDatePicker';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import { StatCardValue } from '@/components/ui/StatCardValue';
import { checkgetPermission } from '@/helper/Commonfunction';
import { cardShadow } from '@/styles/cardShadow';
import {
	formatCompactCurrency,
	isCompactNotation,
	formatCompactCount,
} from '@/utils/formatCompactNumber';

const formSchema = z.object({
	startDate: z.date({ required_error: 'Required' }),
	endDate: z.date({ required_error: 'Required' }),
});
type FormData = z.infer<typeof formSchema>;

/* ── Helpers ── */
function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
	const theme = useTheme();
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
			<Box sx={{ color: theme.palette.primary.main, display: 'flex' }}>{icon}</Box>
			<Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em', lineHeight: 1 }}>
				{label}
			</Typography>
			<Box sx={{ flex: 1, height: 1, bgcolor: 'divider', ml: 1 }} />
		</Box>
	);
}

function SummaryStatCard({
	label, value, suffix = '', icon, color, delay = 0,
}: {
	label: string; value: number; suffix?: string; icon: React.ReactNode; color: string; delay?: number;
}) {
	const theme = useTheme();
	const display = suffix ? formatCompactCurrency(value, suffix) : formatCompactCount(value);
	const fullTitle = suffix ? `${value.toLocaleString()}${suffix}` : value.toLocaleString();
	return (
		<Box
			component={motion.div}
			initial={{ opacity: 0, y: 14 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.28, delay, ease: 'easeOut' }}
			whileHover={{ y: -2, boxShadow: `0 6px 16px ${alpha(color, 0.12)}` }}
			sx={{
				bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, borderRadius: 1,
				overflow: 'hidden', position: 'relative', height: '100%', boxShadow: cardShadow.rest,
				transition: 'box-shadow 0.2s, transform 0.2s',
				'&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: `linear-gradient(180deg, ${color}, ${alpha(color, 0.4)})` },
			}}
		>
			<Box sx={{ pl: 2.5, pr: 2, pt: 2, pb: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
				<Stack spacing={0.75}>
					<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
						{label}
					</Typography>
					{isCompactNotation(value) ? (
						<Tooltip title={fullTitle} arrow placement="top">
							<Typography variant="h4" fontWeight={800} lineHeight={1.15} color="text.primary" component="span">{display}</Typography>
						</Tooltip>
					) : (
						<Typography variant="h4" fontWeight={800} lineHeight={1.15} color="text.primary">{display}</Typography>
					)}
				</Stack>
				<Box sx={{ width: 44, height: 44, bgcolor: alpha(color, 0.1), color, borderRadius: 1, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 1px ${alpha(color, 0.15)}` }}>
					{icon}
				</Box>
			</Box>
		</Box>
	);
}

/* ── Gateway row (the modernized breakdown design) ── */
function GatewayRow({ item, totalAmount, index }: { item: any; totalAmount: number; index: number }) {
	const theme = useTheme();
	const amount = item?.total_amount ?? 0;
	const newSubs = Number(item?.new_subscribers ?? 0);
	const oldSubs = Number(item?.old_subscribers ?? 0);
	const totalSubs = newSubs + oldSubs;
	const amountPct = Math.round((amount / Math.max(totalAmount, 1)) * 100);
	const newPct = totalSubs > 0 ? (newSubs / totalSubs) * 100 : 0;
	const oldPct = totalSubs > 0 ? (oldSubs / totalSubs) * 100 : 0;

	const primaryColor = theme.palette.primary.main;
	const warningColor = theme.palette.warning.main;
	const successColor = theme.palette.success.main;

	return (
		<Box
			component={motion.div}
			initial={{ opacity: 0, x: -8 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.22, delay: index * 0.05, ease: 'easeOut' }}
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: { xs: 1.5, sm: 2 },
				px: 0,
				py: 1.5,
				borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
				'&:last-child': { borderBottom: 'none' },
				'&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.025) },
				borderRadius: 0.5,
				transition: 'background 0.15s',
			}}
		>
			{/* Logo */}
			{item?.image ? (
				<Box
					component="img"
					src={item.image}
					alt={item.payment_source}
					sx={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 1, border: `1px solid ${theme.palette.divider}`, bgcolor: '#fff', p: 0.25, flexShrink: 0 }}
				/>
			) : (
				<Avatar variant="rounded" sx={{ width: 36, height: 36, bgcolor: alpha(primaryColor, 0.1), color: 'primary.main', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
					{(item?.payment_source ?? '?').slice(0, 2).toUpperCase()}
				</Avatar>
			)}

			{/* Name + % of total */}
			<Box sx={{ width: 180, flexShrink: 0 }}>
				<Typography variant="body2" fontWeight={700} lineHeight={1.2} noWrap>{item?.payment_source}</Typography>
				<Typography variant="caption" color="text.disabled" lineHeight={1}>{amountPct}% of total</Typography>
			</Box>

			{/* Revenue bar */}
			<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
					<Typography variant="caption" color="text.secondary" fontWeight={600}>Revenue</Typography>
					{totalSubs > 0 && (
						<Typography variant="caption" color="text.disabled">
							{totalSubs.toLocaleString()} subs
						</Typography>
					)}
				</Box>
				{/* Revenue progress */}
				<Tooltip title={`${amount.toLocaleString()} Tk — ${amountPct}% of total`} arrow>
					<LinearProgress
						variant="determinate"
						value={amountPct}
						sx={{
							height: 7, borderRadius: 2,
							bgcolor: alpha(successColor, 0.1),
							'& .MuiLinearProgress-bar': {
								background: `linear-gradient(90deg, ${successColor}, ${alpha(successColor, 0.6)})`,
								borderRadius: 2,
							},
						}}
					/>
				</Tooltip>
				{/* Subscriber split bar */}
				{totalSubs > 0 && (
					<Box sx={{ display: 'flex', height: 4, borderRadius: 1, overflow: 'hidden', bgcolor: alpha(theme.palette.divider, 0.3) }}>
						<Tooltip title={`New: ${newSubs.toLocaleString()}`} arrow>
							<Box sx={{ width: `${newPct}%`, bgcolor: primaryColor, transition: 'width 0.5s ease' }} />
						</Tooltip>
						<Tooltip title={`Existing: ${oldSubs.toLocaleString()}`} arrow>
							<Box sx={{ width: `${oldPct}%`, bgcolor: warningColor, transition: 'width 0.5s ease' }} />
						</Tooltip>
					</Box>
				)}
			</Box>

			{/* Amount */}
			<Box sx={{ minWidth: 80, textAlign: 'right', flexShrink: 0 }}>
				{isCompactNotation(amount) ? (
					<Tooltip title={`${amount.toLocaleString()} Tk`} arrow>
						<Typography variant="body2" fontWeight={800} color="success.main" component="span">
							{formatCompactCurrency(amount, ' Tk')}
						</Typography>
					</Tooltip>
				) : (
					<Typography variant="body2" fontWeight={800} color="success.main">
						{amount.toLocaleString()} Tk
					</Typography>
				)}
			</Box>

			{/* Sub chips */}
			<Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end', minWidth: { xs: 0, sm: 120 } }}>
				<Tooltip title="New subscribers" arrow>
					<Chip
						icon={<IconUserPlus size={11} />}
						label={newSubs.toLocaleString()}
						size="small"
						sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: alpha(primaryColor, 0.1), color: primaryColor, border: `1px solid ${alpha(primaryColor, 0.25)}`, '& .MuiChip-label': { px: 0.75 } }}
					/>
				</Tooltip>
				<Tooltip title="Existing users" arrow>
					<Chip
						icon={<IconUserCheck size={11} />}
						label={oldSubs.toLocaleString()}
						size="small"
						sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: alpha(warningColor, 0.1), color: warningColor, border: `1px solid ${alpha(warningColor, 0.25)}`, '& .MuiChip-label': { px: 0.75 } }}
					/>
				</Tooltip>
			</Box>
		</Box>
	);
}

export default function PaymentGateWiseRevenue() {
	const theme = useTheme();
	const [data, setData] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [updatedAt, setUpdatedAt] = useState<string | null>(null);
	const [date, setDate] = useState({
		startDate: moment().format('YYYY-MM-DD'),
		endDate: moment().format('YYYY-MM-DD'),
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
			endDate: moment(fd.endDate).format('YYYY-MM-DD'),
		});
	};

	const totalAmount = data.reduce((a, d) => a + (d?.total_amount ?? 0), 0);
	const totalNew = data.reduce((a, d) => a + Number(d?.new_subscribers ?? 0), 0);
	const totalExisting = data.reduce((a, d) => a + Number(d?.old_subscribers ?? 0), 0);
	const updatedLabel = updatedAt ? `Updated ${moment(updatedAt).fromNow()}` : null;
	const sorted = [...data].sort((a, b) => (b?.total_amount ?? 0) - (a?.total_amount ?? 0));

	return (
		<PageContainer
			title="Payment Gateway Report"
			items={[{ label: 'PGW Revenue', href: '/dashboard/pgw-revenue' }]}
			subtitle={updatedLabel ? <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{updatedLabel}</Typography> : undefined}
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
			<Stack spacing={3}>

				{/* ── Date filter ── */}
				<MainCard title="Date range" sx={{ borderStyle: 'dashed' }}>
					<form onSubmit={form.handleSubmit(handleSubmit, e => console.error(e))}>
						<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
							<Box sx={{ flex: 1, width: '100%', '& .MuiFormControl-root': { mt: 0, mb: 0 }, '& .MuiFormHelperText-root': { display: 'none' } }}>
								<CustomDatePicker name="startDate" label="Start Date" control={form.control} placeholder="Pick a date" error={form.formState.errors.startDate?.message as string} />
							</Box>
							<Box sx={{ flex: 1, width: '100%', '& .MuiFormControl-root': { mt: 0, mb: 0 }, '& .MuiFormHelperText-root': { display: 'none' } }}>
								<CustomDatePicker name="endDate" label="End Date" control={form.control} placeholder="Pick a date" error={form.formState.errors.endDate?.message as string} />
							</Box>
							<Button type="submit" variant="contained" startIcon={<IconSearch size={15} />}
								sx={{ whiteSpace: 'nowrap', flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'flex-end' }, mb: { sm: '2px' } }}>
								Apply
							</Button>
						</Stack>
					</form>
				</MainCard>

				{/* ── Results ── */}
				{isLoading ? (
					<Box sx={{ py: 8, textAlign: 'center' }}>
						<CircularProgress size={36} />
						<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Loading…</Typography>
					</Box>
				) : data.length === 0 ? (
					<Box sx={{ py: 8, textAlign: 'center' }}>
						<IconMoodEmpty size={40} stroke={1.5} style={{ color: theme.palette.text.disabled, marginBottom: 8 }} />
						<Typography variant="body2" color="text.disabled">No data for selected date range</Typography>
					</Box>
				) : (
					<Stack spacing={3}>

						{/* ── Summary stat cards ── */}
						<Stack spacing={1.5}>
							<SectionLabel
								icon={<IconTrendingUp size={15} stroke={2} />}
								label={`Summary · ${date.startDate === date.endDate ? date.startDate : `${date.startDate} → ${date.endDate}`}`}
							/>
							<Box sx={{ overflow: 'hidden' }}>
								<Grid container spacing={2}>
									<Grid item xs={12} sm={4}>
										<SummaryStatCard label="Total Revenue" value={totalAmount} suffix=" Tk" icon={<IconCash size={20} stroke={1.75} />} color={theme.palette.success.main} delay={0} />
									</Grid>
									<Grid item xs={12} sm={4}>
										<SummaryStatCard label="New Subscribers" value={totalNew} icon={<IconUserPlus size={20} stroke={1.75} />} color={theme.palette.primary.main} delay={0.06} />
									</Grid>
									<Grid item xs={12} sm={4}>
										<SummaryStatCard label="Existing Users" value={totalExisting} icon={<IconUserCheck size={20} stroke={1.75} />} color={theme.palette.warning.main} delay={0.12} />
									</Grid>
								</Grid>
							</Box>
						</Stack>

						{/* ── Legend ── */}
						<Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
							{[
								{ label: 'Revenue bar', color: theme.palette.success.main },
								{ label: 'New subs', color: theme.palette.primary.main },
								{ label: 'Existing', color: theme.palette.warning.main },
							].map(l => (
								<Box key={l.label} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.35, borderRadius: 999, bgcolor: alpha(l.color, 0.1), border: `1px solid ${alpha(l.color, 0.25)}` }}>
									<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: l.color }} />
									<Typography variant="caption" fontWeight={600} color="text.secondary">{l.label}</Typography>
								</Box>
							))}
						</Box>

						{/* ── Gateway breakdown rows ── */}
						<MainCard
							title="Gateway breakdown"
							subtitle={`${date.startDate}${date.startDate !== date.endDate ? ` → ${date.endDate}` : ''} · sorted by revenue`}
							secondary={
								<Chip
									label={`${data.length} gateway${data.length !== 1 ? 's' : ''}`}
									size="small"
									variant="outlined"
									sx={{ fontWeight: 600 }}
								/>
							}
						>
							<Box
								sx={{
									borderRadius: 1,
									border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
									bgcolor: 'background.paper',
									boxShadow: cardShadow.rest,
									px: 2,
									py: 0.5,
								}}
							>
								{sorted.map((item, i) => (
									<GatewayRow key={item?.payment_source} item={item} totalAmount={totalAmount} index={i} />
								))}

								{/* Totals row */}
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: { xs: 1.5, sm: 2 },
										py: 1.25,
										borderTop: `2px solid ${theme.palette.divider}`,
										bgcolor: alpha(theme.palette.background.default, 0.5),
										mx: -2,
										px: 2,
									}}
								>
									<Box sx={{ width: 36, flexShrink: 0 }} />
									<Box sx={{ width: 180, flexShrink: 0 }}>
										<Typography variant="body2" fontWeight={800}>Total</Typography>
									</Box>
									<Box sx={{ flex: 1 }} />
									<Box sx={{ minWidth: 80, textAlign: 'right' }}>
										{isCompactNotation(totalAmount) ? (
											<Tooltip title={`${totalAmount.toLocaleString()} Tk`} arrow>
												<Typography variant="body2" fontWeight={800} color="success.main" component="span">
													{formatCompactCurrency(totalAmount, ' Tk')}
												</Typography>
											</Tooltip>
										) : (
											<Typography variant="body2" fontWeight={800} color="success.main">
												{totalAmount.toLocaleString()} Tk
											</Typography>
										)}
									</Box>
									<Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, minWidth: { xs: 0, sm: 120 }, justifyContent: 'flex-end' }}>
										<Chip icon={<IconUserPlus size={11} />} label={totalNew.toLocaleString()} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`, '& .MuiChip-label': { px: 0.75 } }} />
										<Chip icon={<IconUserCheck size={11} />} label={totalExisting.toLocaleString()} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800, bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', border: `1px solid ${alpha(theme.palette.warning.main, 0.25)}`, '& .MuiChip-label': { px: 0.75 } }} />
									</Box>
								</Box>
							</Box>
						</MainCard>

					</Stack>
				)}
			</Stack>
		</PageContainer>
	);
}
