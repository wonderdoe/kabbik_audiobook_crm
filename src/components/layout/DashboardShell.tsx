'use client';

import {
	AppBar,
	Box,
	Drawer,
	IconButton,
	Stack,
	Toolbar,
	Typography,
	useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Logo } from '@/components/Logo/Logo';
import { Navbar } from '@/components/Navbar/Navbar';
import { AdminHeader } from '@/components/Headers/AdminHeader';
import { PageTransition } from '@/components/layout/PageTransition';
import { NavItem } from '@/types/nav-item';
import { DRAWER_WIDTH, DRAWER_WIDTH_MINI } from '@/styles/muiTheme';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { transition } from '@/styles/motion';

interface DashboardShellProps {
	children: React.ReactNode;
	navData: NavItem[];
	drawerOpen: boolean;
	onToggleDrawer: () => void;
}

export function DashboardShell({
	children,
	navData,
	drawerOpen,
	onToggleDrawer,
}: DashboardShellProps) {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const mini = !drawerOpen && !isMobile;
	const width = mini ? DRAWER_WIDTH_MINI : DRAWER_WIDTH;

	const drawer = (
		<Box sx={{ overflow: 'hidden', height: '100%' }}>
			<Box sx={{ px: mini ? 1 : 2, py: 2, minHeight: 64, display: 'flex', alignItems: 'center' }}>
				<Logo compact={mini} />
			</Box>
			<Navbar data={navData} toggle={onToggleDrawer} mini={mini} />
		</Box>
	);

	return (
		<Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
			<AppBar
				position="fixed"
				elevation={0}
				sx={{
					width: { sm: `calc(100% - ${width}px)` },
					ml: { sm: `${width}px` },
					transition: theme.transitions.create(['width', 'margin'], {
						easing: theme.transitions.easing.easeInOut,
						duration: theme.transitions.duration.short,
					}),
				}}
			>
				<AdminHeader
					burger={
						<IconButton color="inherit" edge="start" onClick={onToggleDrawer} sx={{ mr: 1 }}>
							<MenuIcon />
						</IconButton>
					}
				/>
			</AppBar>

			<Box
				component={motion.nav}
				animate={{ width }}
				transition={transition.normal}
				sx={{
					width: { sm: width },
					flexShrink: { sm: 0 },
					display: { xs: drawerOpen ? 'block' : 'none', sm: 'block' },
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
						},
					}}
				>
					{drawer}
				</Drawer>
			</Box>

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					width: { sm: `calc(100% - ${width}px)` },
					minHeight: '100vh',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<Toolbar />
				<Box sx={{ flex: 1, p: { xs: 2, md: 3 }, pb: 6 }}>
					<PageTransition>{children}</PageTransition>
				</Box>
				<Box
					component="footer"
					sx={{
						py: 1.5,
						textAlign: 'center',
						borderTop: 1,
						borderColor: 'divider',
						bgcolor: 'background.paper',
					}}
				>
					<Typography variant="caption" color="text.secondary">
						CopyRight © Kabbik Audiobook
					</Typography>
				</Box>
			</Box>
		</Box>
	);
}
