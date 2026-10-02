import {
	TextField,
} from '@mui/material';
import { Controller } from 'react-hook-form';

type CustomNumberInputProps = {
	label: string;
	name: string;
	placeholder: string;
	control: any;
	error: string; required?: boolean;
	min?: number;
	max?: number;
};

export const CustomNumberInput = ({
	label,
	name,
	placeholder,
	control,
	error, required = false,
	min,
	max,
}: CustomNumberInputProps) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<TextField
					label={label}
					placeholder={placeholder}
					type="number"
					{...field}
					value={field.value ?? ''}
					onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
					error={Boolean(error)}
					helperText={error || ' '}
					required={required}
					sx={{ width: "100%" }}
					margin="normal"
					inputProps={{ min, max }}
				/>
			)}
		/>
	);
};
