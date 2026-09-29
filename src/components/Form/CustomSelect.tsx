import { Select } from '@mantine/core';
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
	withAsterisk?: boolean;
};

export const CustomSelect = ({
	label,
	name,
	data,
	placeholder,
	control,
	clearable,
	searchable,
	error,
	withAsterisk,
}: CustomSelectProps) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => {
				return (
					<Select
						label={label}
						placeholder={placeholder}
						data={data}
						{...field}
						clearable={clearable}
						searchable={searchable}
						error={error}
						withAsterisk={withAsterisk}
					/>
				);
			}}
		/>
	);
};
