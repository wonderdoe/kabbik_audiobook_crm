import {
	TextField,
} from '@mui/material';
import { Controller } from 'react-hook-form';

type CustomTextareaProps = {
	label: string;
	name: string;
	placeholder: string;
	control: any;
	error: string; required?: boolean;
	minRows?: number;
};

export const CustomTextarea = ({
	label,
	name,
	placeholder,
	control,
	error, required = false,
	minRows = 3,
}: CustomTextareaProps) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<TextField
					label={label}
					placeholder={placeholder}
					{...field}
					value={field.value ?? ''}
					error={Boolean(error)}
					helperText={error || ' '}
					required={required}
					sx={{ width: "100%" }}
					margin="normal"
					multiline
					minRows={minRows}
				/>
			)}
		/>
	);
};
