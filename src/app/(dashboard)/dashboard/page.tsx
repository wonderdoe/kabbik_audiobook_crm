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
import { getBreakdown, type GatewayBreakdownRow } from '@/components/revenue/subscription-gateway-breakdown';
import { dashboardSummaryUrl, subscriptionRevenueUrl } from '@/utils/constant';

type ReportSummary = {
	lifetimeSubscribers: number;
	activeSubscribers: number;
	blSubscribers: number;
	activeRentCount: number;
	totalPlayCount: number;
} | null;

type DashboardSummaryResponse = {
	updatedAt: string;
	dashboardData: unknown[];
	recentTotalPayments: { date: string; Amount: number }[];
	topMostUsedPromos: { today: unknown[]; yesterday: unknown[] };
	reportSummary?: ReportSummary;
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
	const [reportSummary, setReportSummary] = useState<ReportSummary>(null);
	const [kabbikTodayBreakdown, setKabbikTodayBreakdown] = useState<GatewayBreakdownRow[]>([]);

	const applySnapshot = (data: DashboardSummaryResponse) => {
		setUpdatedAt(data.updatedAt);
		setRes(data.dashboardData ?? []);
		setRecentTotalPayments(data.recentTotalPayments ?? []);
		setTopMostUsedPromos(
			data.topMostUsedPromos ?? { today: [], yesterday: [] },
		);
		setReportSummary(data.reportSummary ?? null);
	};

	const loadKabbikTodayBreakdown = useCallback(async () => {
		const date = moment().format('YYYY-MM-DD');
		try {
			const res = await fetch(
				`${subscriptionRevenueUrl}?startDate=${date}&endDate=${date}`,
				{ cache: 'no-store' },
			);
			if (!res.ok) return;
			const json = await res.json() as { kabbik?: Record<string, Record<string, number>> };
			const dayMap = json.kabbik?.[date] ?? {};
			const nested = Object.entries(dayMap) as [string, number][];
			setKabbikTodayBreakdown(getBreakdown(nested));
		} catch {
			setKabbikTodayBreakdown([]);
		}
	}, []);

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
		loadKabbikTodayBreakdown();
	}, [loadSummary, loadKabbikTodayBreakdown]);

	const handleRefresh = async () => {
		if (!checkgetPermission('dashboard')) return;
		setRefreshing(true);
		try {
			await Promise.all([loadSummary(true), loadKabbikTodayBreakdown()]);
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
							reportSummary={reportSummary}
							kabbikTodayBreakdown={kabbikTodayBreakdown}
						/>
					) : null
				) : (
					<Loader />
				)}
			</PageContainer>
		</>
	);
}
