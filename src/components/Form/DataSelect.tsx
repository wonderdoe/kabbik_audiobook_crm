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
	fullWidth?: boolean;
	sx?: object;
};

/** Select API (`data`, `clearable`, `searchable`) implemented with MUI. */
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
	fullWidth = false,
	sx,
}: DataSelectProps) {
	const options = normalize(data);
	const autocompleteId = useId();
	const selectId = `${autocompleteId}-select`;
	const labelId = `${autocompleteId}-label`;
	const hasEmptyOption = options.some(o => o.value === '');
	const showClearOption = clearable && !hasEmptyOption;

	if (searchable) {
		return (
			<Autocomplete
				disabled={disabled}
				options={options}
				sx={{ width: fullWidth ? '100%' : 'auto', minWidth: fullWidth ? 0 : undefined, ...sx }}
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
						fullWidth={fullWidth}
						sx={{ width: fullWidth ? '100%' : undefined, minWidth: fullWidth ? 0 : undefined, ...sx }}
						required={required}
						error={Boolean(error)}
						helperText={error}
						InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
					/>
				)}
			/>
		);
	}

	const selectedValue = value ?? '';

	return (
		<TextField
			select
			id={selectId}
			label={label}
			size="small"
			fullWidth={fullWidth}
			required={required}
			disabled={disabled}
			error={Boolean(error)}
			helperText={error}
			value={selectedValue}
			sx={{
				width: fullWidth ? '100%' : undefined,
				minWidth: fullWidth ? 0 : 200,
				...sx,
			}}
			InputLabelProps={{
				id: labelId,
				shrink: true,
			}}
			onChange={e => {
				const v = e.target.value as string;
				onChange?.(v === '' ? null : v);
			}}
			SelectProps={{
				labelId,
				displayEmpty: true,
				renderValue: selected => {
					const v = selected as string;
					if (!v) {
						return (
							<Box component="span" sx={{ color: 'text.secondary' }}>
								{options.find(o => o.value === '')?.label ?? placeholder}
							</Box>
						);
					}
					return options.find(o => o.value === v)?.label ?? v;
				},
			}}
		>
			{showClearOption && (
				<MenuItem value="">
					<em>{placeholder}</em>
				</MenuItem>
			)}
			{options.map(o => (
				<MenuItem key={o.value === '' ? '__empty__' : o.value} value={o.value}>
					{o.label}
				</MenuItem>
			))}
		</TextField>
	);
}
