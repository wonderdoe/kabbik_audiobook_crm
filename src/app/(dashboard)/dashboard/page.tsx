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
import {
	breakdownDayTotal,
	getBreakdown,
	type GatewayBreakdownRow,
} from '@/components/revenue/subscription-gateway-breakdown';
import { dashboardSummaryUrl, subscriptionRevenueUrl } from '@/utils/constant';
import { dhakaTodayYmd } from '@/utils/dhaka-date-client';

function last7DhakaDays(anchorYmd: string): string[] {
	return Array.from({ length: 7 }, (_, i) =>
		moment(anchorYmd, 'YYYY-MM-DD').subtract(i, 'days').format('YYYY-MM-DD'),
	);
}

function kabbikTotalsFromReport(
	kabbik: Record<string, Record<string, number>>,
	anchorYmd: string,
): {
	recentTotalPayments: { date: string; Amount: number }[];
	kabbikTodayBreakdown: GatewayBreakdownRow[];
} {
	const dayStrings = last7DhakaDays(anchorYmd);
	const recentTotalPayments = dayStrings.map(day => {
		const nested = Object.entries(kabbik[day] ?? {}) as [string, number][];
		return {
			date: moment(day, 'YYYY-MM-DD').format('Do MMM, YYYY'),
			Amount: breakdownDayTotal(getBreakdown(nested)),
		};
	});
	const todayNested = Object.entries(kabbik[anchorYmd] ?? {}) as [string, number][];
	return {
		recentTotalPayments,
		kabbikTodayBreakdown: getBreakdown(todayNested),
	};
}

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
		setTopMostUsedPromos(
			data.topMostUsedPromos ?? { today: [], yesterday: [] },
		);
		setReportSummary(data.reportSummary ?? null);
	};

	const loadKabbikRevenueWeek = useCallback(async () => {
		const anchorYmd = dhakaTodayYmd();
		const startDate = moment(anchorYmd, 'YYYY-MM-DD').subtract(6, 'days').format('YYYY-MM-DD');
		try {
			const res = await fetch(
				`${subscriptionRevenueUrl}?startDate=${startDate}&endDate=${anchorYmd}`,
				{ cache: 'no-store' },
			);
			if (!res.ok) {
				setRecentTotalPayments([]);
				setKabbikTodayBreakdown([]);
				return;
			}
			const json = await res.json() as { kabbik?: Record<string, Record<string, number>> };
			const { recentTotalPayments: series, kabbikTodayBreakdown: breakdown } =
				kabbikTotalsFromReport(json.kabbik ?? {}, anchorYmd);
			setRecentTotalPayments(series);
			setKabbikTodayBreakdown(breakdown);
		} catch {
			setRecentTotalPayments([]);
			setKabbikTodayBreakdown([]);
		}
	}, []);

	const loadSummary = useCallback(async (refresh = false) => {
		const date = dhakaTodayYmd();
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
		loadKabbikRevenueWeek();
	}, [loadSummary, loadKabbikRevenueWeek]);

	const handleRefresh = async () => {
		if (!checkgetPermission('dashboard')) return;
		setRefreshing(true);
		try {
			await Promise.all([loadSummary(true), loadKabbikRevenueWeek()]);
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
