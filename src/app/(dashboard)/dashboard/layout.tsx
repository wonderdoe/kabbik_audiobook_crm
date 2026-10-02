'use client';

import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { getNavLinks } from '@/config';

interface Props {
	children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
	const [drawerOpen, setDrawerOpen] = useState(true);
	const router = useRouter();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (Cookies.get('admin_token')) {
			setLoading(false);
		} else {
			router.push('/');
		}
	}, [router]);

	if (loading) {
		return null;
	}

	return (
		<MainLayout
			navData={getNavLinks()}
			drawerOpen={drawerOpen}
			onToggleDrawer={() => setDrawerOpen(o => !o)}
		>
			{children}
		</MainLayout>
	);
}
