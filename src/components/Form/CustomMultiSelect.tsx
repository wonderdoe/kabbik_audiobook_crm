import { MultiSelect } from '@mantine/core';
import { Controller } from 'react-hook-form';

type CustomMultiSelectProps = {
	label: string;
	name: string;
	data: { label: string; value: string }[];
	placeholder: string;
	control: any;
	clearable?: boolean;
	error: string;
	withAsterisk?: boolean;
	searchable?: boolean;
};

export const CustomMultiSelect = ({
	label,
	name,
	data,
	placeholder,
	control,
	clearable,
	error,
	withAsterisk,
	searchable,
}: CustomMultiSelectProps) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => {
				return (
					<MultiSelect
						label={label}
						placeholder={placeholder}
						{...field}
						data={data}
						clearable={clearable}
						searchable={searchable}
						checkIconPosition="right"
						error={error}
						withAsterisk={withAsterisk}
					/>
				);
			}}
		/>
	);
};
