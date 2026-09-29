'use client';
import { ActionIcon, Box, Button, Drawer, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSettings } from '@tabler/icons-react';
import classes from './AdminHeader.module.css';
import { DirectionSwitcher } from '../DirectionSwitcher/DirectionSwitcher';
import { Logo } from '../Logo/Logo';
import { ThemeSwitcher } from '../ThemeSwitcher/ThemeSwitcher';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface Props {
	burger?: React.ReactNode;
}

export function AdminHeader({ burger }: Props, { cookieToken }: any) {
	const [opened, { close, open }] = useDisclosure(false);

	const router = useRouter();

	const handleLogout = () => {
		Cookies.remove('admin_token');
		localStorage.removeItem('id');
		localStorage.removeItem('name');
		localStorage.removeItem('email');
		router.push('/login');
	};

	return (
		<header className={classes.header}>
			{burger && burger}
			<Logo />
			<Box style={{ flex: 1 }} />

			<ActionIcon onClick={open} variant="subtle">
				<IconSettings size="1.25rem" />
			</ActionIcon>

			<Drawer
				opened={opened}
				onClose={close}
				title="Settings"
				position="right"
				transitionProps={{ duration: 0 }}
			>
				<Stack gap="lg">
					<ThemeSwitcher />
					<DirectionSwitcher />
				</Stack>
			</Drawer>

			<Button onClick={handleLogout}>Log out</Button>
		</header>
	);
}
