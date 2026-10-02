'use client';

import { Alert, Box, Button, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import { StatCard } from '@/components/ui/StatCard';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import TreeDiagram from '@/components/Tree/Tree';
import { getUserReportFormat } from '@/helper/Commonfunction';
import styles from './styles.module.css';
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
	},
) {
	const userCount = data.userCount as { result?: unknown };
	const blSubscriber = data.blSubscriber as { result?: unknown };
	const subscribedUser = data.subscribedUser as { result?: unknown };
	setters.setUserCountData(getUserReportFormat(userCount?.result));
	setters.setBlSubsData(getUserReportFormat(blSubscriber?.result));
	setters.setSubsData(getUserReportFormat(subscribedUser?.result));
	setters.setPlayCount((data.playCount as unknown[]) ?? []);
	setters.setRentData((data.rentTotal as unknown[]) ?? []);
	setters.setActiveRentCount((data.rentActive as unknown[]) ?? []);
	setters.setUniqueTotalRentUserCount((data.rentUniqueTotal as unknown[]) ?? []);
	setters.setActiveRentUserCount((data.rentActiveUnique as unknown[]) ?? []);
}

export default function UserReport() {
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
					sessionStorage.setItem(
						SESSION_SNAPSHOT_KEY,
						JSON.stringify({ savedAt: Date.now(), data }),
					);
				} catch {
					/* ignore quota / private mode */
				}
			} catch (error) {
				console.error('Error fetching user report snapshot:', error);
				if (!cancelled && !hadCached) {
					if (error instanceof UserReportNotCachedError) {
						setLoadError(error.message);
					} else {
						setLoadError(USER_REPORT_NOT_CACHED_MESSAGE);
					}
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [reloadNonce]);

	const sumSubs = (list: any[]) =>
		list.reduce((a: number, c: any) => a + Number(c?.recurring) + Number(c?.is_onetime), 0);
	const sumRent = (list: any[]) => list?.reduce((a: number, c: any) => a + Number(c.count), 0) ?? 0;

	const hasData =
		userCountData.length > 0 ||
		subsData.length > 0 ||
		blSubsData.length > 0 ||
		(playCount?.length ?? 0) > 0;

	if (loading && !hasData) return <Loader />;

	if (loadError && !hasData) {
		return (
			<PageContainer title="User Report" items={[{ label: 'User Report', href: '/dashboard/user-report' }]}>
				<Alert severity="info" sx={{ mb: 2 }}>
					{loadError}
				</Alert>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					This report is refreshed once per day at <strong>3:30 AM Bangladesh time</strong>. After that time,
					reload this page or tap Check again. If it is still empty, contact your administrator.
				</Typography>
				<Button variant="outlined" onClick={() => setReloadNonce(n => n + 1)}>
					Check again
				</Button>
			</PageContainer>
		);
	}

	return (
		<PageContainer title="User Report" items={[{ label: 'User Report', href: '/dashboard/user-report' }]}>
			<Stack spacing={3}>
				<MainCard title="Total Lifetime Subscribers">
					<StatCard
						title="Lifetime total"
						color="primary"
						value={sumSubs(userCountData).toLocaleString()}
						subtitle="All platforms combined"
					/>
					<Box sx={{ mt: 2, width: '100%', overflowX: 'auto' }}>
						<TreeDiagram
							headingChildren={
								<div className={styles.totalUsers}>
									<h2>LifeTime Subscribers</h2>
									<p>{sumSubs(userCountData)}</p>
								</div>
							}
							childNodes={userCountData.map((item: any) => (
								<SubscriberCard key={item.title} item={item} />
							))}
						/>
					</Box>
				</MainCard>

				<MainCard title="Active Subscribed Users">
					<StatCard title="Active total" color="success" value={sumSubs(subsData).toLocaleString()} />
					<Box sx={{ mt: 2, width: '100%', overflowX: 'auto' }}>
						<TreeDiagram
							headingChildren={
								<div className={styles.totalUsers}>
									<h2>Subscribed Users</h2>
									<p>{sumSubs(subsData)}</p>
								</div>
							}
							childNodes={subsData.map((item: any) => (
								<SubscriberCard key={item.title} item={item} />
							))}
						/>
					</Box>
				</MainCard>

				<MainCard
					title="Total Rent Count"
					secondary={
						<ToggleButtonGroup
							size="small"
							exclusive
							value={showTotalRentUniqUserCount ? 'unique' : 'total'}
							onChange={(_, v) => {
								if (v) setShowTotalRentUniqUserCount(v === 'unique');
							}}
						>
							<ToggleButton value="total">Total count</ToggleButton>
							<ToggleButton value="unique">Unique users</ToggleButton>
						</ToggleButtonGroup>
					}
				>
					<StatCard
						title="Rent total"
						color="info"
						value={sumRent(showTotalRentUniqUserCount ? uniqueTotalRentUserCount : rentData).toLocaleString()}
					/>
					<Box sx={{ mt: 2, width: '100%', overflowX: 'auto' }}>
						<TreeDiagram
							headingChildren={
								<div className={styles.totalUsers}>
									<h2>Total rent</h2>
									<p>{sumRent(showTotalRentUniqUserCount ? uniqueTotalRentUserCount : rentData)}</p>
								</div>
							}
							childNodes={(showTotalRentUniqUserCount ? uniqueTotalRentUserCount : rentData)?.map(
								(item: any) => <SubscriberCard key={item.title} item={item} showBreakdown={false} />,
							)}
						/>
					</Box>
				</MainCard>

				<MainCard
					title="Active Rent Count"
					secondary={
						<ToggleButtonGroup
							size="small"
							exclusive
							value={showActiveRentUniqUserCount ? 'unique' : 'total'}
							onChange={(_, v) => {
								if (v) setShowActiveRentUniqUserCount(v === 'unique');
							}}
						>
							<ToggleButton value="total">Total count</ToggleButton>
							<ToggleButton value="unique">Unique users</ToggleButton>
						</ToggleButtonGroup>
					}
				>
					<StatCard
						title="Active rent"
						color="warning"
						value={sumRent(showActiveRentUniqUserCount ? activeRentUserCount : activeRentCount).toLocaleString()}
					/>
					<Box sx={{ mt: 2, width: '100%', overflowX: 'auto' }}>
						<TreeDiagram
							headingChildren={
								<div className={styles.totalUsers}>
									<h2>Active rent</h2>
									<p>{sumRent(showActiveRentUniqUserCount ? activeRentUserCount : activeRentCount)}</p>
								</div>
							}
							childNodes={(showActiveRentUniqUserCount ? activeRentUserCount : activeRentCount)?.map(
								(item: any) => <SubscriberCard key={item.title} item={item} showBreakdown={false} />,
							)}
						/>
					</Box>
				</MainCard>

				<MainCard title="Active Subscriber From Banglalink App">
					<StatCard title="Banglalink active" color="secondary" value={sumSubs(blSubsData).toLocaleString()} />
					<Box sx={{ mt: 2, width: '100%', overflowX: 'auto' }}>
						<TreeDiagram
							headingChildren={
								<div className={styles.totalUsers}>
									<h2>Banglalink Subscribed Users</h2>
									<p>{sumSubs(blSubsData)}</p>
								</div>
							}
							childNodes={blSubsData.map((item: any) => (
								<SubscriberCard key={item.title} item={item} />
							))}
						/>
					</Box>
				</MainCard>

				<MainCard title="Total Play Count">
					<PlayCountGrid list={playCount} />
				</MainCard>
			</Stack>
		</PageContainer>
	);
}
