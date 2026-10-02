'use client';

import {
	Alert,
	Box,
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Pagination,
	Select,
	Skeleton,
	Stack,
	Typography,
} from '@mui/material';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { IconDownload } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RewardClaimDrawer } from './components/RewardClaimDrawer';
import { RewardClaimsTable } from './components/RewardClaimsTable';
import { RewardFiltersBar } from './components/RewardFiltersBar';
import { RewardSummaryCards } from './components/RewardSummaryCards';
import type { RewardClaimRow, RewardFilters, RewardSummary } from '@/types/rewards';

const defaultFilters: RewardFilters = {
	search: '',
	claimStatus: null,
	tierId: null,
	isUsed: null,
	dateFrom: null,
	dateTo: null,
};

function toQueryString(filters: RewardFilters, page: number, pageSize: number, extra?: Record<string, string>) {
	const p = new URLSearchParams();
	p.set('page', String(page));
	p.set('pageSize', String(pageSize));
	if (filters.search.trim()) p.set('search', filters.search.trim());
	if (filters.claimStatus) p.set('claimStatus', filters.claimStatus);
	if (filters.tierId) p.set('tierId', filters.tierId);
	if (filters.isUsed) p.set('isUsed', filters.isUsed);
	if (filters.dateFrom) p.set('dateFrom', filters.dateFrom.toISOString().slice(0, 10));
	if (filters.dateTo) p.set('dateTo', filters.dateTo.toISOString().slice(0, 10));
	if (extra) {
		Object.entries(extra).forEach(([k, v]) => p.set(k, v));
	}
	return p.toString();
}

export default function RewardsPage() {
	const [filters, setFilters] = useState<RewardFilters>(defaultFilters);
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);
	const [rows, setRows] = useState<RewardClaimRow[]>([]);
	const [total, setTotal] = useState(0);
	const [summary, setSummary] = useState<RewardSummary | null>(null);
	const [filterOptions, setFilterOptions] = useState<{
		claimStatuses: string[];
		tiers: { value: string; label: string }[];
	} | null>(null);
	const [loading, setLoading] = useState(true);
	const [summaryLoading, setSummaryLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [selectedId, setSelectedId] = useState<number | null>(null);

	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(filters.search), 400);
		return () => clearTimeout(t);
	}, [filters.search]);

	const effectiveFilters = useMemo(
		() => ({ ...filters, search: debouncedSearch }),
		[filters, debouncedSearch],
	);

	const loadFilterOptions = useCallback(async () => {
		const res = await fetch('/api/routes/rewards?type=filters');
		if (!res.ok) return;
		const json = await res.json();
		setFilterOptions(json.filters);
	}, []);

	const loadData = useCallback(async () => {
		setLoading(true);
		setSummaryLoading(true);
		setError(null);
		const qs = toQueryString(effectiveFilters, page, pageSize);
		const summaryQs = toQueryString(effectiveFilters, 1, 25, { type: 'summary' });
		try {
			const [listRes, summaryRes] = await Promise.all([
				fetch(`/api/routes/rewards?${qs}`),
				fetch(`/api/routes/rewards?${summaryQs}`),
			]);
			if (!listRes.ok || !summaryRes.ok) throw new Error('fetch failed');
			const listJson = await listRes.json();
			const summaryJson = await summaryRes.json();
			setRows(listJson.data ?? []);
			setTotal(listJson.total ?? 0);
			setSummary(summaryJson.summary ?? null);
		} catch {
			setError('Failed to load rewards. Please try again.');
		} finally {
			setLoading(false);
			setSummaryLoading(false);
		}
	}, [effectiveFilters, page, pageSize]);

	useEffect(() => {
		loadFilterOptions();
	}, [loadFilterOptions]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const showingTo = Math.min(total, page * pageSize);

	const handleExport = () => {
		const qs = toQueryString(effectiveFilters, 1, pageSize);
		window.open(`/api/routes/rewards/export?${qs}`, '_blank');
	};

	const handleView = (row: RewardClaimRow) => {
		setSelectedId(row.id);
		setDrawerOpen(true);
	};

	return (
		<PageContainer
			title="Rewards"
			items={[{ label: 'Rewards', href: '/dashboard/rewards' }]}
			subtitle={
				<Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
					View tier reward claims and usage
				</Typography>
			}
			actions={
				<Button variant="outlined" startIcon={<IconDownload size={16} />} onClick={handleExport}>
					Export CSV
				</Button>
			}
		>
		<Stack spacing={2}>

			<RewardSummaryCards summary={summary} loading={summaryLoading} />

			<RewardFiltersBar
				filters={filters}
				onChange={next => {
					setFilters(next);
					setPage(1);
				}}
				onReset={() => {
					setFilters(defaultFilters);
					setPage(1);
				}}
				options={filterOptions}
			/>

			{error ? (
				<Alert severity="error"
					action={
						<Button color="inherit" size="small" onClick={() => loadData()}>
							Retry
						</Button>
					}
				>
					{error}
				</Alert>
			) : null}

			{loading ? (
				<Stack>
					<Skeleton height={32} />
					<Skeleton height={200} />
				</Stack>
			) : rows.length === 0 ? (
				<Typography textAlign="center" color="text.secondary">
					No claims match these filters
				</Typography>
			) : (
				<RewardClaimsTable rows={rows} onView={handleView} />
			)}

			<Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
				<Typography variant="body2" color="text.secondary">
					Showing {showingFrom}-{showingTo} of {total}
				</Typography>
				<Stack direction="row" alignItems="center" gap={2}>
					<FormControl size="small" sx={{ width: 100 }}>
						<InputLabel>Page size</InputLabel>
						<Select
							label="Page size"
							value={String(pageSize)}
							onChange={e => {
								setPageSize(Number(e.target.value));
								setPage(1);
							}}
						>
							<MenuItem value="25">25</MenuItem>
							<MenuItem value="50">50</MenuItem>
							<MenuItem value="100">100</MenuItem>
						</Select>
					</FormControl>
					<Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
				</Stack>
			</Stack>

			<RewardClaimDrawer
				claimId={selectedId}
				opened={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				onUpdated={() => loadData()}
			/>
		</Stack>
		</PageContainer>
	);
}
