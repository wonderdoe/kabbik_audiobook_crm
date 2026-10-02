'use client';

import {
	Avatar,
	Badge,
	Box,
	Divider,
	IconButton,
	InputAdornment,
	Menu,
	MenuItem,
	Popover,
	TextField,
	Toolbar,
	Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { MantisBreadcrumbs } from '@/components/mantis/Breadcrumbs';
import { usePageMeta } from '@/contexts/PageMetaContext';
import { HEADER_HEIGHT } from '@/styles/muiTheme';

type Props = {
	onToggleDrawer: () => void;
	burger?: React.ReactNode;
};

export function MantisHeader({ onToggleDrawer, burger }: Props) {
	const { meta } = usePageMeta();
	const router = useRouter();
	const [anchorProfile, setAnchorProfile] = useState<null | HTMLElement>(null);
	const [anchorNotif, setAnchorNotif] = useState<null | HTMLElement>(null);
	const [user, setUser] = useState({ name: '', email: '' });

	useEffect(() => {
		setUser({
			name: localStorage.getItem('name') || 'Admin',
			email: localStorage.getItem('email') || '',
		});
	}, []);

	const logout = () => {
		Cookies.remove('admin_token');
		localStorage.removeItem('id');
		localStorage.removeItem('name');
		localStorage.removeItem('email');
		router.push('/login');
	};

	return (
		<Toolbar
			sx={{
				minHeight: `${HEADER_HEIGHT}px !important`,
				px: { xs: 1.5, md: 2.5 },
				gap: 1,
			}}
		>
			{burger ?? (
				<IconButton edge="start" onClick={onToggleDrawer} aria-label="open drawer">
					<MenuIcon />
				</IconButton>
			)}
			<Box sx={{ flex: 1, minWidth: 0, display: { xs: 'none', md: 'block' } }}>
				{meta.breadcrumbs.length > 0 && <MantisBreadcrumbs items={meta.breadcrumbs} />}
			</Box>
			<Box sx={{ flex: 1, display: { xs: 'block', md: 'none' } }}>
				<Typography variant="subtitle1" fontWeight={600} noWrap>
					{meta.title ?? 'Kabbik CRM'}
				</Typography>
			</Box>
			<TextField
				placeholder="Search…"
				size="small"
				sx={{
					width: { xs: 0, sm: 0, md: 220, lg: 280 },
					display: { xs: 'none', md: 'block' },
					'& .MuiOutlinedInput-root': { bgcolor: 'grey.100', borderRadius: 1 },
				}}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<SearchOutlinedIcon fontSize="small" color="action" />
						</InputAdornment>
					),
				}}
			/>
			<IconButton onClick={e => setAnchorNotif(e.currentTarget)} aria-label="notifications">
				<Badge variant="dot" color="error" invisible>
					<NotificationsOutlinedIcon />
				</Badge>
			</IconButton>
			<Popover
				open={Boolean(anchorNotif)}
				anchorEl={anchorNotif}
				onClose={() => setAnchorNotif(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			>
				<Box sx={{ p: 2, width: 280 }}>
					<Typography variant="subtitle2" gutterBottom>
						Notifications
					</Typography>
					<Typography variant="body2" color="text.secondary">
						No notifications
					</Typography>
				</Box>
			</Popover>
			<IconButton onClick={e => setAnchorProfile(e.currentTarget)} sx={{ p: 0.5 }}>
				<Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
					{user.name.charAt(0).toUpperCase()}
				</Avatar>
			</IconButton>
			<Menu
				anchorEl={anchorProfile}
				open={Boolean(anchorProfile)}
				onClose={() => setAnchorProfile(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			>
				<Box sx={{ px: 2, py: 1.5, minWidth: 200 }}>
					<Typography variant="subtitle2">{user.name}</Typography>
					<Typography variant="caption" color="text.secondary">
						{user.email}
					</Typography>
				</Box>
				<Divider />
				<MenuItem
					onClick={() => {
						setAnchorProfile(null);
						logout();
					}}
				>
					Logout
				</MenuItem>
			</Menu>
		</Toolbar>
	);
}
