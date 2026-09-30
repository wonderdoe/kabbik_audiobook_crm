'use client';

import { Button, Group, Select, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconSearch } from '@tabler/icons-react';
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
		<Group align="flex-end" wrap="wrap" gap="sm">
			<TextInput
				label="Search"
				placeholder="Name, username, email, phone"
				leftSection={<IconSearch size={16} />}
				value={filters.search}
				onChange={e => onChange({ ...filters, search: e.currentTarget.value })}
				w={{ base: '100%', sm: 280 }}
			/>
			<Select
				label="Claim status"
				placeholder="All"
				clearable
				data={options?.claimStatuses ?? []}
				value={filters.claimStatus}
				onChange={v => onChange({ ...filters, claimStatus: v })}
				w={160}
			/>
			<Select
				label="Tier"
				placeholder="All"
				clearable
				data={options?.tiers ?? []}
				value={filters.tierId}
				onChange={v => onChange({ ...filters, tierId: v })}
				w={180}
			/>
			<Select
				label="Used"
				placeholder="All"
				clearable
				data={[
					{ value: '1', label: 'Yes' },
					{ value: '0', label: 'No' },
				]}
				value={filters.isUsed}
				onChange={v => onChange({ ...filters, isUsed: v })}
				w={120}
			/>
			<DatePickerInput
				type="range"
				label="Claimed date range"
				value={[filters.dateFrom, filters.dateTo]}
				onChange={range =>
					onChange({
						...filters,
						dateFrom: range[0],
						dateTo: range[1],
					})
				}
				clearable
				w={{ base: '100%', sm: 280 }}
			/>
			<Button variant="default" onClick={onReset}>
				Reset filters
			</Button>
		</Group>
	);
}
