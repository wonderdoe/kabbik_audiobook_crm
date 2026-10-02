import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Controller } from 'react-hook-form';
import dayjs, { Dayjs } from 'dayjs';

type CustomDatePickerProps = {
	label: string;
	name: string;
	placeholder: string;
	control: any;
	error: string;
	clearable?: boolean; required?: boolean;
	defaultValue?: Date;
};

export const CustomDatePicker = ({
	label,
	name,
	control,
	error, required,
	defaultValue,
}: CustomDatePickerProps) => {
	return (
		<Controller
			name={name}
			control={control}
			defaultValue={defaultValue ?? new Date()}
			render={({ field }) => (
				<DatePicker
					label={label}
					value={field.value ? dayjs(field.value) : null}
					onChange={(date: Dayjs | null) => field.onChange(date?.toDate() ?? null)}
					slotProps={{
						textField: {
							required: required,
							error: Boolean(error),
							helperText: error || ' ',
							fullWidth: true,
							margin: 'normal',
							size: 'small',
						},
					}}
				/>
			)}
		/>
	);
};
