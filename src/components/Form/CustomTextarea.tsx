import { Textarea } from '@mantine/core';
import { Controller } from 'react-hook-form';

type CustomTextareaProps = {
	label: string;
	name: string;
	placeholder: string;
	control: any;
	error: string;
	withAsterisk?: boolean;
};

export const CustomTextarea = ({
	label,
	name,
	placeholder,
	control,
	error,
	withAsterisk,
}: CustomTextareaProps) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<Textarea
					label={label}
					placeholder={placeholder}
					{...field}
					error={error}
					withAsterisk={withAsterisk}
					resize="vertical"
				/>
			)}
		/>
	);
};
