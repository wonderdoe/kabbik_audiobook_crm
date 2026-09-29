'use client';
import { ScrollArea } from '@mantine/core';
import { useEffect, useState } from 'react';
import { UserButton } from '@/components/UserButton/UserButton';
import { NavItem } from '@/types/nav-item';
import classes from './Navbar.module.css';
import { NavLinksGroup } from './NavLinksGroup';

interface Props {
	data: NavItem[];
	hidden?: boolean;
	toggle: () => void;
}

export function Navbar({ data, toggle }: Props) {
	const [locallyStored, setLocallyStored] = useState({ name: '', email: '' });
	const links = data.map(item => <NavLinksGroup key={item.label} {...item} toggle={toggle} />);

	useEffect(() => {
		setLocallyStored({
			name: localStorage.getItem('name') as string,
			email: localStorage.getItem('email') as string,
		});
	}, []);

	return (
		<>
			<ScrollArea className={classes.links}>
				<div className={classes.linksInner}>{links}</div>
			</ScrollArea>
			<div className={classes.footer}>
				<UserButton
					image=""
					name={locallyStored.name}
					email={locallyStored.email}
					// image="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80"
					// name="Harriette"
					// email="hspoon@outlook.com"
				/>
			</div>
		</>
	);
}
