import {
	FormControl,
	FormControlLabel,
	FormHelperText,
	FormLabel,
	Radio,
	RadioGroup,
} from '@mui/material';
import { Controller } from 'react-hook-form';

type CustomRadioGroupProps = {
	label: string;
	name: string;
	control: any;
	error: string;
	data: { label: string; value: string }[];
};

export const CustomRadioGroup = ({ label, name, control, error, data }: CustomRadioGroupProps) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<FormControl error={Boolean(error)} margin="normal">
					<FormLabel>{label}</FormLabel>
					<RadioGroup {...field} value={field.value ?? ''}>
						{data.map(item => (
							<FormControlLabel
								key={item.value}
								value={item.value}
								control={<Radio size="small" />}
								label={item.label}
							/>
						))}
					</RadioGroup>
					<FormHelperText>{error || ' '}</FormHelperText>
				</FormControl>
			)}
		/>
	);
};
