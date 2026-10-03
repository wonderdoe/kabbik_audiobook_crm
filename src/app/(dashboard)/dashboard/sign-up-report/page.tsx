'use client';

import {
	Avatar,
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
	IconHeadphones,
	IconMoodEmpty,
	IconTrendingUp,
	IconUserCheck,
	IconUsers,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { MuiAreaChart } from '@/components/Charts/MuiAreaChart';
import Loader from '@/components/Loader';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import { StatCardValue } from '@/components/ui/StatCardValue';
import { TrendValue } from '@/components/ui/TrendValue';
import { cardShadow } from '@/styles/cardShadow';

const KABBIK_LOGO = 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780521478.png';
const BL_LOGO = 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780481387.png';
const TOFFEE_LOGO = 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780502718.png';

const PLATFORMS = [
	{ logo: KABBIK_LOGO, alt: 'Kabbik', key: 'kabbikCount', color: '#d4117e' },
	{ logo: BL_LOGO, alt: 'Banglalink', key: 'myBLCount', color: '#2e7d32' },
	{ logo: TOFFEE_LOGO, alt: 'Toffee', key: 'toffeeCount', color: '#c62828' },
] as const;

type Row = { date: string; kabbikCount: number; myBLCount: number; toffeeCount: number };

function SummaryCard({
	label,
	value,
	icon,
	color,
	delay = 0,
}: {
	label: string;
	value: number;
	icon: React.ReactNode;
	color: string;
	delay?: number;
}) {
	const theme = useTheme();
	const light = alpha(color, 0.1);
	return (
		<Box
			component={motion.div}
			initial={{ opacity: 0, y: 14 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay, ease: 'easeOut' }}
			whileHover={{ y: -2, boxShadow: `0 6px 16px ${alpha(color, 0.12)}` }}
			sx={{
				bgcolor: 'background.paper',
				border: `1px solid ${theme.palette.divider}`,
				borderRadius: 1,
				overflow: 'hidden',
				position: 'relative',
				height: '100%',
				boxShadow: cardShadow.rest,
				transition: 'box-shadow 0.2s, transform 0.2s',
				'&::before': {
					content: '""',
					position: 'absolute',
					left: 0,
					top: 0,
					bottom: 0,
					width: 4,
					background: `linear-gradient(180deg, ${color}, ${alpha(color, 0.4)})`,
				},
			}}
		>
			<Box sx={{ pl: 2.5, pr: 2, pt: 2, pb: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
				<Stack spacing={0.75}>
					<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
						{label}
					</Typography>
					<Typography variant="h4" fontWeight={800} lineHeight={1.15} color="text.primary">
						<StatCardValue value={value} />
					</Typography>
				</Stack>
				<Box sx={{ width: 44, height: 44, bgcolor: light, color, borderRadius: 1, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 1px ${alpha(color, 0.15)}` }}>
					{icon}
				</Box>
			</Box>
		</Box>
	);
}

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

export default function SignUpReport() {
	const theme = useTheme();
	const [loading, setLoading] = useState(true);
	const [trackUser, setTrackUser] = useState<Row[]>([]);

	useEffect(() => {
		(async () => {
			try {
				const response = await fetch('/api/routes/last-seven-days-sign-up', { cache: 'no-store', method: 'POST' });
				const apidata = await response.json();
				setTrackUser(apidata);
			} catch { /* ignore */ } finally {
				setLoading(false);
			}
		})();
	}, []);

	const week = trackUser.slice(0, 7);
	const today = week[0];
	const todayYmd = moment().format('YYYY-MM-DD');

	const weeklyTotals = PLATFORMS.map(p => ({
		...p,
		total: week.reduce((s, r) => s + (Number(r[p.key]) || 0), 0),
	}));

	return (
		<PageContainer title="Sign Up Report" items={[{ label: 'Sign Up Report', href: '/dashboard/sign-up-report' }]}>
			{loading ? (
				<Loader />
			) : (
				<Stack spacing={3}>

					{/* ── Summary cards ── */}
					<Stack spacing={1.5}>
						<SectionLabel icon={<IconTrendingUp size={15} stroke={2} />} label="Today's sign-ups" />
						<Box sx={{ overflow: 'hidden' }}><Grid container spacing={2}>
							{PLATFORMS.map((p, i) => (
								<Grid item xs={12} sm={6} md={4} key={p.key}>
									<SummaryCard
										label={`${p.alt} today`}
										value={Number(today?.[p.key]) || 0}
										icon={<IconUsers size={20} stroke={1.75} />}
										color={p.color}
										delay={i * 0.07}
									/>
								</Grid>
							))}
						</Grid></Box>
					</Stack>

					{/* ── Weekly totals ── */}
					<Stack spacing={1.5}>
						<SectionLabel icon={<IconUserCheck size={15} stroke={2} />} label="This week's totals" />
						<Box sx={{ overflow: 'hidden' }}><Grid container spacing={2}>
							{weeklyTotals.map((p, i) => (
								<Grid item xs={12} sm={6} md={4} key={p.key}>
									<SummaryCard
										label={`${p.alt} 7-day total`}
										value={p.total}
										icon={<IconHeadphones size={20} stroke={1.75} />}
										color={p.color}
										delay={i * 0.07}
									/>
								</Grid>
							))}
						</Grid></Box>
					</Stack>

					{/* ── Area chart ── */}
					<MainCard title="Sign-up trend" subtitle="Last 7 days by platform">
						<MuiAreaChart
							h={280}
							withLegend
							data={week.map(v => ({ ...v, date: moment(v.date).format('Do MMM') }))}
							dataKey="date"
							series={[
								{ name: 'kabbikCount', color: 'primary', label: 'Kabbik' },
								{ name: 'myBLCount', color: 'success', label: 'Banglalink' },
								{ name: 'toffeeCount', color: 'error', label: 'Toffee' },
							]}
							curveType="monotone"
						/>
					</MainCard>

					{/* ── Daily breakdown table ── */}
					<MainCard title="Daily breakdown" subtitle="Sign-ups per platform per day">
						{week.length > 0 ? (
							<TableContainer sx={{ overflowX: 'auto' }}>
								<Table size="small" sx={{ minWidth: 500 }}>
									<TableHead>
										<TableRow>
											<TableCell
												sx={{
													position: 'sticky',
													left: 0,
													bgcolor: 'background.paper',
													zIndex: 2,
													fontWeight: 700,
													borderBottom: `2px solid ${theme.palette.divider}`,
													minWidth: 140,
												}}
											>
												Platform
											</TableCell>
											{week.map(el => {
												const isToday = moment(el.date).format('YYYY-MM-DD') === todayYmd;
												return (
													<TableCell
														key={el.date}
														align="center"
														sx={{
															fontWeight: isToday ? 700 : 600,
															borderBottom: `2px solid ${isToday ? theme.palette.primary.main : theme.palette.divider}`,
															minWidth: 110,
														}}
													>
														<Stack spacing={0.25} alignItems="center">
															{isToday && (
																<Chip label="Today" size="small" color="primary" sx={{ height: 16, fontSize: '0.65rem', fontWeight: 700 }} />
															)}
															<Typography variant="caption" color={isToday ? 'primary.main' : 'text.secondary'} fontWeight={isToday ? 700 : 600}>
																{moment(el.date).format('Do MMM')}
															</Typography>
														</Stack>
													</TableCell>
												);
											})}
										</TableRow>
									</TableHead>
									<TableBody>
										{PLATFORMS.map(row => (
											<TableRow
												key={row.key}
												hover
												sx={{ '&:hover': { bgcolor: alpha(row.color, 0.04) } }}
											>
												<TableCell
													sx={{
														position: 'sticky',
														left: 0,
														bgcolor: 'background.paper',
														zIndex: 1,
														borderRight: `1px solid ${theme.palette.divider}`,
													}}
												>
													<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
														<Avatar
															src={row.logo}
															alt={row.alt}
															variant="rounded"
															sx={{ width: 32, height: 32, bgcolor: alpha(row.color, 0.08) }}
														/>
														<Box>
															<Typography variant="body2" fontWeight={700} lineHeight={1.2}>
																{row.alt}
															</Typography>
															<Box sx={{ width: 28, height: 3, borderRadius: 1, bgcolor: row.color, mt: 0.5 }} />
														</Box>
													</Box>
												</TableCell>
												{week.map((el, index) => {
													const isToday = moment(el.date).format('YYYY-MM-DD') === todayYmd;
													const current = Number(el[row.key]) || 0;
													const previous = index < week.length - 1 ? Number(week[index + 1]?.[row.key]) || 0 : undefined;
													return (
														<TableCell
															key={el.date}
															align="center"
															sx={{ bgcolor: isToday ? alpha(theme.palette.primary.main, 0.04) : undefined }}
														>
															<TrendValue current={current} previous={previous} showTrend={index < week.length - 1} />
														</TableCell>
													);
												})}
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						) : (
							<Box sx={{ py: 8, textAlign: 'center' }}>
								<IconMoodEmpty size={36} stroke={1.5} style={{ color: theme.palette.text.disabled }} />
								<Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>No data available</Typography>
							</Box>
						)}
					</MainCard>

				</Stack>
			)}
		</PageContainer>
	);
}
