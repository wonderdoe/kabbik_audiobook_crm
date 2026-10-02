'use client';

import {
	Button,
	CircularProgress,
	Typography,
} from '@mui/material';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { IconRefresh } from '@tabler/icons-react';
import { DashboardContent } from '@/components/Dashboard/DashboardContent';
import Loader from '@/components/Loader';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { checkgetPermission } from '@/helper/Commonfunction';
import { dashboardSummaryUrl } from '@/utils/constant';

type DashboardSummaryResponse = {
	updatedAt: string;
	dashboardData: unknown[];
	recentTotalPayments: { date: string; Amount: number }[];
	topMostUsedPromos: { today: unknown[]; yesterday: unknown[] };
};

export default function Dashboard() {
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [updatedAt, setUpdatedAt] = useState<string | null>(null);
	const [res, setRes] = useState<unknown[]>([]);
	const [recentTotalPayments, setRecentTotalPayments] = useState<
		{ date: string; Amount: number }[]
	>([]);
	const [topMostUsedPromos, setTopMostUsedPromos] = useState<{
		yesterday: unknown[];
		today: unknown[];
	}>({
		yesterday: [],
		today: [],
	});

	const applySnapshot = (data: DashboardSummaryResponse) => {
		setUpdatedAt(data.updatedAt);
		setRes(data.dashboardData ?? []);
		setRecentTotalPayments(data.recentTotalPayments ?? []);
		setTopMostUsedPromos(
			data.topMostUsedPromos ?? { today: [], yesterday: [] },
		);
	};

	const loadSummary = useCallback(async (refresh = false) => {
		const date = moment().format('YYYY-MM-DD');
		const url = refresh
			? `${dashboardSummaryUrl}?date=${date}&refresh=1`
			: `${dashboardSummaryUrl}?date=${date}`;
		const response = await fetch(url, { cache: 'no-store' });
		if (!response.ok) {
			throw new Error(`Fetch failed. Status: ${response.status}`);
		}
		const data: DashboardSummaryResponse = await response.json();
		applySnapshot(data);
	}, []);

	useEffect(() => {
		loadSummary()
			.catch(console.error)
			.finally(() => setLoading(false));
	}, [loadSummary]);

	const handleRefresh = async () => {
		if (!checkgetPermission('dashboard')) return;
		setRefreshing(true);
		try {
			await loadSummary(true);
		} catch (e) {
			console.error(e);
		} finally {
			setRefreshing(false);
		}
	};

	const updatedLabel = updatedAt
		? `Updated ${moment(updatedAt).fromNow()}`
		: null;

	return (
		<>
			<PageContainer
				title="Dashboard"
				items={[{ label: 'Dashboard', href: '/dashboard' }]}
				subtitle={
					updatedLabel ? (
						<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
							{updatedLabel}
						</Typography>
					) : undefined
				}
				actions={
					checkgetPermission('dashboard') ? (
						<Button
							variant="outlined"
							size="small"
							startIcon={refreshing ? <CircularProgress size={14} /> : <IconRefresh size={14} />}
							disabled={refreshing}
							onClick={handleRefresh}
						>
							Refresh
						</Button>
					) : undefined
				}
			>
				{!loading ? (
					checkgetPermission('dashboard') ? (
						<DashboardContent
							dashboardData={res}
							recentTotalPayments={recentTotalPayments}
							topMostUsedPromos={topMostUsedPromos}
						/>
					) : null
				) : (
					<Loader />
				)}
			</PageContainer>
		</>
	);
}
