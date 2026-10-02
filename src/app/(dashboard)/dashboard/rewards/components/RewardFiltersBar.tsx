'use client';

import {
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { IconSearch } from '@tabler/icons-react';
import dayjs, { Dayjs } from 'dayjs';
import type { RewardFilters } from '@/types/rewards';

type FilterOptions = {
	claimStatuses: string[];
	tiers: { value: string; label: string }[];
};

type Props = {
	filters: RewardFilters;
	onChange: (next: RewardFilters) => void;
	onReset: () => void;
	options: FilterOptions | null;
};

export function RewardFiltersBar({ filters, onChange, onReset, options }: Props) {
	return (
		<Stack direction="row" flexWrap="wrap" alignItems="flex-end" gap={1.5}>
			<TextField
				label="Search"
				placeholder="Name, username, email, phone"
				size="small"
				value={filters.search}
				onChange={e => onChange({ ...filters, search: e.target.value })}
				sx={{ width: { xs: '100%', sm: 280 } }}
				InputProps={{
					startAdornment: <IconSearch size={16} style={{ marginRight: 8, opacity: 0.6 }} />,
				}}
			/>
			<FormControl size="small" sx={{ width: 160 }}>
				<InputLabel>Claim status</InputLabel>
				<Select
					label="Claim status"
					value={filters.claimStatus ?? ''}
					onChange={e => onChange({ ...filters, claimStatus: e.target.value || null })}
					displayEmpty
				>
					<MenuItem value="">All</MenuItem>
					{(options?.claimStatuses ?? []).map(s => (
						<MenuItem key={s} value={s}>{s}</MenuItem>
					))}
				</Select>
			</FormControl>
			<FormControl size="small" sx={{ width: 180 }}>
				<InputLabel>Tier</InputLabel>
				<Select
					label="Tier"
					value={filters.tierId ?? ''}
					onChange={e => onChange({ ...filters, tierId: e.target.value || null })}
					displayEmpty
				>
					<MenuItem value="">All</MenuItem>
					{(options?.tiers ?? []).map(t => (
						<MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
					))}
				</Select>
			</FormControl>
			<FormControl size="small" sx={{ width: 120 }}>
				<InputLabel>Used</InputLabel>
				<Select
					label="Used"
					value={filters.isUsed ?? ''}
					onChange={e => onChange({ ...filters, isUsed: e.target.value || null })}
					displayEmpty
				>
					<MenuItem value="">All</MenuItem>
					<MenuItem value="1">Yes</MenuItem>
					<MenuItem value="0">No</MenuItem>
				</Select>
			</FormControl>
			<DatePicker
				label="Claimed from"
				value={filters.dateFrom ? dayjs(filters.dateFrom) : null}
				onChange={(d: Dayjs | null) => onChange({ ...filters, dateFrom: d?.toDate() ?? null })}
				slotProps={{ textField: { size: 'small', sx: { width: { xs: '100%', sm: 160 } } } }}
			/>
			<DatePicker
				label="Claimed to"
				value={filters.dateTo ? dayjs(filters.dateTo) : null}
				onChange={(d: Dayjs | null) => onChange({ ...filters, dateTo: d?.toDate() ?? null })}
				slotProps={{ textField: { size: 'small', sx: { width: { xs: '100%', sm: 160 } } } }}
			/>
			<Button variant="outlined" onClick={onReset}>Reset filters</Button>
		</Stack>
	);
}
