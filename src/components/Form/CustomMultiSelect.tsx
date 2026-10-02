import {
	Autocomplete,
	TextField,
} from '@mui/material';
import { Controller } from 'react-hook-form';

type CustomMultiSelectProps = {
	label: string;
	name: string;
	data: { label: string; value: string }[];
	placeholder: string;
	control: any;
	clearable?: boolean;
	error: string; required?: boolean;
	searchable?: boolean;
};

export const CustomMultiSelect = ({
	label,
	name,
	data,
	placeholder,
	control,
	error, required,
}: CustomMultiSelectProps) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<Autocomplete
					multiple
					options={data}
					getOptionLabel={option => option.label}
					isOptionEqualToValue={(a, b) => a.value === b.value}
					value={data.filter(d => (field.value ?? []).includes(d.value))}
					onChange={(_, newValue) => field.onChange(newValue.map(v => v.value))}
					renderInput={params => (
						<TextField
							{...params}
							label={label}
							placeholder={placeholder}
							error={Boolean(error)}
							helperText={error || ' '}
							required={required}
							margin="normal"
						/>
					)}
				/>
			)}
		/>
	);
};
