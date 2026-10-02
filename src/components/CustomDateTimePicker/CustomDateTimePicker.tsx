import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import { tProps } from './static/types';

export default function CustomDateTimePicker({
	label,
	placeholder,
	changeHandler,
	value,
	error,
}: tProps) {
	return (
		<div>
			<DateTimePicker
				label={label}
				value={value ? dayjs(value) : null}
				onChange={(d: Dayjs | null) => changeHandler(d?.toDate() ?? null)}
				minDateTime={dayjs()}
				slotProps={{
					textField: {
						placeholder,
						size: 'small',
						fullWidth: true,
					},
				}}
			/>
			<p style={{ color: '#FA5252', marginTop: 0, fontSize: '12px' }}>
				{error ? 'No date selected' : ''}
			</p>
		</div>
	);
}
