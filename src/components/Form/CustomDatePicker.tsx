import { DatePickerInput } from '@mantine/dates';
import { Controller } from 'react-hook-form';
import '@mantine/dates/styles.css';

type CustomDatePickerProps = {
	label: string;
	name: string;
	placeholder: string;
	control: any;
	error: string;
	clearable?: boolean;
	withAsterisk?: boolean;
	defaultValue?:Date
};

export const CustomDatePicker = ({
	label,
	name,
	placeholder,
	control,
	error,
	clearable,
	withAsterisk,
	defaultValue
}: CustomDatePickerProps) => {
	console.log(defaultValue,"defaultValue");
	
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => {
				return (
					<DatePickerInput
						{...field}
						label={label}
						placeholder={placeholder}
						error={error}
						clearable={clearable}
						withAsterisk={withAsterisk}
						defaultValue={defaultValue ?? new Date()}
					/>
				);
			}}
		/>
	);
};
