'use client';

import { useId } from 'react';
import {
	Autocomplete,
	Box,
	MenuItem,
	TextField,
} from '@mui/material';

type DataItem = string | { label: string; value: string };

function normalize(data: DataItem[] = []) {
	return data.map(d => (typeof d === 'string' ? { label: d, value: d } : d));
}

type DataSelectProps = {
	label?: string;
	placeholder?: string;
	data?: DataItem[];
	value?: string | null;
	onChange?: (value: string | null) => void;
	clearable?: boolean;
	searchable?: boolean;
	disabled?: boolean;
	required?: boolean;
	error?: string;
};

/** Mantine-style Select (`data`, `clearable`, `searchable`) on MUI. */
export function DataSelect({
	label,
	placeholder = 'All',
	data = [],
	value,
	onChange,
	clearable,
	searchable,
	disabled,
	required,
	error,
}: DataSelectProps) {
	const options = normalize(data);
	const autocompleteId = useId();

	if (searchable) {
		return (
			<Autocomplete
				disabled={disabled}
				options={options}
				getOptionLabel={o => o.label}
				isOptionEqualToValue={(a, b) => a.value === b.value}
				value={options.find(o => o.value === (value ?? '')) ?? null}
				onChange={(_, opt) => onChange?.(opt?.value ?? null)}
				disableClearable={!clearable}
				renderInput={params => (
					<TextField
						{...params}
						label={label}
						placeholder={placeholder}
						size="small"
						sx={{ width: '100%' }}
						required={required}
						error={Boolean(error)}
						helperText={error}
						InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
					/>
				)}
			/>
		);
	}

	return (
		<TextField
			select
			id={autocompleteId}
			label={label}
			size="small"
			fullWidth
			required={required}
			disabled={disabled}
			error={Boolean(error)}
			helperText={error}
			value={value ?? ''}
			InputLabelProps={{ shrink: true }}
			onChange={e => {
				const v = e.target.value as string;
				onChange?.(v === '' ? null : v);
			}}
			SelectProps={{
				displayEmpty: true,
				renderValue: selected => {
					const selectedValue = selected as string;
					if (!selectedValue) {
						return (
							<Box component="span" sx={{ color: 'text.disabled' }}>
								{placeholder}
							</Box>
						);
					}
					return options.find(o => o.value === selectedValue)?.label ?? selectedValue;
				},
			}}
		>
			{(clearable || (placeholder && !required)) && (
				<MenuItem value="">
					<em>{placeholder}</em>
				</MenuItem>
			)}
			{options.map(o => (
				<MenuItem key={o.value} value={o.value}>
					{o.label}
				</MenuItem>
			))}
		</TextField>
	);
}
