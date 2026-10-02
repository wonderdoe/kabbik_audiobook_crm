'use client';

import {
	Box,
	Collapse,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
} from '@mui/material';
import Link from 'next/link';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { NavItem } from '@/types/nav-item';

interface NavLinksGroupProps extends NavItem {
	toggle: () => void;
	mini?: boolean;
}

export function NavLinksGroup({
	icon: Icon,
	label,
	link,
	initiallyOpened,
	links,
	toggle,
	mini = false,
}: NavLinksGroupProps) {
	const pathname = usePathname();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const hasLinks = Array.isArray(links) && links.length > 0;
	const [opened, setOpened] = useState(initiallyOpened || false);
	const childActive = hasLinks && links.some(l => l.link === pathname);
	const selfActive = link === pathname;

	const onNavClick = () => {
		if (isMobile) toggle();
	};

	if (link && !hasLinks) {
		return (
			<ListItemButton component={Link} href={link} selected={selfActive} onClick={onNavClick}>
				<ListItemIcon sx={{ minWidth: 36 }}>
					<Icon size={18} stroke={1.75} />
				</ListItemIcon>
				{!mini && <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14 }} />}
			</ListItemButton>
		);
	}

	const items = (links ?? []).map(item => {
		const selected = item.link === pathname;
		return (
			<ListItemButton
				key={item.label}
				component={Link}
				href={item.link}
				selected={selected}
				onClick={onNavClick}
				sx={{ pl: mini ? 1.5 : 4.5, py: 0.75 }}
			>
				{!mini && (
					<ListItemText
						primary={item.label}
						primaryTypographyProps={{ fontSize: 13, fontWeight: selected ? 600 : 400 }}
					/>
				)}
			</ListItemButton>
		);
	});

	return (
		<Box sx={{ mb: 0.5 }}>
			<ListItemButton
				onClick={() => hasLinks && setOpened(o => !o)}
				selected={childActive && !opened}
				sx={{ py: 0.75 }}
			>
				<ListItemIcon sx={{ minWidth: 36 }}>
					<Icon size={18} stroke={1.75} />
				</ListItemIcon>
				{!mini && (
					<>
						<ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
						{hasLinks && (
							<ChevronRight
								sx={{
									fontSize: 18,
									color: 'text.secondary',
									transform: opened ? 'rotate(90deg)' : 'none',
									transition: 'transform 0.2s',
								}}
							/>
						)}
					</>
				)}
			</ListItemButton>
			{hasLinks && !mini && (
				<Collapse in={opened} timeout={200}>
					<List disablePadding dense>
						{items}
					</List>
				</Collapse>
			)}
		</Box>
	);
}
