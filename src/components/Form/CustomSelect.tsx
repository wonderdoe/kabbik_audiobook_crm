import {
	Autocomplete,
	FormHelperText,
	TextField,
} from '@mui/material';
import { Controller } from 'react-hook-form';

type CustomSelectProps = {
	label: string;
	name: string;
	data?: Array<{ label: string; value: string }>;
	placeholder: string;
	control: any;
	clearable?: boolean;
	searchable?: boolean;
	error: string;
	required?: boolean;
};

export const CustomSelect = ({
	label,
	name,
	data = [],
	placeholder,
	control,
	clearable,
	searchable,
	error,
	required,
}: CustomSelectProps) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<Autocomplete
					options={data}
					getOptionLabel={option => (typeof option === 'string' ? option : option.label)}
					isOptionEqualToValue={(option, value) =>
						option.value === (typeof value === 'string' ? value : value?.value)
					}
					value={data.find(d => d.value === field.value) ?? null}
					onChange={(_, newValue) => field.onChange(newValue?.value ?? '')}
					disableClearable={!clearable}
					freeSolo={false}
					renderInput={params => (
						<TextField
							{...params}
							label={label}
							placeholder={placeholder}
							margin="none"
							size="small"
							fullWidth
							required={required}
							error={Boolean(error)}
							helperText={error || ' '}
							InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
						/>
					)}
				/>
			)}
		/>
	);
};
