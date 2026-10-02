'use client';

import {
	Box,
	Drawer,
	List,
	Typography,
	useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo/Logo';
import { Navbar } from '@/components/Navbar/Navbar';
import { MantisHeader } from '@/components/layout/MantisHeader';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageMetaProvider } from '@/contexts/PageMetaContext';
import { flattenNavLinks } from '@/helper/flatten-nav-links';
import { NavItem } from '@/types/nav-item';
import { DRAWER_WIDTH, DRAWER_WIDTH_MINI, HEADER_HEIGHT } from '@/styles/muiTheme';
import { transition } from '@/styles/motion';

interface MainLayoutProps {
	children: React.ReactNode;
	navData: NavItem[];
	drawerOpen: boolean;
	onToggleDrawer: () => void;
}

export function MainLayout({ children, navData, drawerOpen, onToggleDrawer }: MainLayoutProps) {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const mini = !drawerOpen && !isMobile;
	const width = mini ? DRAWER_WIDTH_MINI : DRAWER_WIDTH;
	const rewardsNotificationsEnabled = useMemo(
		() => flattenNavLinks(navData).some(o => o.link === '/dashboard/rewards'),
		[navData],
	);

	const drawerContent = (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
			<Box
				sx={{
					px: mini ? 1 : 2.5,
					py: 2,
					minHeight: HEADER_HEIGHT,
					display: 'flex',
					alignItems: 'center',
					justifyContent: mini ? 'center' : 'flex-start',
				}}
			>
				<Logo compact={mini} />
			</Box>
			<Box sx={{ flex: 1, overflow: 'auto' }}>
				<Navbar data={navData} toggle={onToggleDrawer} mini={mini} showUser={false} />
			</Box>
			{!mini && (
				<Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
					<Typography variant="caption" color="text.secondary">
						Kabbik CRM v1.0
					</Typography>
				</Box>
			)}
		</Box>
	);

	return (
		<PageMetaProvider>
			<Box
				sx={{
					display: 'flex',
					minHeight: '100vh',
					bgcolor: 'background.default',
					width: '100%',
					maxWidth: '100%',
					overflowX: 'hidden',
				}}
			>
				<Box
					component={motion.nav}
					animate={{ width }}
					transition={transition.normal}
					sx={{
						width: { md: width },
						flexShrink: 0,
						display: { xs: drawerOpen ? 'block' : 'none', md: 'block' },
					}}
				>
					<Drawer
						variant={isMobile ? 'temporary' : 'permanent'}
						open={isMobile ? drawerOpen : true}
						onClose={onToggleDrawer}
						ModalProps={{ keepMounted: true }}
						sx={{
							'& .MuiDrawer-paper': {
								width,
								boxSizing: 'border-box',
								transition: theme.transitions.create('width', {
									easing: theme.transitions.easing.easeInOut,
									duration: theme.transitions.duration.short,
								}),
								overflowX: 'hidden',
								top: 0,
								height: '100%',
							},
						}}
					>
						{drawerContent}
					</Drawer>
				</Box>

				<Box
					component="main"
					sx={{
						flexGrow: 1,
						flex: '1 1 0',
						minWidth: 0,
						maxWidth: '100%',
						width: { md: `calc(100% - ${width}px)` },
						minHeight: '100vh',
						display: 'flex',
						flexDirection: 'column',
						overflowX: 'hidden',
					}}
				>
					<Box
						component="header"
						sx={{
							position: 'sticky',
							top: 0,
							zIndex: theme.zIndex.appBar,
							bgcolor: 'background.paper',
							borderBottom: 1,
							borderColor: 'divider',
						}}
					>
						<MantisHeader
							navData={navData}
							rewardsNotificationsEnabled={rewardsNotificationsEnabled}
							onToggleDrawer={onToggleDrawer}
						/>
					</Box>
					<Box
						sx={{
							flex: 1,
							p: { xs: 1.5, sm: 2, md: 3 },
							minWidth: 0,
							maxWidth: '100%',
							overflowX: 'hidden',
						}}
					>
						<PageTransition>{children}</PageTransition>
					</Box>
				</Box>
			</Box>
		</PageMetaProvider>
	);
}
