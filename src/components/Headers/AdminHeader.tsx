'use client';

import {
	Box,
	Button,
	Drawer,
	IconButton,
	Stack,
	Toolbar,
	Typography,
} from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Logo } from '../Logo/Logo';

interface Props {
	burger?: React.ReactNode;
}

export function AdminHeader({ burger }: Props) {
	const [opened, setOpened] = useState(false);
	const router = useRouter();

	const handleLogout = () => {
		Cookies.remove('admin_token');
		localStorage.removeItem('id');
		localStorage.removeItem('name');
		localStorage.removeItem('email');
		router.push('/login');
	};

	return (
		<Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 64 } }}>
			{burger}
			<Box sx={{ display: { xs: 'block', sm: 'none' } }}>
				<Logo compact />
			</Box>
			<Box sx={{ flex: 1 }} />
			<IconButton onClick={() => setOpened(true)} size="small" aria-label="settings">
				<SettingsOutlinedIcon />
			</IconButton>
			<Button variant="outlined" size="small" onClick={handleLogout}>
				Log out
			</Button>

			<Drawer anchor="right" open={opened} onClose={() => setOpened(false)}>
				<Box sx={{ width: 280, p: 2 }}>
					<Typography variant="h6" gutterBottom>
						Settings
					</Typography>
					<Stack spacing={2}>
						<Typography variant="body2" color="text.secondary">
							Theme and direction options will return in a future update. CRM uses Mantis light
							theme by default.
						</Typography>
					</Stack>
				</Box>
			</Drawer>
		</Toolbar>
	);
}
