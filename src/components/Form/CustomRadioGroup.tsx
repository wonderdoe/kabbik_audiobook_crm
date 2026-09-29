import { Group, Radio } from '@mantine/core';
import { Controller } from 'react-hook-form';

type CustomRadioGroupProps = {
	label: string;
	name: string;
	data: Array<{ label: string; value: string }>;
	control: any;
	clearable?: boolean;
	error: string;
	withAsterisk?: boolean;
};

export const CustomRadioGroup = ({
	label,
	name,
	data,
	control,
	clearable,
	error,
	withAsterisk,
}: CustomRadioGroupProps) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => {
				return (
					<Radio.Group label={label} {...field} withAsterisk={withAsterisk} error={error}>
						<Group mt="xs">
							{data.map(item => (
								<Radio key={item.label} label={item.label} value={item.value} />
							))}
						</Group>
					</Radio.Group>
				);
			}}
		/>
	);
};
