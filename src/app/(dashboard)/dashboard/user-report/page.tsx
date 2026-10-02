'use client';

import { Box, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
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

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const response = await fetch('/api/routes/user-report-snapshot', { cache: 'no-store' });
				if (!response.ok) throw new Error(`user-report-snapshot ${response.status}`);
				const data = await response.json();
				if (cancelled) return;
				setUserCountData(getUserReportFormat(data.userCount?.result));
				setBlSubsData(getUserReportFormat(data.blSubscriber?.result));
				setSubsData(getUserReportFormat(data.subscribedUser?.result));
				setPlayCount(data.playCount ?? []);
				setRentData(data.rentTotal ?? []);
				setActiveRentCount(data.rentActive ?? []);
				setUniqueTotalRentUserCount(data.rentUniqueTotal ?? []);
				setActiveRentUserCount(data.rentActiveUnique ?? []);
			} catch (error) {
				console.error('Error fetching user report snapshot:', error);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	const sumSubs = (list: any[]) =>
		list.reduce((a: number, c: any) => a + Number(c?.recurring) + Number(c?.is_onetime), 0);
	const sumRent = (list: any[]) => list?.reduce((a: number, c: any) => a + Number(c.count), 0) ?? 0;

	if (loading) return <Loader />;

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
					<Box sx={{ mt: 2 }}>
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
					<Box sx={{ mt: 2 }}>
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
					<Box sx={{ mt: 2 }}>
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
					<Box sx={{ mt: 2 }}>
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
					<Box sx={{ mt: 2 }}>
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
