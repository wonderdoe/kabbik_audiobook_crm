'use client';

import {
	Avatar,
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	IconButton,
	LinearProgress,
	Stack,
	Tooltip,
	Typography,
	alpha,
	useTheme,
} from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	IconCash,
	IconMoodEmpty,
	IconRefresh,
	IconSearch,
	IconTrendingUp,
	IconX,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CustomDatePicker } from '@/components/Form/CustomDatePicker';
import { MuiAreaChart } from '@/components/Charts/MuiAreaChart';
import { GatewayBreakdownGrid } from '@/components/revenue/GatewayBreakdownGrid';
import { getBreakdown } from '@/components/revenue/subscription-gateway-breakdown';
import Loader from '@/components/Loader';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import { StatCardValue } from '@/components/ui/StatCardValue';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useIsMobileSm } from '@/hooks/use-is-mobile-sm';
import { checkgetPermission } from '@/helper/Commonfunction';
import { cardShadow } from '@/styles/cardShadow';
import { formatCompactCurrency, isCompactNotation } from '@/utils/formatCompactNumber';

type DayEntry = [string, Record<string, number>];

function sortDayEntriesAsc(list: DayEntry[]): DayEntry[] {
	return [...list].sort(([a], [b]) => {
		const ta = moment(a, ['YYYY-MM-DD', moment.ISO_8601], true).valueOf();
		const tb = moment(b, ['YYYY-MM-DD', moment.ISO_8601], true).valueOf();
		return Number.isFinite(ta) && Number.isFinite(tb) ? ta - tb : String(a).localeCompare(String(b));
	});
}

function dayTotal(dayMap: Record<string, number>): number {
	return Object.values(dayMap).reduce((s, v) => s + Number(v || 0), 0);
}

/* ── UI helpers ── */
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

const SOURCE_CONFIG = [
	{ key: 'kabbik', label: 'Kabbik', color: 'primary' as const, accentColor: '#d4117e', img: 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780521478.png' },
	{ key: 'mybl', label: 'MyBL', color: 'success' as const, accentColor: '#2e7d32', img: 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780481387.png' },
	{ key: 'course', label: 'Course', color: 'warning' as const, accentColor: '#f59e0b', img: 'https://kabbik-space.sgp1.digitaloceanspaces.com/course.png' },
] as const;

/* ── Summary stat card ── */
function SourceStatCard({
	config,
	list,
	delay = 0,
}: {
	config: typeof SOURCE_CONFIG[number];
	list: DayEntry[];
	delay?: number;
}) {
	const theme = useTheme();
	const color = config.accentColor;
	const total = list.reduce((a, [, m]) => a + dayTotal(m), 0);
	const days = list.length;
	const avgPerDay = days > 0 ? Math.round(total / days) : 0;

	return (
		<Box
			component={motion.div}
			initial={{ opacity: 0, y: 14 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.28, delay, ease: 'easeOut' }}
			whileHover={{ y: -2, boxShadow: `0 6px 16px ${alpha(color, 0.14)}` }}
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
					left: 0, top: 0, bottom: 0,
					width: 4,
					background: `linear-gradient(180deg, ${color}, ${alpha(color, 0.4)})`,
				},
			}}
		>
			<Box sx={{ pl: 2.5, pr: 2, pt: 2, pb: 2 }}>
				<Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
					<Stack spacing={0.75}>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
							{config.label} Revenue
						</Typography>
						<Typography variant="h4" fontWeight={800} lineHeight={1.15} color="text.primary">
							<StatCardValue value={total} />
							<Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>Tk</Typography>
						</Typography>
					</Stack>
					<Avatar
						src={config.img}
						alt={config.label}
						variant="rounded"
						sx={{ width: 44, height: 44, bgcolor: alpha(color, 0.08), '& img': { objectFit: 'contain' }, boxShadow: `0 0 0 1px ${alpha(color, 0.18)}` }}
					/>
				</Box>
				<Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
					<Chip label={`${days} days`} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 20, '& .MuiChip-label': { px: 0.75 } }} />
					{avgPerDay > 0 && (
						<Chip
							label={`~${avgPerDay.toLocaleString()} Tk/day avg`}
							size="small"
							sx={{ fontSize: '0.7rem', height: 20, bgcolor: alpha(color, 0.1), color, border: `1px solid ${alpha(color, 0.22)}`, '& .MuiChip-label': { px: 0.75 } }}
						/>
					)}
				</Box>
			</Box>
		</Box>
	);
}

/* ── Day pill ── */
function DayPill({
	date, total, maxTotal, isLatest, onClick,
}: {
	date: string; total: number; maxTotal: number; isLatest: boolean; onClick: () => void;
}) {
	const theme = useTheme();
	const main = isLatest ? theme.palette.primary.main : theme.palette.success.main;
	const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;

	return (
		<Box
			component={motion.button}
			type="button"
			whileHover={{ y: -2, boxShadow: `0 6px 14px ${alpha(main, 0.18)}` }}
			whileTap={{ scale: 0.98 }}
			onClick={onClick}
			sx={{
				flex: '0 0 auto',
				minWidth: 88,
				px: 1.5, py: 1.25,
				borderRadius: 1,
				border: `1px solid ${alpha(main, isLatest ? 0.35 : 0.22)}`,
				bgcolor: 'background.paper',
				cursor: 'pointer',
				textAlign: 'left',
				boxShadow: cardShadow.rest,
				position: 'relative',
				overflow: 'hidden',
				transition: 'border-color 0.2s',
				'&::before': {
					content: '""',
					position: 'absolute',
					left: 0, top: 0, bottom: 0,
					width: 3,
					background: `linear-gradient(180deg, ${main}, ${alpha(main, 0.45)})`,
				},
			}}
		>
			<Stack spacing={0.75} sx={{ pl: 0.5 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
					{isLatest && (
						<Chip label="Latest" size="small" color="primary" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700, '& .MuiChip-label': { px: 0.5 } }} />
					)}
					<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, lineHeight: 1.2 }}>
						{moment(date, ['YYYY-MM-DD', moment.ISO_8601], true).isValid() ? moment(date).format('D MMM') : date}
					</Typography>
				</Box>
				{isCompactNotation(total) ? (
					<Tooltip title={`${total.toLocaleString()} Tk`} arrow>
						<Typography variant="subtitle2" fontWeight={800} sx={{ color: main }} component="span">
							{formatCompactCurrency(total, '')}
						</Typography>
					</Tooltip>
				) : (
					<Typography variant="subtitle2" fontWeight={800} sx={{ color: main }}>{total.toLocaleString()}</Typography>
				)}
				<LinearProgress
					variant="determinate"
					value={pct}
					sx={{
						height: 3, borderRadius: 2,
						bgcolor: alpha(main, 0.12),
						'& .MuiLinearProgress-bar': { bgcolor: main, borderRadius: 2 },
					}}
				/>
			</Stack>
		</Box>
	);
}

/* ── Revenue section ── */
function RevenueSection({
	title, imageUrl, list, onDayClick, modalOpened, closeModal, modalTitle, nestedList, accentColor,
}: {
	title: string; imageUrl: string; list: DayEntry[];
	onDayClick: (d: Record<string, number>) => void;
	modalOpened: boolean; closeModal: () => void; modalTitle: string;
	nestedList: [string, number][]; accentColor: string;
}) {
	const theme = useTheme();
	const isMobileSm = useIsMobileSm();
	const sorted = useMemo(() => sortDayEntriesAsc(list), [list]);
	const grandTotal = sorted.reduce((acc, [, m]) => acc + dayTotal(m), 0);
	const maxDay = sorted.reduce((m, [, dm]) => Math.max(m, dayTotal(dm)), 0);
	const latestDate = sorted.length ? sorted[sorted.length - 1][0] : null;
	const breakdown = getBreakdown(nestedList);

	return (
		<>
			<MainCard
				title={
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<Avatar src={imageUrl} alt={title} variant="rounded" sx={{ width: 32, height: 32, bgcolor: 'grey.100', '& img': { objectFit: 'contain' } }} />
						<Box>
							<Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>{title}</Typography>
							<Typography variant="caption" color="text.secondary">
								{sorted.length} day{sorted.length !== 1 ? 's' : ''} · oldest → newest · click for breakdown
							</Typography>
						</Box>
					</Box>
				}
				secondary={
					<Chip
						label={isCompactNotation(grandTotal) ? formatCompactCurrency(grandTotal, ' Tk') : `${grandTotal.toLocaleString()} Tk`}
						size="small"
						color="success"
						sx={{ fontWeight: 700 }}
					/>
				}
			>
				{sorted.length ? (
					<Box
						sx={{
							display: 'flex', gap: 1.25, overflowX: 'auto', pb: 0.5,
							'&::-webkit-scrollbar': { height: 4 },
							'&::-webkit-scrollbar-thumb': { bgcolor: alpha(accentColor, 0.25), borderRadius: 2 },
						}}
					>
						{sorted.map(([date, dayMap]) => (
							<DayPill
								key={date}
								date={date}
								total={dayTotal(dayMap)}
								maxTotal={maxDay}
								isLatest={date === latestDate}
								onClick={() => onDayClick(dayMap)}
							/>
						))}
					</Box>
				) : (
					<Box sx={{ py: 4, textAlign: 'center' }}>
						<IconMoodEmpty size={32} stroke={1.5} style={{ color: theme.palette.text.disabled, marginBottom: 6 }} />
						<Typography variant="body2" color="text.disabled">No payments in this range</Typography>
					</Box>
				)}
			</MainCard>

			<Dialog open={modalOpened} onClose={closeModal} maxWidth="md" fullWidth fullScreen={isMobileSm}
				PaperProps={{ sx: { borderRadius: { xs: 0, sm: 2 } } }}>
				<DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<Avatar src={imageUrl} alt={title} variant="rounded" sx={{ width: 30, height: 30, bgcolor: 'grey.100', '& img': { objectFit: 'contain' } }} />
						<Typography variant="h6" fontWeight={700}>{modalTitle}</Typography>
					</Box>
					<IconButton size="small" onClick={closeModal} sx={{ color: 'text.secondary' }}><IconX size={18} /></IconButton>
				</DialogTitle>
				<Divider />
				<DialogContent sx={{ pt: 2.5 }}>
					<GatewayBreakdownGrid rows={breakdown} />
				</DialogContent>
			</Dialog>
		</>
	);
}

/* ── Page ── */
const formSchema = z.object({
	startDate: z.date({ required_error: 'Required' }),
	endDate: z.date({ required_error: 'Required' }),
});
type FormData = z.infer<typeof formSchema>;

export default function Revenue() {
	const theme = useTheme();
	const [data, setData] = useState<{ kabbik: DayEntry[]; mybl: DayEntry[]; course: DayEntry[] }>({ kabbik: [], mybl: [], course: [] });
	const [individual, setIndividual] = useState<[string, number][]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [updatedAt, setUpdatedAt] = useState<string | null>(null);
	const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
	const [detailsOpenedMyBl, { open: openDetailsMyBl, close: closeDetailsMyBl }] = useDisclosure(false);
	const [detailsOpenedCourse, { open: openDetailsCourse, close: closeDetailsCourse }] = useDisclosure(false);
	const [date, setDate] = useState({
		startDate: moment().subtract(6, 'days').format('YYYY-MM-DD'),
		endDate: moment().format('YYYY-MM-DD'),
	});

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			startDate: new Date(moment().subtract(6, 'days').format('YYYY-MM-DD')),
			endDate: new Date(),
		},
	});

	const getData = useCallback(async (refresh = false) => {
		try {
			setIsLoading(true);
			const r = refresh ? '&refresh=1' : '';
			const res = await fetch(`/api/routes/revenue?startDate=${date.startDate}&endDate=${date.endDate}${r}`, { cache: 'no-store' });
			if (!res.ok) throw new Error('Failed');
			const d = await res.json();
			setUpdatedAt(d.updatedAt ?? null);
			setData({
				kabbik: sortDayEntriesAsc(Object.entries(d.kabbik ?? {}) as DayEntry[]),
				mybl: sortDayEntriesAsc(Object.entries(d.mybl ?? {}) as DayEntry[]),
				course: sortDayEntriesAsc(Object.entries(d.course ?? {}) as DayEntry[]),
			});
		} catch (e) { console.error(e); }
		finally { setIsLoading(false); }
	}, [date]);

	const handleRefresh = async () => {
		if (!checkgetPermission('see_subscription_revenue_report')) return;
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

	const openModal = (fn: () => void, raw: Record<string, number>) => {
		fn();
		setIndividual(Object.entries(raw) as [string, number][]);
	};

	const updatedLabel = updatedAt ? `Updated ${moment(updatedAt).fromNow()}` : null;
	const rangeLabel = `${date.startDate} → ${date.endDate}`;

	// Merged chart data: one row per date across all sources
	const chartData = useMemo(() => {
		const dateSet = new Set<string>();
		data.kabbik.forEach(([d]) => dateSet.add(d));
		data.mybl.forEach(([d]) => dateSet.add(d));
		data.course.forEach(([d]) => dateSet.add(d));
		const allDates = [...dateSet].sort((a, b) =>
			moment(a, ['YYYY-MM-DD', moment.ISO_8601], true).valueOf() -
			moment(b, ['YYYY-MM-DD', moment.ISO_8601], true).valueOf()
		);
		const kabbikMap = Object.fromEntries(data.kabbik.map(([d, m]) => [d, dayTotal(m)]));
		const myblMap = Object.fromEntries(data.mybl.map(([d, m]) => [d, dayTotal(m)]));
		const courseMap = Object.fromEntries(data.course.map(([d, m]) => [d, dayTotal(m)]));
		return allDates.map(d => ({
			date: moment(d, ['YYYY-MM-DD', moment.ISO_8601], true).isValid()
				? moment(d).format('D MMM')
				: d,
			Kabbik: kabbikMap[d] ?? 0,
			MyBL: myblMap[d] ?? 0,
			Course: courseMap[d] ?? 0,
		}));
	}, [data]);

	const combinedTotal = useMemo(() => {
		return data.kabbik.reduce((a, [, m]) => a + dayTotal(m), 0)
			+ data.mybl.reduce((a, [, m]) => a + dayTotal(m), 0)
			+ data.course.reduce((a, [, m]) => a + dayTotal(m), 0);
	}, [data]);

	const hasAnyData = data.kabbik.length > 0 || data.mybl.length > 0 || data.course.length > 0;

	return (
		<PageContainer
			title="Subscription Revenue Report"
			items={[{ label: 'Revenue', href: '/dashboard/revenue' }]}
			subtitle={updatedLabel ? (
				<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
					{updatedLabel} · {rangeLabel}
				</Typography>
			) : undefined}
			actions={
				checkgetPermission('see_subscription_revenue_report') ? (
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

				{isLoading ? <Loader /> : !hasAnyData ? (
					<Box sx={{ py: 8, textAlign: 'center' }}>
						<IconMoodEmpty size={40} stroke={1.5} style={{ color: theme.palette.text.disabled, marginBottom: 8 }} />
						<Typography variant="body2" color="text.disabled">No data for the selected range</Typography>
					</Box>
				) : (
					<Stack spacing={3}>

						{/* ── Summary stat cards ── */}
						<Stack spacing={1.5}>
							<SectionLabel icon={<IconTrendingUp size={15} stroke={2} />} label={`Summary · ${rangeLabel}`} />
							<Box sx={{ overflow: 'hidden' }}>
								<Grid container spacing={2}>
									<Grid item xs={12} sm={4}>
										<Box
											sx={{
												pl: 2.5, pr: 2, py: 2,
												borderRadius: 1,
												border: `1px solid ${theme.palette.divider}`,
												bgcolor: 'background.paper',
												boxShadow: cardShadow.rest,
												position: 'relative',
												overflow: 'hidden',
												height: '100%',
												'&::before': {
													content: '""', position: 'absolute',
													left: 0, top: 0, bottom: 0, width: 4,
													background: `linear-gradient(180deg, ${theme.palette.success.main}, ${alpha(theme.palette.success.main, 0.4)})`,
												},
											}}
										>
											<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
												Combined total
											</Typography>
											<Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
												<StatCardValue value={combinedTotal} />
												<Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>Tk</Typography>
											</Typography>
										</Box>
									</Grid>
									{SOURCE_CONFIG.map((cfg, i) => (
										<Grid item xs={12} sm={4} key={cfg.key}>
											<SourceStatCard config={cfg} list={data[cfg.key]} delay={i * 0.07} />
										</Grid>
									))}
								</Grid>
							</Box>
						</Stack>

						{/* ── Trend chart ── */}
						{chartData.length > 1 && (
							<MainCard
								title="Revenue trend"
								subtitle={`${rangeLabel} · all sources combined`}
								secondary={
									<Chip
										label={`${chartData.length} days`}
										size="small"
										variant="outlined"
										sx={{ fontWeight: 600 }}
									/>
								}
							>
								<MuiAreaChart
									h={280}
									data={chartData}
									dataKey="date"
									series={[
										{ name: 'Kabbik', color: 'primary', label: 'Kabbik' },
										{ name: 'MyBL', color: 'success', label: 'MyBL' },
										{ name: 'Course', color: 'warning', label: 'Course' },
									]}
									withLegend
									curveType="monotone"
									valueFormatter={(v) => `${Number(v).toLocaleString()} Tk`}
								/>
							</MainCard>
						)}

						{/* ── Per-source day pills ── */}
						<Stack spacing={1.5}>
							<SectionLabel icon={<IconCash size={15} stroke={2} />} label="Revenue sources · click a day for gateway breakdown" />
							<Stack spacing={2}>
								<RevenueSection
									title="Kabbik Revenue"
									imageUrl="https://kabbik-space.sgp1.digitaloceanspaces.com/1713780521478.png"
									list={data.kabbik}
									onDayClick={d => openModal(openDetails, d)}
									modalOpened={detailsOpened}
									closeModal={closeDetails}
									modalTitle="Kabbik Payment Breakdown"
									nestedList={individual}
									accentColor={theme.palette.primary.main}
								/>
								<RevenueSection
									title="MyBL Revenue"
									imageUrl="https://kabbik-space.sgp1.digitaloceanspaces.com/1713780481387.png"
									list={data.mybl}
									onDayClick={d => openModal(openDetailsMyBl, d)}
									modalOpened={detailsOpenedMyBl}
									closeModal={closeDetailsMyBl}
									modalTitle="MyBL Payment Breakdown"
									nestedList={individual}
									accentColor="#2e7d32"
								/>
								<RevenueSection
									title="Course Revenue"
									imageUrl="https://kabbik-space.sgp1.digitaloceanspaces.com/course.png"
									list={data.course}
									onDayClick={d => openModal(openDetailsCourse, d)}
									modalOpened={detailsOpenedCourse}
									closeModal={closeDetailsCourse}
									modalTitle="Course Payment Breakdown"
									nestedList={individual}
									accentColor={theme.palette.warning.main}
								/>
							</Stack>
						</Stack>

					</Stack>
				)}
			</Stack>
		</PageContainer>
	);
}
