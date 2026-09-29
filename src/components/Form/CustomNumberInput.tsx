import { NumberInput } from '@mantine/core';
import { Controller } from 'react-hook-form';

type CustomNumberInputProps = {
	label: string;
	name: string;
	value?: number;
	placeholder: string;
	control: any;
	error: string;
	withAsterisk?: boolean;
	disabled?: boolean;
};
export const CustomNumberInput = ({
	label,
	name,
	value,
	placeholder,
	control,
	error,
	withAsterisk = false,
	disabled = false,
}: CustomNumberInputProps) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => {
				return (
					<NumberInput
						label={label}
						placeholder={placeholder}
						{...field}
						error={error}
						withAsterisk={withAsterisk}
						disabled={disabled}
					/>
				);
			}}
		/>
	);
};
