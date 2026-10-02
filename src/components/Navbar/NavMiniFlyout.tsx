'use client';

import {
	Box,
	IconButton,
	ListItemText,
	MenuItem,
	MenuList,
	Paper,
	Popover,
	Tooltip,
	Typography,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { NavItem } from '@/types/nav-item';
import { isGroupChildActive } from './nav-tree-utils';
import { navMiniIconSx, navMiniItemWrapSx } from './navRowStyles';

interface NavMiniFlyoutProps {
	item: NavItem;
	toggle: () => void;
}

export function NavMiniFlyout({ item, toggle }: NavMiniFlyoutProps) {
	const pathname = usePathname();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const anchorRef = useRef<HTMLButtonElement>(null);
	const [open, setOpen] = useState(false);
	const Icon = item.icon;
	const childActive = isGroupChildActive(item, pathname);
	const links = item.links ?? [];

	const close = useCallback(() => setOpen(false), []);

	const openFlyout = () => setOpen(true);

	const onNavigate = () => {
		close();
		if (isMobile) toggle();
	};

	return (
		<Box sx={navMiniItemWrapSx}>
			<Tooltip title={item.label} placement="right" arrow disableHoverListener={open}>
				<IconButton
					ref={anchorRef}
					onClick={openFlyout}
					onMouseEnter={() => {
						if (!isMobile) openFlyout();
					}}
					sx={navMiniIconSx(childActive)}
					aria-label={item.label}
					aria-haspopup="true"
					aria-expanded={open}
				>
					<Icon size={20} stroke={1.75} />
				</IconButton>
			</Tooltip>
			<Popover
				open={open}
				anchorEl={anchorRef.current}
				onClose={close}
				anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
				transformOrigin={{ vertical: 'center', horizontal: 'left' }}
				slotProps={{
					paper: {
						onMouseLeave: () => {
							if (!isMobile) close();
						},
						elevation: 4,
						sx: { ml: 0.5, minWidth: 200, borderRadius: 2 },
					},
				}}
			>
				<Paper sx={{ py: 0.5 }}>
					<Typography variant="overline" sx={{ px: 2, pt: 1, display: 'block', color: 'text.secondary' }}>
						{item.label}
					</Typography>
					<MenuList dense disablePadding>
						{links.map(child => {
							const selected = child.link === pathname;
							return (
								<MenuItem
									key={child.label}
									component={Link}
									href={child.link}
									selected={selected}
									onClick={onNavigate}
									sx={{ fontSize: 14, py: 1 }}
								>
									<ListItemText
										primary={child.label}
										primaryTypographyProps={{ fontWeight: selected ? 600 : 400 }}
									/>
								</MenuItem>
							);
						})}
					</MenuList>
				</Paper>
			</Popover>
		</Box>
	);
}
