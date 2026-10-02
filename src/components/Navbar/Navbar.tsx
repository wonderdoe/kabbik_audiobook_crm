'use client';

import { Box, List, Stack, Typography } from '@mui/material';
import { NavItem } from '@/types/nav-item';
import { NavTopLink } from './NavTopLink';
import { NavTreeGroup } from './NavTreeGroup';
import { NavMiniFlyout } from './NavMiniFlyout';
import { navMiniRailSx } from './navRowStyles';

interface Props {
	data: NavItem[];
	hidden?: boolean;
	toggle: () => void;
	mini?: boolean;
	showUser?: boolean;
}

function hasChildren(item: NavItem): boolean {
	return Array.isArray(item.links) && item.links.length > 0;
}

export function Navbar({ data, toggle, mini = false }: Props) {
	if (mini) {
		return (
			<Stack sx={navMiniRailSx}>
				{data.map(item => {
					if (hasChildren(item)) {
						return <NavMiniFlyout key={item.label} item={item} toggle={toggle} />;
					}
					if (item.link) {
						return <NavTopLink key={item.label} item={item} mini toggle={toggle} />;
					}
					return null;
				})}
			</Stack>
		);
	}

	return (
		<Box sx={{ px: 1, pb: 1 }}>
			<Typography
				variant="overline"
				sx={{ px: 1.5, pt: 0.5, pb: 1, display: 'block', color: 'text.secondary', letterSpacing: 1 }}
			>
				Navigation
			</Typography>
			{data.map(item => {
				if (hasChildren(item)) {
					return <NavTreeGroup key={item.label} group={item} toggle={toggle} />;
				}
				if (item.link) {
					return (
						<List key={item.label} disablePadding dense>
							<NavTopLink item={item} mini={false} toggle={toggle} />
						</List>
					);
				}
				return null;
			})}
		</Box>
	);
}
