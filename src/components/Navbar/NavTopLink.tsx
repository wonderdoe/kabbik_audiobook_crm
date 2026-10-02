'use client';

import { Box, IconButton, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { NavItem } from '@/types/nav-item';
import { navMiniIconSx, navMiniItemWrapSx } from './navRowStyles';

interface NavTopLinkProps {
	item: NavItem;
	mini: boolean;
	toggle: () => void;
}

export function NavTopLink({ item, mini, toggle }: NavTopLinkProps) {
	const pathname = usePathname();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const selected = item.link === pathname;
	const Icon = item.icon;

	const onNavClick = () => {
		if (isMobile) toggle();
	};

	if (mini) {
		return (
			<Box sx={navMiniItemWrapSx}>
				<Tooltip title={item.label} placement="right" arrow>
					<IconButton
						component={Link}
						href={item.link!}
						onClick={onNavClick}
						aria-label={item.label}
						aria-current={selected ? 'page' : undefined}
						sx={navMiniIconSx(selected)}
					>
						<Icon size={20} stroke={1.75} />
					</IconButton>
				</Tooltip>
			</Box>
		);
	}

	return (
		<ListItemButton component={Link} href={item.link!} selected={selected} onClick={onNavClick}>
			<ListItemIcon sx={{ minWidth: 36 }}>
				<Icon size={18} stroke={1.75} className="nav-row-icon" />
			</ListItemIcon>
			<ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
		</ListItemButton>
	);
}
