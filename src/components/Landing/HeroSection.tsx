'use client';

import {
	Button,
	Container,
	Stack,
	Typography,
} from '@mui/material';
import { IconArrowRight, IconStar } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import classes from './HeroSection.module.css';

export function HeroSection() {
	const router = useRouter();

	return (
		<Container sx={{ pt: 1 }}>
			<div className={classes.inner}>
				<Typography className={classes.title} component="h1" variant="h2">
					Kabbik CRM
				</Typography>
				<Typography className={classes.subtitle} component="h2" variant="h5">
					Audiobook operations dashboard on Next.js and MUI
				</Typography>

				<Typography className={classes.description} mt={30}>
					Manage users, content, subscriptions, and reports from one admin workspace built for the
					Kabbik Audiobook platform.
				</Typography>

				<Stack direction="row" alignItems="center" mt={40}>
					<Button
						variant="h6"
						className={classes.control}
						onClick={() => {
							router.push('/dashboard');
						}}
						endIcon={<IconArrowRight />}
					>
						Get started
					</Button>
					<Button
						variant="outlined"
						variant="h6"
						className={classes.control}
						onClick={() => {
							// open github
							window.open('https://www.kabbik.com');
						}}
						endIcon={<IconStar />}
					>
						Give a Star
					</Button>
				</Stack>
			</div>
		</Container>
	);
}
