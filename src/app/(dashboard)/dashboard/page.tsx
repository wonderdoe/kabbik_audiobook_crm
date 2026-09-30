'use client';

import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { Button, Group, Text } from '@mantine/core';
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
			<PageContainer title="Dashboard">
				{!loading ? (
					<>
						<Group justify="space-between" mb="sm">
							{updatedLabel ? (
								<Text size="sm" c="dimmed">
									{updatedLabel}
								</Text>
							) : (
								<span />
							)}
							{checkgetPermission('dashboard') ? (
								<Button
									variant="light"
									size="xs"
									leftSection={<IconRefresh size={14} />}
									loading={refreshing}
									onClick={handleRefresh}
								>
									Refresh
								</Button>
							) : null}
						</Group>
						{checkgetPermission('dashboard') && (
							<DashboardContent
								dashboardData={res}
								recentTotalPayments={recentTotalPayments}
								topMostUsedPromos={topMostUsedPromos}
							/>
						)}
					</>
				) : (
					<Loader />
				)}
			</PageContainer>
		</>
	);
}
