import {
	TextField,
} from '@mui/material';
import { Controller } from 'react-hook-form';

type CustomInputProps = {
	label: string;
	name: string;
	placeholder: string;
	control: any;
	error: string;
	required?: boolean;
	dense?: boolean;
};

export const CustomInput = ({
	label,
	name,
	placeholder,
	control,
	error,
	required = false,
	dense = false,
}: CustomInputProps) => {
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
					sx={{ width: '100%' }}
					size={dense ? 'small' : 'medium'}
					margin={dense ? 'none' : 'normal'}
				/>
			)}
		/>
	);
};
