'use client';

import {
	Button,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { Logo } from '@/components/Logo/Logo';
import { AuthSplit } from '@/sections/auth/AuthSplit';
import { createToast } from 'helpers/SweetAlert';

export function RegisterForm() {
	return (
		<AuthSplit tagline="Request access to the Kabbik Audiobook admin panel.">
			<Logo />
			<Typography variant="h4" sx={{ mt: 3, mb: 0.5 }}>
				Register
			</Typography>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
				Contact your administrator for an invite
			</Typography>
			<Stack spacing={2}>
				<TextField fullWidth label="Email" placeholder="test@example.com" required />
				<TextField fullWidth type="password" label="Password" placeholder="Your password" required />
				<Button
					fullWidth
					variant="contained"
					size="large"
					onClick={() => createToast('Contact with Kabbik CRM users')}
				>
					Sign Up
				</Button>
			</Stack>
		</AuthSplit>
	);
}
