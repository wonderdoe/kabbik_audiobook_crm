'use client';

import {
	Box,
	List,
} from '@mui/material';
import { NavItem } from '@/types/nav-item';
import { NavLinksGroup } from './NavLinksGroup';

interface Props {
	data: NavItem[];
	hidden?: boolean;
	toggle: () => void;
	mini?: boolean;
	showUser?: boolean;
}

export function Navbar({ data, toggle, mini = false }: Props) {
	const links = data.map(item => (
		<NavLinksGroup key={item.label} {...item} toggle={toggle} mini={mini} />
	));

	return (
		<Box sx={{ px: 0.5, pb: 1 }}>
			<List disablePadding>{links}</List>
		</Box>
	);
}
