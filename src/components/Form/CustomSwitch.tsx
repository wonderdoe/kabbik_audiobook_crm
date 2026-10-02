import {
	FormControl,
	FormControlLabel,
	FormHelperText,
	Switch,
} from '@mui/material';
import { Controller } from 'react-hook-form';

type CustomSwitchProps = {
	label: string;
	name: string;
	control: any;
	error?: string;
};

export const CustomSwitch = ({ label, name, control, error }: CustomSwitchProps) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<FormControl error={Boolean(error)} margin="normal">
					<FormControlLabel
						control={<Switch checked={Boolean(field.value)} onChange={field.onChange} />}
						label={label}
					/>
					{error ? <FormHelperText>{error}</FormHelperText> : null}
				</FormControl>
			)}
		/>
	);
};
