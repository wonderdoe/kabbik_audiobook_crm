'use client';

import {
	Alert,
	Box,
	Button,
	Chip,
	Grid,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
	alpha,
	useTheme,
} from '@mui/material';
import {
	IconBook,
	IconHeadphones,
	IconRepeat,
	IconTrendingUp,
	IconUserCheck,
	IconUsers,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import { StatCardValue } from '@/components/ui/StatCardValue';
import { getUserReportFormat, sumUserReportMappedRows } from '@/helper/Commonfunction';
import { cardShadow } from '@/styles/cardShadow';
import { PlayCountGrid } from './components/PlayCountGrid';
import { SubscriberCard } from './components/SubscriberCard';
import {
	UserReportNotCachedError,
	USER_REPORT_NOT_CACHED_MESSAGE,
	fetchUserReportSnapshot,
} from './fetchSnapshot';

const SESSION_SNAPSHOT_KEY = 'user-report-snapshot-v1';
const SESSION_SNAPSHOT_MAX_AGE_MS = 15 * 60 * 1000;

function readSessionSnapshot(): Record<string, unknown> | null {
	try {
		const raw = sessionStorage.getItem(SESSION_SNAPSHOT_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as { savedAt: number; data: Record<string, unknown> };
		if (Date.now() - parsed.savedAt > SESSION_SNAPSHOT_MAX_AGE_MS) return null;
		return parsed.data;
	} catch {
		return null;
	}
}

function applySnapshotToState(
	data: Record<string, unknown>,
	setters: {
		setUserCountData: (v: any) => void;
		setBlSubsData: (v: any) => void;
		setSubsData: (v: any) => void;
		setPlayCount: (v: any) => void;
		setRentData: (v: any) => void;
		setActiveRentCount: (v: any) => void;
		setUniqueTotalRentUserCount: (v: any) => void;
		setActiveRentUserCount: (v: any) => void;
		setSubscriberSnapshotTotals: (v: { lifetime: number; active: number; bl: number }) => void;
	},
) {
	const userCount = data.userCount as { result?: unknown };
	const blSubscriber = data.blSubscriber as { result?: unknown };
	const subscribedUser = data.subscribedUser as { result?: unknown };
	setters.setSubscriberSnapshotTotals({
		lifetime: sumUserReportMappedRows(userCount?.result),
		active: sumUserReportMappedRows(subscribedUser?.result),
		bl: sumUserReportMappedRows(blSubscriber?.result),
	});
	setters.setUserCountData(getUserReportFormat(userCount?.result));
	setters.setBlSubsData(getUserReportFormat(blSubscriber?.result));
	setters.setSubsData(getUserReportFormat(subscribedUser?.result));
	setters.setPlayCount((data.playCount as unknown[]) ?? []);
	setters.setRentData((data.rentTotal as unknown[]) ?? []);
	setters.setActiveRentCount((data.rentActive as unknown[]) ?? []);
	setters.setUniqueTotalRentUserCount((data.rentUniqueTotal as unknown[]) ?? []);
	setters.setActiveRentUserCount((data.rentActiveUnique as unknown[]) ?? []);
}

function SummaryStatCard({
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
	return (
		<Box
			component={motion.div}
			initial={{ opacity: 0, y: 14 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.28, delay, ease: 'easeOut' }}
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
					left: 0, top: 0, bottom: 0,
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
				<Box sx={{ width: 44, height: 44, bgcolor: alpha(color, 0.1), color, borderRadius: 1, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 1px ${alpha(color, 0.15)}` }}>
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

/** Horizontal scrollable platform card row */
function PlatformRow({
	items,
	showBreakdown = true,
	color,
}: {
	items: any[];
	showBreakdown?: boolean;
	color?: string;
}) {
	const theme = useTheme();
	const resolved = color ?? theme.palette.primary.main;
	const max = items.length
		? Math.max(...items.map(i => {
			const r = Number(i.recurring ?? 0);
			const o = Number(i.is_onetime ?? 0);
			return i.count !== undefined ? Number(i.count) : r + o;
		}))
		: 1;

	if (!items.length) {
		return (
			<Typography variant="body2" color="text.disabled" sx={{ py: 2 }}>
				No data
			</Typography>
		);
	}

	return (
		<Box
			sx={{
				display: 'flex',
				gap: 1.5,
				overflowX: 'auto',
				pb: 0.5,
				/* hide scrollbar on desktop, keep functional */
				'&::-webkit-scrollbar': { height: 4 },
				'&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
				'&::-webkit-scrollbar-thumb': { bgcolor: alpha(resolved, 0.2), borderRadius: 2 },
			}}
		>
			{items.map((item: any) => (
				<SubscriberCard
					key={item.title}
					item={item}
					showBreakdown={showBreakdown}
					color={resolved}
					max={max}
				/>
			))}
		</Box>
	);
}

export default function UserReport() {
	const theme = useTheme();
	const [userCountData, setUserCountData] = useState<any>([]);
	const [subsData, setSubsData] = useState<any>([]);
	const [playCount, setPlayCount] = useState([]);
	const [loading, setLoading] = useState(true);
	const [blSubsData, setBlSubsData] = useState<any>([]);
	const [rentData, setRentData] = useState<any>([]);
	const [activeRentCount, setActiveRentCount] = useState<any>([]);
	const [uniqueTotalRentUserCount, setUniqueTotalRentUserCount] = useState<any>([]);
	const [activeRentUserCount, setActiveRentUserCount] = useState<any>([]);
	const [showTotalRentUniqUserCount, setShowTotalRentUniqUserCount] = useState(false);
	const [showActiveRentUniqUserCount, setShowActiveRentUniqUserCount] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [reloadNonce, setReloadNonce] = useState(0);
	const [subscriberSnapshotTotals, setSubscriberSnapshotTotals] = useState({
		lifetime: 0,
		active: 0,
		bl: 0,
	});

	useEffect(() => {
		let cancelled = false;
		setLoadError(null);
		const setters = {
			setUserCountData,
			setBlSubsData,
			setSubsData,
			setPlayCount,
			setRentData,
			setActiveRentCount,
			setUniqueTotalRentUserCount,
			setActiveRentUserCount,
			setSubscriberSnapshotTotals,
		};

		const cached = readSessionSnapshot();
		const hadCached = Boolean(cached);
		if (cached) {
			applySnapshotToState(cached, setters);
			setLoading(false);
		} else {
			setLoading(true);
		}

		(async () => {
			try {
				const data = await fetchUserReportSnapshot();
				if (cancelled) return;
				applySnapshotToState(data, setters);
				setLoadError(null);
				try {
					sessionStorage.setItem(SESSION_SNAPSHOT_KEY, JSON.stringify({ savedAt: Date.now(), data }));
				} catch { /* ignore quota */ }
			} catch (error) {
				console.error('Error fetching user report snapshot:', error);
				if (!cancelled && !hadCached) {
					setLoadError(error instanceof UserReportNotCachedError ? error.message : USER_REPORT_NOT_CACHED_MESSAGE);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => { cancelled = true; };
	}, [reloadNonce]);

	const sumRent = (list: any[]) => list?.reduce((a: number, c: any) => a + Number(c.count), 0) ?? 0;

	const hasData =
		userCountData.length > 0 || subsData.length > 0 || blSubsData.length > 0 || (playCount?.length ?? 0) > 0;

	if (loading && !hasData) return <Loader />;

	if (loadError && !hasData) {
		return (
			<PageContainer title="User Report" items={[{ label: 'User Report', href: '/dashboard/user-report' }]}>
				<Alert severity="info" sx={{ mb: 2 }}>{loadError}</Alert>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					This report is refreshed once per day at <strong>3:30 AM Bangladesh time</strong>. After that time,
					reload this page or tap Check again. If it is still empty, contact your administrator.
				</Typography>
				<Button variant="outlined" onClick={() => setReloadNonce(n => n + 1)}>Check again</Button>
			</PageContainer>
		);
	}

	const totalRentItems = showTotalRentUniqUserCount ? uniqueTotalRentUserCount : rentData;
	const activeRentItems = showActiveRentUniqUserCount ? activeRentUserCount : activeRentCount;

	const snapshotCards = [
		{ label: 'Lifetime Subscribers', value: subscriberSnapshotTotals.lifetime, icon: <IconUsers size={20} stroke={1.75} />, color: theme.palette.primary.main },
		{ label: 'Active Subscribers', value: subscriberSnapshotTotals.active, icon: <IconUserCheck size={20} stroke={1.75} />, color: theme.palette.success.main },
		{ label: 'BL Subscribers', value: subscriberSnapshotTotals.bl, icon: <IconRepeat size={20} stroke={1.75} />, color: '#2e7d32' },
		{ label: 'Total Rent', value: sumRent(rentData), icon: <IconBook size={20} stroke={1.75} />, color: theme.palette.warning.main },
		{ label: 'Active Rent', value: sumRent(activeRentCount), icon: <IconTrendingUp size={20} stroke={1.75} />, color: theme.palette.error.main },
	];

	return (
		<PageContainer title="User Report" items={[{ label: 'User Report', href: '/dashboard/user-report' }]}>
			<Stack spacing={3}>

				{/* ── Snapshot ── */}
				<Stack spacing={1.5}>
					<SectionLabel icon={<IconTrendingUp size={15} stroke={2} />} label="Snapshot" />
					<Box sx={{ overflow: 'hidden' }}>
						<Grid container spacing={2}>
							{snapshotCards.map((s, i) => (
								<Grid item xs={12} sm={6} md={4} lg key={s.label}>
									<SummaryStatCard label={s.label} value={s.value} icon={s.icon} color={s.color} delay={i * 0.06} />
								</Grid>
							))}
						</Grid>
					</Box>
				</Stack>

				{/* ── Lifetime subscribers ── */}
				<MainCard
					title="Lifetime Subscribers"
					secondary={
						<Chip
							label={<StatCardValue value={subscriberSnapshotTotals.lifetime} />}
							color="primary"
							size="small"
							sx={{ fontWeight: 700 }}
						/>
					}
				>
					<PlatformRow items={userCountData} showBreakdown color={theme.palette.primary.main} />
				</MainCard>

				{/* ── Active subscribers ── */}
				<MainCard
					title="Active Subscribed Users"
					secondary={
						<Chip
							label={<StatCardValue value={subscriberSnapshotTotals.active} />}
							color="success"
							size="small"
							sx={{ fontWeight: 700 }}
						/>
					}
				>
					<PlatformRow items={subsData} showBreakdown color={theme.palette.success.main} />
				</MainCard>

				{/* ── Total rent ── */}
				<MainCard
					title="Total Rent Count"
					secondary={
						<Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
							<Chip
								label={<StatCardValue value={sumRent(totalRentItems)} />}
								color="warning"
								size="small"
								sx={{ fontWeight: 700 }}
							/>
							<ToggleButtonGroup
								size="small"
								exclusive
								value={showTotalRentUniqUserCount ? 'unique' : 'total'}
								onChange={(_, v) => { if (v) setShowTotalRentUniqUserCount(v === 'unique'); }}
								sx={{ '& .MuiToggleButton-root': { py: 0.25, px: 1, fontSize: '0.75rem' } }}
							>
								<ToggleButton value="total">Total</ToggleButton>
								<ToggleButton value="unique">Unique</ToggleButton>
							</ToggleButtonGroup>
						</Box>
					}
				>
					<PlatformRow items={totalRentItems} showBreakdown={false} color={theme.palette.warning.main} />
				</MainCard>

				{/* ── Active rent ── */}
				<MainCard
					title="Active Rent Count"
					secondary={
						<Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
							<Chip
								label={<StatCardValue value={sumRent(activeRentItems)} />}
								color="error"
								size="small"
								sx={{ fontWeight: 700 }}
							/>
							<ToggleButtonGroup
								size="small"
								exclusive
								value={showActiveRentUniqUserCount ? 'unique' : 'total'}
								onChange={(_, v) => { if (v) setShowActiveRentUniqUserCount(v === 'unique'); }}
								sx={{ '& .MuiToggleButton-root': { py: 0.25, px: 1, fontSize: '0.75rem' } }}
							>
								<ToggleButton value="total">Total</ToggleButton>
								<ToggleButton value="unique">Unique</ToggleButton>
							</ToggleButtonGroup>
						</Box>
					}
				>
					<PlatformRow items={activeRentItems} showBreakdown={false} color={theme.palette.error.main} />
				</MainCard>

				{/* ── BL subscribers ── */}
				<MainCard
					title="Active Subscribers from Banglalink"
					secondary={
						<Chip
							label={<StatCardValue value={subscriberSnapshotTotals.bl} />}
							color="success"
							size="small"
							variant="outlined"
							sx={{ fontWeight: 700 }}
						/>
					}
				>
					<PlatformRow items={blSubsData} showBreakdown color="#2e7d32" />
				</MainCard>

				{/* ── Play count ── */}
				<MainCard
					title="Total Play Count"
					secondary={
						<Chip
							label={<>
								<IconHeadphones size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
								{playCount.length} platforms
							</>}
							size="small"
							variant="outlined"
							sx={{ fontWeight: 600 }}
						/>
					}
				>
					<PlayCountGrid list={playCount} />
				</MainCard>

			</Stack>
		</PageContainer>
	);
}
