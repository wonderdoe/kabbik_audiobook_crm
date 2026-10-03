'use client';

import {
	Box,
	Chip,
	Grid,
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
import {
	IconBook,
	IconChartBar,
	IconCash,
	IconCoin,
	IconHeadphones,
	IconHistory,
	IconMoodEmpty,
	IconRepeat,
	IconSparkles,
	IconTrendingUp,
	IconUserCheck,
	IconUsers,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import moment from 'moment';
import type { ReactNode } from 'react';
import { MuiAreaChart } from '@/components/Charts/MuiAreaChart';
import { AnalyticCard } from '@/components/mantis/AnalyticCard';
import { MainCard } from '@/components/mantis/MainCard';
import { predictTodayEndOfDay } from '@/helper/chart-day-prediction';
import { cardShadow } from '@/styles/cardShadow';

const PREDICTION_TOOLTIP =
	'Estimated end-of-day total from recent 6-day trend and today’s pace (Asia/Dhaka).';

const GATEWAY_REVENUE_TOOLTIP =
	'Sum from payment gateway tables plus GP/BL from subscription payment log (gross). In-app amounts use USD × 121.14. Robi/GP/BL shares are not applied here; Kabbik breakdown uses operator share.';

const KABBIK_BREAKDOWN_TOOLTIP =
	'Kabbik segment from subscription payment log (succeeded, not cancelled). Same basis as Subscription Revenue report. Robi, GP, and BL use operator revenue share.';
import { GatewayBreakdownChart } from '@/components/revenue/GatewayBreakdownChart';
import {
	breakdownDayTotal,
	type GatewayBreakdownRow,
} from '@/components/revenue/subscription-gateway-breakdown';

function formatCount(value: unknown): string {
	if (value === null || value === undefined) return '—';
	if (typeof value === 'number') return value.toLocaleString();
	return String(value);
}

function pickIcon(title: string) {
	const t = title.toLowerCase();
	if (t.includes('user') && !t.includes('subscriber')) return <IconUsers size={20} stroke={1.75} />;
	if (t.includes('subscriber')) return <IconUserCheck size={20} stroke={1.75} />;
	if (t.includes('play')) return <IconTrendingUp size={20} stroke={1.75} />;
	if (t.includes('payment') || t.includes('amount')) return <IconCoin size={20} stroke={1.75} />;
	if (t.includes('bkash') || t.includes('recurring')) return <IconRepeat size={20} stroke={1.75} />;
	return <IconChartBar size={20} stroke={1.75} />;
}

function pickColor(title: string): 'primary' | 'success' | 'warning' | 'error' {
	const t = title.toLowerCase();
	if (t.includes('payment') || t.includes('amount')) return 'success';
	if (t.includes('play')) return 'primary';
	if (t.includes('subscriber') || t.includes('bkash')) return 'warning';
	return 'primary';
}

const RANK_MEDALS = ['🥇', '🥈', '🥉'];
const RANK_COLORS: Array<'warning' | 'default' | 'primary'> = ['warning', 'default', 'primary'];

type ReportSummary = {
	lifetimeSubscribers: number;
	activeSubscribers: number;
	blSubscribers: number;
	activeRentCount: number;
	totalPlayCount: number;
} | null;

type DashboardContentProps = {
	dashboardData: { title: string; count?: number | unknown[] }[];
	recentTotalPayments: { date: string; Amount: number }[];
	topMostUsedPromos: { today: unknown[]; yesterday: unknown[] };
	reportSummary?: ReportSummary;
	kabbikTodayBreakdown?: GatewayBreakdownRow[];
};

export function DashboardContent({
	dashboardData,
	recentTotalPayments,
	topMostUsedPromos,
	reportSummary,
	kabbikTodayBreakdown = [],
}: DashboardContentProps) {
	const todayYmd = moment().format('YYYY-MM-DD');
	const kabbikDayTotal = breakdownDayTotal(kabbikTodayBreakdown);
	const scalars = (dashboardData ?? []).filter(
		(d): d is { title: string; count: number } => typeof d.count === 'number',
	);

	const bkashSeriesEntry = (dashboardData ?? []).find(
		d => d.title?.toLowerCase().includes('bkash new recurring'),
	);
	const chartBkash = Array.isArray(bkashSeriesEntry?.count)
		? (bkashSeriesEntry.count as { date: string; Count: number }[])
		: [];
	const bkashSlice = chartBkash.slice(0, 2);
	const showBkashChart = bkashSeriesEntry != null;
	const bkashValues = chartBkash.map(d => Number(d.Count) || 0);
	const todayBkash = bkashValues[0] ?? 0;
	const predictBkash = predictTodayEndOfDay({ seriesNewestFirst: bkashValues, todayValue: todayBkash });
	const paymentValues = (recentTotalPayments ?? []).map(p => Number(p.Amount) || 0);
	const todayPayment = paymentValues[0] ?? 0;
	const predictPayment = predictTodayEndOfDay({
		seriesNewestFirst: paymentValues,
		todayValue: todayPayment,
	});

	return (
		<Stack spacing={3}>
			{/* ── Stat cards (live + report snapshot) ── */}
			{scalars.length > 0 && (
				<Grid container spacing={2}>
					{scalars.map((item, index) => (
						<Grid
							item
							xs={12}
							sm={6}
							lg={3}
							key={item.title}
							component={motion.div}
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.06, ease: 'easeOut' }}
						>
							<AnalyticCard
								title={item.title}
								count={formatCount(item.count)}
								icon={pickIcon(item.title)}
								color={pickColor(item.title)}
							/>
						</Grid>
					))}
					{([
						{ label: 'Lifetime Subscribers', value: reportSummary?.lifetimeSubscribers, icon: <IconUsers size={20} stroke={1.75} />, color: 'primary' as const },
						{ label: 'Active Subscribers',  value: reportSummary?.activeSubscribers,  icon: <IconUserCheck size={20} stroke={1.75} />, color: 'success' as const },
						{ label: 'BL Subscribers',      value: reportSummary?.blSubscribers,      icon: <IconRepeat size={20} stroke={1.75} />, color: 'warning' as const },
						{ label: 'Active Rents',        value: reportSummary?.activeRentCount,    icon: <IconBook size={20} stroke={1.75} />, color: 'error' as const },
						{ label: 'Total Play Count',    value: reportSummary?.totalPlayCount,     icon: <IconHeadphones size={20} stroke={1.75} />, color: 'primary' as const },
					]).map((item, index) => (
						<Grid
							item
							xs={12}
							sm={6}
							lg={3}
							key={item.label}
							component={motion.div}
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: (scalars.length + index) * 0.06, ease: 'easeOut' }}
						>
							<AnalyticCard
								title={item.label}
								count={item.value != null ? formatCount(item.value) : '—'}
								icon={item.icon}
								color={item.color}
							/>
						</Grid>
					))}
				</Grid>
			)}

			{/* ── Charts grid ── */}
			{(showBkashChart || (recentTotalPayments?.length ?? 0) > 0) && (
				<Grid container spacing={2}>
					{/* Bkash recurring */}
					{showBkashChart && (
						<Grid item xs={12} md={6}>
							<MainCard
								title="Recent Bkash New Recurring Subscribers"
								subtitle="Last 7 days (Dhaka)"
							>
								<Stack spacing={2}>
									<MuiAreaChart
										h={240}
										data={chartBkash}
										dataKey="date"
										series={[{ name: 'Count', color: 'primary' }]}
										curveType="monotone"
									/>
									<Stack
										direction="row"
										spacing={1.5}
										justifyContent="flex-start"
										alignItems="stretch"
										flexWrap="wrap"
										useFlexGap
										sx={{ width: '100%' }}
									>
										{bkashSlice.map((item, index) => (
											<MiniStat
												key={item.date}
												label={index === 0 ? 'Today' : 'Yesterday'}
												value={formatCount(item.Count)}
												color="success"
												icon={
													index === 0
														? <IconRepeat size={18} stroke={1.75} />
														: <IconHistory size={18} stroke={1.75} />
												}
											/>
										))}
										<MiniStat
											label="Prediction"
											value={formatCount(predictBkash)}
											color="primary"
											tooltip={PREDICTION_TOOLTIP}
											icon={<IconSparkles size={18} stroke={1.75} />}
										/>
									</Stack>
								</Stack>
							</MainCard>
						</Grid>
					)}

					{/* Payment revenue */}
					{(recentTotalPayments?.length ?? 0) > 0 && (
						<Grid item xs={12} md={6}>
							<MainCard
								title={
									<Tooltip title={GATEWAY_REVENUE_TOOLTIP} arrow placement="top">
										<Typography
											component="span"
											variant="subtitle1"
											fontWeight={700}
											color="text.primary"
											lineHeight={1.3}
											sx={{ borderBottom: '1px dotted', borderColor: 'text.disabled', cursor: 'help' }}
										>
											Gateway-source revenue
										</Typography>
									</Tooltip>
								}
								subtitle="Last 7 days · gross gateway totals (BDT)"
							>
								<Stack spacing={2}>
									<MuiAreaChart
										h={240}
										data={recentTotalPayments}
										dataKey="date"
										series={[{ name: 'Amount', color: 'primary' }]}
										curveType="monotone"
										valueFormatter={(value: number) => `${value.toLocaleString()} Tk`}
									/>
									<Stack
										direction="row"
										spacing={1.5}
										justifyContent="flex-start"
										alignItems="stretch"
										flexWrap="wrap"
										useFlexGap
										sx={{ width: '100%' }}
									>
										{recentTotalPayments.slice(0, 2).map((item, index) => (
											<MiniStat
												key={item.date}
												label={index === 0 ? 'Today' : 'Yesterday'}
												value={`${formatCount(item.Amount)} Tk`}
												color="success"
												icon={
													index === 0
														? <IconCash size={18} stroke={1.75} />
														: <IconHistory size={18} stroke={1.75} />
												}
											/>
										))}
										<MiniStat
											label="Prediction"
											value={`${formatCount(predictPayment)} Tk`}
											color="primary"
											tooltip={PREDICTION_TOOLTIP}
											icon={<IconSparkles size={18} stroke={1.75} />}
										/>
									</Stack>
								</Stack>
							</MainCard>
						</Grid>
					)}
				</Grid>
			)}

			{/* ── Today's Kabbik subscription revenue breakdown ── */}
			<MainCard
				title={
					<Tooltip title={KABBIK_BREAKDOWN_TOOLTIP} arrow placement="top">
						<Typography
							component="span"
							variant="subtitle1"
							fontWeight={700}
							color="text.primary"
							lineHeight={1.3}
							sx={{ borderBottom: '1px dotted', borderColor: 'text.disabled', cursor: 'help' }}
						>
							Today&apos;s Kabbik payment breakdown
						</Typography>
					</Tooltip>
				}
				subtitle={`${todayYmd} · net after operator share`}
				secondary={
					<Chip
						label={`${kabbikDayTotal.toLocaleString()} total`}
						size="small"
						color="success"
						sx={{ fontWeight: 700 }}
					/>
				}
			>
				<GatewayBreakdownChart
					rows={kabbikTodayBreakdown}
					emptyMessage="No Kabbik payments today"
				/>
			</MainCard>

			{/* ── Promo tables ── */}
			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<PromoTableCard title="Today's Top Promocodes" rows={topMostUsedPromos?.today ?? []} />
				</Grid>
				<Grid item xs={12} md={6}>
					<PromoTableCard title="Yesterday's Top Promocodes" rows={topMostUsedPromos?.yesterday ?? []} />
				</Grid>
			</Grid>
		</Stack>
	);
}

function MiniStat({
	label,
	value,
	color = 'primary',
	icon,
	tooltip,
}: {
	label: string;
	value: ReactNode;
	color?: 'primary' | 'success' | 'warning' | 'error';
	icon?: ReactNode;
	tooltip?: string;
}) {
	const theme = useTheme();
	const main = theme.palette[color].main;

	const card = (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: 1.5,
				px: 1.75,
				py: 1.25,
				borderRadius: 1,
				bgcolor: 'background.paper',
				border: `1px solid ${theme.palette.divider}`,
				boxShadow: cardShadow.rest,
				flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 8px)' },
				maxWidth: { sm: 180 },
				minWidth: { xs: '100%', sm: 120 },
				transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
				'&:hover': {
					boxShadow: cardShadow.hover,
					borderColor: alpha(main, 0.35),
				},
			}}
		>
			{icon && (
				<Box
					sx={{
						width: 36,
						height: 36,
						borderRadius: 1,
						flexShrink: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: main,
						bgcolor: alpha(main, 0.1),
						border: `1px solid ${alpha(main, 0.15)}`,
					}}
				>
					{icon}
				</Box>
			)}
			<Box sx={{ minWidth: 0, textAlign: 'left' }}>
				<Typography
					variant="caption"
					sx={{
						color: 'text.secondary',
						fontWeight: 600,
						textTransform: 'uppercase',
						letterSpacing: '0.06em',
						lineHeight: 1.3,
						display: 'block',
					}}
				>
					{label}
				</Typography>
				<Typography variant="subtitle2" fontWeight={800} color="text.primary" lineHeight={1.35} noWrap>
					{value}
				</Typography>
			</Box>
		</Box>
	);

	if (tooltip) {
		return (
			<Tooltip title={tooltip} arrow placement="top">
				{card}
			</Tooltip>
		);
	}

	return card;
}

function PromoTableCard({ title, rows }: { title: string; rows: any[] }) {
	const theme = useTheme();

	return (
		<MainCard title={title}>
			{rows.length ? (
				<TableContainer>
					<Table size="small">
						<TableHead>
							<TableRow>
								<TableCell sx={{ fontWeight: 600, width: 36, pl: 1.5 }}>#</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Promocode</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
								<TableCell sx={{ fontWeight: 600 }} align="right">
									Uses
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{rows.map((item: any, index: number) => (
								<TableRow
									key={index}
									hover
									sx={{
										transition: 'background 0.15s',
										'&:hover': {
											bgcolor: alpha(theme.palette.primary.main, 0.04),
										},
									}}
								>
									<TableCell sx={{ pl: 1.5, color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}>
										{index < 3 ? (
											<Tooltip title={`Rank ${index + 1}`}>
												<span>{RANK_MEDALS[index]}</span>
											</Tooltip>
										) : (
											index + 1
										)}
									</TableCell>
									<TableCell>
										<Chip
											label={item.promo_code}
											size="small"
											color={index < 3 ? RANK_COLORS[index] : 'default'}
											variant={index === 0 ? 'filled' : 'outlined'}
											sx={{ fontWeight: 600, letterSpacing: '0.03em', fontSize: '0.72rem' }}
										/>
									</TableCell>
									<TableCell>
										<Typography variant="body2" color="text.secondary" noWrap>
											{item.name}
										</Typography>
									</TableCell>
									<TableCell align="right">
										<Typography variant="body2" fontWeight={700}>
											{item.promo_count?.toLocaleString()}
										</Typography>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			) : (
				<Box sx={{ py: 6, textAlign: 'center' }}>
					<IconMoodEmpty size={32} stroke={1.5} style={{ color: theme.palette.text.disabled, marginBottom: 8 }} />
					<Typography variant="body2" color="text.disabled">
						No promocodes used yet
					</Typography>
				</Box>
			)}
		</MainCard>
	);
}
