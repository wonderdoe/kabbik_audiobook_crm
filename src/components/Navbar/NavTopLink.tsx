'use client';

import { Box, IconButton, ListItemButton, Tooltip } from '@mui/material';
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
		<ListItemButton
			component={Link}
			href={item.link!}
			selected={selected}
			onClick={onNavClick}
			sx={{ gap: 1, py: 0.35, px: 0.5 }}
		>
			<Box component="span" className="nav-row-icon" sx={{ display: 'flex', flexShrink: 0, color: 'inherit' }}>
				<Icon size={18} stroke={1.75} />
			</Box>
			<Box component="span" sx={{ fontSize: 14, fontWeight: 500 }}>
				{item.label}
			</Box>
		</ListItemButton>
	);
}
