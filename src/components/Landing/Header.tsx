'use client';

import {
	Box,
	Button,
	Drawer,
	IconButton,
	Menu,
	MenuItem,
	Stack,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useDisclosure } from '@/hooks/use-disclosure';
import { IconChevronDown } from '@tabler/icons-react';
import { Logo } from '@/components/Logo/Logo';
import classes from './Header.module.css';
import { useState } from 'react';

interface HeaderActionProps {
	links: { link: string; label: string; links?: { link: string; label: string }[] }[];
}

export function Header({ links }: HeaderActionProps) {
	const [opened, { toggle, close }] = useDisclosure(false);
	const [menuAnchors, setMenuAnchors] = useState<Record<string, HTMLElement | null>>({});

	const items = links.map(link => {
		if (link.links?.length) {
			return (
				<Box key={link.label} component="span">
					<Button
						className={classes.link}
						endIcon={<IconChevronDown size={16} stroke={1.5} />}
						onClick={e => setMenuAnchors(a => ({ ...a, [link.label]: e.currentTarget }))}
					>
						{link.label}
					</Button>
					<Menu
						anchorEl={menuAnchors[link.label]}
						open={Boolean(menuAnchors[link.label])}
						onClose={() => setMenuAnchors(a => ({ ...a, [link.label]: null }))}
					>
						{link.links.map(item => (
							<MenuItem key={item.link} component="a" href={item.link}>
								{item.label}
							</MenuItem>
						))}
					</Menu>
				</Box>
			);
		}

		return (
			<a key={link.label} href={link.link} className={classes.link} onClick={event => event.preventDefault()}>
				{link.label}
			</a>
		);
	});

	return (
		<header className={classes.header}>
			<Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" className={classes.inner}>
				<Stack direction="row" alignItems="center">
					<IconButton onClick={toggle} className={classes.burger} size="small">
						<MenuIcon />
					</IconButton>
					<Logo />
				</Stack>
				<Stack direction="row" alignItems="center" spacing={1} className={classes.links}>
					{items}
				</Stack>
				<Button sx={{ borderRadius: 8, height: 30 }}>Try it now</Button>

				<Drawer anchor="right" open={opened} onClose={close}>
					<Stack spacing={2} sx={{ p: 3, pt: 4 }}>
						{items}
					</Stack>
				</Drawer>
			</Stack>
		</header>
	);
}
