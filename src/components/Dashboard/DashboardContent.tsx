'use client';

import {
	Box,
	Chip,
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
import {
	IconBook,
	IconChartBar,
	IconCash,
	IconChartPie,
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
import { formatCompactCurrency } from '@/utils/formatCompactNumber';
import { StatCardValue } from '@/components/ui/StatCardValue';
import { GatewayBreakdownChart } from '@/components/revenue/GatewayBreakdownChart';
import {
	breakdownDayTotal,
	type GatewayBreakdownRow,
} from '@/components/revenue/subscription-gateway-breakdown';

const PREDICTION_TOOLTIP =
	"Estimated end-of-day total (Asia/Dhaka): extrapolates today's run rate through the remaining hours, with a small historical adjustment on quiet days. Always at least today's total.";

const GATEWAY_REVENUE_TOOLTIP =
	'Sum from payment gateway tables plus GP/BL from subscription payment log (gross). In-app amounts use USD × 121.14. Robi/GP/BL shares are not applied here; Kabbik breakdown uses operator share.';

const KABBIK_BREAKDOWN_TOOLTIP =
	'Kabbik segment from subscription payment log (succeeded, not cancelled). Same basis as Subscription Revenue report. Robi, GP, and BL use operator revenue share.';

function pickIcon(title: string) {
	const t = title.toLowerCase();
	if (t.includes('user') && !t.includes('subscriber')) return <IconUsers size={18} stroke={1.75} />;
	if (t.includes('subscriber')) return <IconUserCheck size={18} stroke={1.75} />;
	if (t.includes('play')) return <IconTrendingUp size={18} stroke={1.75} />;
	if (t.includes('payment') || t.includes('amount')) return <IconCash size={18} stroke={1.75} />;
	if (t.includes('bkash') || t.includes('recurring')) return <IconRepeat size={18} stroke={1.75} />;
	return <IconChartBar size={18} stroke={1.75} />;
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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	dashboardData: any[];
	recentTotalPayments: { date: string; Amount: number }[];
	topMostUsedPromos: { today: unknown[]; yesterday: unknown[] };
	reportSummary?: ReportSummary;
	kabbikTodayBreakdown?: GatewayBreakdownRow[];
};

function SectionLabel({ icon, label }: { icon: ReactNode; label: string }) {
	const theme = useTheme();
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
			<Box sx={{ color: theme.palette.primary.main, display: 'flex' }}>{icon}</Box>
			<Typography
				variant="overline"
				sx={{
					color: 'text.secondary',
					fontWeight: 700,
					letterSpacing: '0.08em',
					lineHeight: 1,
				}}
			>
				{label}
			</Typography>
			<Box sx={{ flex: 1, height: 1, bgcolor: 'divider', ml: 1 }} />
		</Box>
	);
}

export function DashboardContent({
	dashboardData,
	recentTotalPayments,
	topMostUsedPromos,
	reportSummary,
	kabbikTodayBreakdown = [],
}: DashboardContentProps) {
	const theme = useTheme();
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

	const hasSnapshot = reportSummary != null;

	return (
		<Stack spacing={3}>

			{/* ── Live stat cards ── */}
			{scalars.length > 0 && (
				<Stack spacing={1.5}>
					<SectionLabel icon={<IconTrendingUp size={15} stroke={2} />} label="Live metrics" />
					<Box sx={{ overflow: 'hidden' }}>
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
									count={item.count}
									icon={pickIcon(item.title)}
									color={pickColor(item.title)}
								/>
							</Grid>
						))}
					</Grid>
					</Box>
				</Stack>
			)}

			{/* ── Subscription snapshot (report summary) ── */}
			{hasSnapshot && (
				<Stack spacing={1.5}>
					<SectionLabel icon={<IconUserCheck size={15} stroke={2} />} label="Subscription snapshot" />
					<Box sx={{ overflow: 'hidden' }}>
					<Grid container spacing={2}>
						{([
								{ label: 'Lifetime Subscribers', value: reportSummary?.lifetimeSubscribers, icon: <IconUsers size={18} stroke={1.75} />, color: 'primary' as const },
								{ label: 'Active Subscribers', value: reportSummary?.activeSubscribers, icon: <IconUserCheck size={18} stroke={1.75} />, color: 'success' as const },
								{ label: 'BL Subscribers', value: reportSummary?.blSubscribers, icon: <IconRepeat size={18} stroke={1.75} />, color: 'warning' as const },
								{ label: 'Active Rents', value: reportSummary?.activeRentCount, icon: <IconBook size={18} stroke={1.75} />, color: 'error' as const },
								{ label: 'Total Play Count', value: reportSummary?.totalPlayCount, icon: <IconHeadphones size={18} stroke={1.75} />, color: 'primary' as const },
							]).map((item, index) => (
								<Grid
									item
									xs={12}
									sm={6}
									lg={index < 2 ? 3 : 4}
									key={item.label}
									component={motion.div}
									initial={{ opacity: 0, y: 12 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: index * 0.07, ease: 'easeOut' }}
								>
									<AnalyticCard
										title={item.label}
										count={item.value != null ? item.value : '—'}
										icon={item.icon}
										color={item.color}
									/>
								</Grid>
						))}
					</Grid>
					</Box>
			</Stack>
		)}

		{/* ── Revenue charts ── */}
			{(showBkashChart || (recentTotalPayments?.length ?? 0) > 0) && (
				<Stack spacing={1.5}>
					<SectionLabel icon={<IconChartPie size={15} stroke={2} />} label="Revenue trends · last 7 days" />
					<Box sx={{ overflow: 'hidden' }}>
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
											h={220}
											data={chartBkash}
											dataKey="date"
											series={[{ name: 'Count', color: 'primary' }]}
											curveType="monotone"
										/>
										<MiniStatRow>
											{bkashSlice.map((item, index) => (
												<MiniStat
													key={item.date}
													label={index === 0 ? 'Today' : 'Yesterday'}
													value={item.Count}
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
												value={predictBkash}
												color="primary"
												tooltip={PREDICTION_TOOLTIP}
												icon={<IconSparkles size={18} stroke={1.75} />}
											/>
										</MiniStatRow>
									</Stack>
								</MainCard>
							</Grid>
						)}

						{/* Gateway revenue */}
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
											h={220}
											data={recentTotalPayments}
											dataKey="date"
											series={[{ name: 'Amount', color: 'primary' }]}
											curveType="monotone"
											valueFormatter={(value: number) => `${value.toLocaleString()} Tk`}
										/>
										<MiniStatRow>
											{recentTotalPayments.slice(0, 2).map((item, index) => (
												<MiniStat
													key={item.date}
													label={index === 0 ? 'Today' : 'Yesterday'}
													value={formatCompactCurrency(item.Amount)}
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
												value={formatCompactCurrency(predictPayment)}
												color="primary"
												tooltip={PREDICTION_TOOLTIP}
												icon={<IconSparkles size={18} stroke={1.75} />}
											/>
										</MiniStatRow>
									</Stack>
								</MainCard>
							</Grid>
						)}
					</Grid>
					</Box>
				</Stack>
			)}

			{/* ── Kabbik breakdown ── */}
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
							Today's Kabbik payment breakdown
						</Typography>
					</Tooltip>
				}
				subtitle={`${todayYmd} · net after operator share`}
				secondary={
					kabbikDayTotal > 0 ? (
						<Chip
							label={`${kabbikDayTotal.toLocaleString()} Tk today`}
							size="small"
							color="success"
							sx={{ fontWeight: 700 }}
						/>
					) : null
				}
			>
				<GatewayBreakdownChart
					rows={kabbikTodayBreakdown}
					emptyMessage="No Kabbik payments today"
				/>
			</MainCard>

			{/* ── Promo tables ── */}
			<Box sx={{ overflow: 'hidden' }}>
			<Grid container spacing={2} alignItems="stretch">
				<Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
					<PromoTableCard title="Today's Top Promocodes" rows={topMostUsedPromos?.today ?? []} />
				</Grid>
				<Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
					<PromoTableCard title="Yesterday's Top Promocodes" rows={topMostUsedPromos?.yesterday ?? []} />
				</Grid>
			</Grid>
			</Box>
		</Stack>
	);
}

function MiniStatRow({ children }: { children: ReactNode }) {
	const theme = useTheme();
	return (
		<Box
			sx={{
				p: 1.5,
				borderRadius: 1.5,
				border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
				bgcolor: alpha(theme.palette.background.default, 0.6),
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))',
				gap: 1,
				alignItems: 'stretch',
			}}
		>
			{children}
		</Box>
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
				alignItems: 'flex-start',
				gap: 1,
				px: { xs: 1.25, sm: 1.5 },
				py: 1,
				borderRadius: 1,
				bgcolor: 'background.paper',
				border: `1px solid ${alpha(main, 0.18)}`,
				boxShadow: cardShadow.rest,
				width: '100%',
				minWidth: 0,
				height: '100%',
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
						width: { xs: 28, sm: 32 },
						height: { xs: 28, sm: 32 },
						borderRadius: 1,
						flexShrink: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: main,
						bgcolor: alpha(main, 0.1),
					}}
				>
					{icon}
				</Box>
			)}
			<Box sx={{ minWidth: 0, flex: 1 }}>
				<Typography
					variant="caption"
					sx={{
						color: 'text.secondary',
						fontWeight: 600,
						textTransform: 'uppercase',
						letterSpacing: { xs: '0.04em', sm: '0.06em' },
						lineHeight: 1.25,
						display: 'block',
						whiteSpace: 'normal',
						wordBreak: 'break-word',
					}}
				>
					{label}
				</Typography>
				<Typography
					variant="subtitle2"
					fontWeight={800}
					color={`${color}.main`}
					lineHeight={1.35}
					sx={{
						fontSize: { xs: '0.8125rem', sm: '0.875rem' },
						whiteSpace: 'normal',
						wordBreak: 'break-word',
						overflowWrap: 'anywhere',
					}}
				>
					<StatCardValue value={value} />
				</Typography>
			</Box>
		</Box>
	);

	const wrapped = (
		<Box sx={{ minWidth: 0, width: '100%', height: '100%', display: 'flex' }}>
			{card}
		</Box>
	);

	if (tooltip) {
		return (
			<Tooltip title={tooltip} arrow placement="top">
				<Box component="span" sx={{ minWidth: 0, width: '100%', display: 'block' }}>
					{wrapped}
				</Box>
			</Tooltip>
		);
	}

	return wrapped;
}

function PromoTableCard({ title, rows }: { title: string; rows: any[] }) {
	const theme = useTheme();
	const maxCount = rows.length ? Math.max(...rows.map((r: any) => Number(r.promo_count) || 0)) : 1;

	return (
		<MainCard title={title} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
			{rows.length ? (
				<TableContainer>
					<Table size="small">
						<TableHead>
							<TableRow>
								<TableCell sx={{ fontWeight: 600, width: 36, pl: 1.5 }}>#</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Promocode</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
								<TableCell sx={{ fontWeight: 600, minWidth: 100 }} align="right">
									Usage
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{rows.map((item: any, index: number) => {
								const count = Number(item.promo_count) || 0;
								const pct = Math.round((count / Math.max(maxCount, 1)) * 100);
								return (
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
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
												<Box sx={{ flex: 1, maxWidth: 60 }}>
													<LinearProgress
														variant="determinate"
														value={pct}
														sx={{
															height: 4,
															borderRadius: 2,
															bgcolor: alpha(theme.palette.primary.main, 0.1),
															'& .MuiLinearProgress-bar': {
																bgcolor: index === 0
																	? theme.palette.warning.main
																	: theme.palette.primary.main,
																borderRadius: 2,
															},
														}}
													/>
												</Box>
												<Typography variant="body2" fontWeight={700} sx={{ minWidth: 24, textAlign: 'right' }}>
													{count.toLocaleString()}
												</Typography>
											</Box>
										</TableCell>
									</TableRow>
								);
							})}
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
