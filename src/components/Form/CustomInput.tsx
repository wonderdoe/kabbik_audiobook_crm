import { TextInput } from '@mantine/core';
import { Controller } from 'react-hook-form';

type CustomInputProps = {
	label: string;
	name: string;
	placeholder: string;
	control: any;
	error: string;
	withAsterisk?: boolean;
};

export const CustomInput = ({
	label,
	name,
	placeholder,
	control,
	error,
	withAsterisk = false,
}: CustomInputProps) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => {
				return (
					<TextInput
						label={label}
						placeholder={placeholder}
						{...field}
						error={error}
						withAsterisk={withAsterisk}
					/>
				);
			}}
		/>
	);
};
