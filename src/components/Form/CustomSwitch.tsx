import { Controller } from 'react-hook-form';
import { Flex, Switch, Text } from '@mantine/core';

type CustomSwitchProps = {
	label: string;
	name: string;
	control: any;
};

export const CustomSwitch = ({ label, name, control }: CustomSwitchProps) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => {
				return (
					<Flex justify={'space-between'}>
						<Text size="sm">{label}</Text>
						<Switch {...field} checked={field.value} />
					</Flex>
				);
			}}
		/>
	);
};
