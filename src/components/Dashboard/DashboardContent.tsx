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
	IconCalendar,
	IconCalendarStats,
	IconChartBar,
	IconCoin,
	IconMoodEmpty,
	IconRepeat,
	IconTrendingUp,
	IconUserCheck,
	IconUsers,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { MuiAreaChart } from '@/components/Charts/MuiAreaChart';
import { AnalyticCard } from '@/components/mantis/AnalyticCard';
import { MainCard } from '@/components/mantis/MainCard';

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

type DashboardContentProps = {
	dashboardData: { title: string; count?: number | unknown[] }[];
	recentTotalPayments: { date: string; Amount: number }[];
	topMostUsedPromos: { today: unknown[]; yesterday: unknown[] };
};

export function DashboardContent({
	dashboardData,
	recentTotalPayments,
	topMostUsedPromos,
}: DashboardContentProps) {
	const scalars = (dashboardData ?? []).filter(
		(d): d is { title: string; count: number } => typeof d.count === 'number',
	);
	const bkashSlice = Array.isArray(dashboardData?.[3]?.count)
		? (dashboardData[3].count as { date: string; Count: number }[]).slice(0, 2)
		: [];
	const chartBkash = Array.isArray(dashboardData?.[3]?.count) ? dashboardData[3].count : [];

	return (
		<Stack spacing={3}>
			{/* ── Stat cards ── */}
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
				</Grid>
			)}

			{/* ── Bkash recurring chart ── */}
			{chartBkash.length > 0 && (
				<MainCard
					title="Bkash Recurring Subscribers"
					subtitle="New recurring sign-ups over time"
					secondary={
						<Stack direction="row" spacing={1.5}>
							{bkashSlice.map((item, index) => (
								<MiniStat
									key={item.date}
									label={index === 0 ? 'Today' : 'Yesterday'}
									value={formatCount(item.Count)}
									color="warning"
									icon={index === 0
										? <IconCalendar size={11} stroke={2} />
										: <IconCalendarStats size={11} stroke={2} />
									}
								/>
							))}
						</Stack>
					}
				>
					<MuiAreaChart
						h={280}
						data={chartBkash}
						dataKey="date"
						series={[{ name: 'Count', color: 'indigo.6' }]}
						curveType="monotone"
					/>
				</MainCard>
			)}

			{/* ── Payment chart ── */}
			{(recentTotalPayments?.length ?? 0) > 0 && (
				<MainCard
					title="Total Payment Revenue"
					subtitle="Daily payment totals (BDT)"
					secondary={
						<Stack direction="row" spacing={1.5}>
							{recentTotalPayments.slice(0, 2).map((item, index) => (
								<MiniStat
									key={item.date}
									label={index === 0 ? 'Today' : 'Yesterday'}
									value={`${formatCount(item.Amount)} Tk`}
									color="success"
									icon={index === 0
										? <IconCoin size={11} stroke={2} />
										: <IconTrendingUp size={11} stroke={2} />
									}
								/>
							))}
						</Stack>
					}
				>
					<MuiAreaChart
						h={280}
						data={recentTotalPayments}
						dataKey="date"
						series={[{ name: 'Amount', color: 'teal.6' }]}
						curveType="monotone"
						valueFormatter={(value: number) => `${value.toLocaleString()} Tk`}
					/>
				</MainCard>
			)}

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
}: {
	label: string;
	value: ReactNode;
	color?: 'primary' | 'success' | 'warning' | 'error';
	icon?: ReactNode;
}) {
	const theme = useTheme();
	const main = theme.palette[color].main;

	return (
		<Box
			sx={{
				px: 1.5,
				py: 0.75,
				borderRadius: 1.5,
				bgcolor: alpha(main, 0.08),
				border: `1px solid ${alpha(main, 0.2)}`,
				textAlign: 'center',
				minWidth: 80,
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.4, mb: 0.2 }}>
				{icon && (
					<Box sx={{ color: main, display: 'flex', alignItems: 'center', lineHeight: 1 }}>
						{icon}
					</Box>
				)}
				<Typography
					variant="caption"
					sx={{ color: main, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.3 }}
				>
					{label}
				</Typography>
			</Box>
			<Typography variant="subtitle2" fontWeight={800} color="text.primary" lineHeight={1.4}>
				{value}
			</Typography>
		</Box>
	);
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
