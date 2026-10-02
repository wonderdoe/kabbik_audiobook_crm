'use client';

import {
	Avatar,
	Badge,
	Box,
	Divider,
	IconButton,
	Link,
	List,
	ListItemButton,
	ListItemText,
	Menu,
	MenuItem,
	Popover,
	Toolbar,
	Typography,
	useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useTheme } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { MantisBreadcrumbs } from '@/components/mantis/Breadcrumbs';
import { NavMenuSearch } from '@/components/layout/NavMenuSearch';
import { usePageMeta } from '@/contexts/PageMetaContext';
import { flattenNavLinks } from '@/helper/flatten-nav-links';
import {
	clearRewardsReadStorage,
	dispatchRewardsReadUpdated,
	markClaimIdsRead,
} from '@/helper/reward-notifications-storage';
import { useRewardNotifications } from '@/hooks/useRewardNotifications';
import { NavItem } from '@/types/nav-item';
import { HEADER_HEIGHT } from '@/styles/muiTheme';

const NOTIFICATION_LIST_CAP = 10;

function formatClaimTime(createdAt: string | null): string {
	if (!createdAt) return '';
	const d = new Date(createdAt);
	if (Number.isNaN(d.getTime())) return createdAt;
	return d.toLocaleString();
}

type Props = {
	navData: NavItem[];
	rewardsNotificationsEnabled: boolean;
	onToggleDrawer: () => void;
	burger?: React.ReactNode;
};

export function MantisHeader({ navData, rewardsNotificationsEnabled, onToggleDrawer, burger }: Props) {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const { meta } = usePageMeta();
	const router = useRouter();
	const [anchorProfile, setAnchorProfile] = useState<null | HTMLElement>(null);
	const [anchorNotif, setAnchorNotif] = useState<null | HTMLElement>(null);
	const [user, setUser] = useState({ name: '', email: '' });
	const [anchorSearch, setAnchorSearch] = useState<null | HTMLElement>(null);
	const searchOptions = useMemo(() => flattenNavLinks(navData), [navData]);
	const { unreadClaims, unreadCount } = useRewardNotifications({
		enabled: rewardsNotificationsEnabled,
	});
	const visibleNotifications = unreadClaims.slice(0, NOTIFICATION_LIST_CAP);

	useEffect(() => {
		setUser({
			name: localStorage.getItem('name') || 'Admin',
			email: localStorage.getItem('email') || '',
		});
	}, []);

	const logout = () => {
		const adminId = localStorage.getItem('id');
		clearRewardsReadStorage(adminId ?? undefined);
		Cookies.remove('admin_token');
		localStorage.removeItem('id');
		localStorage.removeItem('name');
		localStorage.removeItem('email');
		router.push('/login');
	};

	const openRewardClaim = (claimId: number) => {
		markClaimIdsRead([claimId]);
		dispatchRewardsReadUpdated();
		setAnchorNotif(null);
		router.push(`/dashboard/rewards?claimId=${claimId}`);
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
			<Box sx={{ flex: 1, minWidth: 0, display: { xs: 'block', md: 'none' } }}>
				<Typography variant="subtitle1" fontWeight={600} noWrap>
					{meta.title ?? 'Kabbik CRM'}
				</Typography>
			</Box>
			{isMobile ? (
				<>
					<IconButton
						onClick={e => setAnchorSearch(e.currentTarget)}
						aria-label="search pages"
					>
						<SearchOutlinedIcon />
					</IconButton>
					<Popover
						open={Boolean(anchorSearch)}
						anchorEl={anchorSearch}
						onClose={() => setAnchorSearch(null)}
						anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
						transformOrigin={{ vertical: 'top', horizontal: 'right' }}
					>
						<Box sx={{ p: 1.5, width: 'min(100vw - 24px, 320px)' }}>
							<NavMenuSearch
								options={searchOptions}
								fullWidth
								onNavigate={() => setAnchorSearch(null)}
							/>
						</Box>
					</Popover>
				</>
			) : (
				<NavMenuSearch options={searchOptions} />
			)}
			<IconButton onClick={e => setAnchorNotif(e.currentTarget)} aria-label="notifications">
				<Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0} max={99}>
					<NotificationsOutlinedIcon />
				</Badge>
			</IconButton>
			<Popover
				open={Boolean(anchorNotif)}
				anchorEl={anchorNotif}
				onClose={() => setAnchorNotif(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			>
				<Box sx={{ p: 2, width: 320, maxWidth: 'min(100vw - 24px, 320px)' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
						<Typography variant="subtitle2">Notifications</Typography>
						{rewardsNotificationsEnabled ? (
							<Link
								component="button"
								type="button"
								variant="caption"
								underline="hover"
								onClick={() => {
									setAnchorNotif(null);
									router.push('/dashboard/rewards');
								}}
							>
								View all
							</Link>
						) : null}
					</Box>
					{visibleNotifications.length === 0 ? (
						<Typography variant="body2" color="text.secondary">
							No new reward claims
						</Typography>
					) : (
						<List dense disablePadding sx={{ mx: -1 }}>
							{visibleNotifications.map(claim => (
								<ListItemButton key={claim.id} onClick={() => openRewardClaim(claim.id)}>
									<ListItemText
										primary={claim.displayUser}
										secondary={`${claim.displayReward} · Pending${claim.created_at ? ` · ${formatClaimTime(claim.created_at)}` : ''}`}
										primaryTypographyProps={{ variant: 'body2', noWrap: true }}
										secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
									/>
								</ListItemButton>
							))}
						</List>
					)}
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
