'use client';

import {
	AppShell,
	Burger,
	Center,
	Text,
	useMantineColorScheme,
	useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/Headers/AdminHeader';
import { Navbar } from '@/components/Navbar/Navbar';
import { getNavLinks, navLinks } from '@/config';
import '../../../globals.css';
import { useState, useEffect } from 'react';

interface Props {
	children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
	const [opened, { toggle }] = useDisclosure();
	const { colorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();
	const router = useRouter();
	const [loading, setLoading] = useState(true);

	const bg = colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0];

	useEffect(() => {
		if (Cookies.get('admin_token')) {
			setLoading(false);
		} else {
			router.push('/');
		}
	}, [router]);

	return !loading ? (
		<AppShell
			header={{ height: 60 }}
			navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened, desktop: !opened } }}
			padding="md"
			transitionDuration={500}
			transitionTimingFunction="ease"
		>
			<AppShell.Navbar>
				<Navbar data={getNavLinks()} hidden={!opened} toggle={toggle} />
			</AppShell.Navbar>
			<AppShell.Header>
				<AdminHeader burger={<Burger opened={opened} onClick={toggle} size="sm" mr="xs" />} />
			</AppShell.Header>
			<AppShell.Main bg={bg} mb="lg">
				{children}
			</AppShell.Main>
			<AppShell.Footer>
				<Center>
					<Text size="sm" c="gray" my="xs">
						CopyRight © Kabbik Audiobook
					</Text>
				</Center>
			</AppShell.Footer>
		</AppShell>
	) : (
		<></>
	);
}
