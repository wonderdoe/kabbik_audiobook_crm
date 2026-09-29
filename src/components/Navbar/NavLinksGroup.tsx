'use client';

import {
	Box,
	Collapse,
	em,
	Group,
	ThemeIcon,
	UnstyledButton,
	useDirection,
	useMantineColorScheme,
} from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import classes from './NavLinksGroup.module.css';
import { useMediaQuery } from '@mantine/hooks';

interface LinksGroupProps {
	icon: React.FC<any>;
	label: string;
	link?: string;
	initiallyOpened?: boolean;
	links?: { label: string; link: string }[];
	toggle: () => void;
}

export function NavLinksGroup({
	icon: Icon,
	label,
	link,
	initiallyOpened,
	links,
	toggle,
}: LinksGroupProps) {
	const pathname = usePathname();
	const { dir } = useDirection();
	const { colorScheme } = useMantineColorScheme();
	const isLightTheme = colorScheme === 'light';
	const hasLinks = Array.isArray(links);
	const [opened, setOpened] = useState(initiallyOpened || false);
	const ChevronIcon = dir === 'ltr' ? IconChevronRight : IconChevronLeft;
	const isMobile = useMediaQuery(`(max-width: ${em(750)})`);

	const items = (hasLinks ? links : []).map(link => {
		return (
			<Link
				href={link.link}
				key={link.label}
				className={`${classes.link}`}
				style={{
					color:
						link.link === pathname ? 'var(--mantine-color-white)' : 'var(--mantine-color-text)',
					background:
						link.link === pathname
							? 'var(--mantine-primary-color-filled)'
							: 'var(--mantine-color-body)',
					borderTopLeftRadius: '10px',
					borderBottomLeftRadius: '10px',
				}}
				onClick={isMobile ? toggle : () => {}}
			>
				{link.label}
			</Link>
		);
	});

	return (
		<>
			{link ? (
				<Link
					href={link}
					className={`${classes.control}`}
					style={{
						background:
							link === pathname
								? isLightTheme
									? 'var(--mantine-color-gray-2)'
									: 'var(--mantine-color-gray-7)'
								: 'var(--mantine-color-body)',
					}}
				>
					<Group gap={0} justify="space-between">
						<Box style={{ display: 'flex', alignItems: 'center' }}>
							<ThemeIcon variant="light" size={30}>
								<Icon size="1.1rem" />
							</ThemeIcon>
							<Box ml="md">{label}</Box>
						</Box>
					</Group>
				</Link>
			) : (
				<UnstyledButton
					onClick={() => {
						if (hasLinks) {
							setOpened(o => !o);
							return;
						}
					}}
					className={classes.control}
					style={{
						color: isLightTheme ? 'var(--mantine-colors-white)' : 'var(--mantine-colors-black)',
					}}
				>
					<Group gap={0} justify="space-between">
						<Box style={{ display: 'flex', alignItems: 'center' }}>
							<ThemeIcon variant="light" size={30}>
								<Icon size="1.1rem" />
							</ThemeIcon>
							<Box ml="md">{label}</Box>
						</Box>
						{hasLinks && (
							<ChevronIcon
								className={classes.chevron}
								size="1rem"
								stroke={1.5}
								style={{
									transform: opened ? `rotate(${dir === 'rtl' ? -90 : 90}deg)` : 'none',
								}}
							/>
						)}
					</Group>
				</UnstyledButton>
			)}
			{hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
		</>
	);
}
