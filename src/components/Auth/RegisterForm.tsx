'use client';
import { Button, Paper, PasswordInput, Space, TextInput } from '@mantine/core';
import { createToast } from 'helpers/SweetAlert';

export function RegisterForm() {
	return (
		<Paper withBorder shadow="md" p={30} mt={30} radius="md">
			<TextInput label="Email" placeholder="test@example.com" required />
			<PasswordInput label="Password" placeholder="Your password" required mt="md" />
			<Space h="md" />
			<Button
				fullWidth
				mt="xl"
				onClick={() => {
					createToast('Contact with Kabbik CRM users');
				}}
			>
				Sign Up
			</Button>
		</Paper>
	);
}
