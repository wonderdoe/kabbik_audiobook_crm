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
					MantineAdmin
				</Typography>
				<Typography className={classes.subtitle} component="h2" variant="h5">
					A Next.js 13 Admin template build with Mantine UI
				</Typography>

				<Typography className={classes.description} mt={30}>
					Build fully functional dashboard web applications with ease – Mantine-Admin includes all
					components and hooks to cover you in any situation
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
							window.open('https://github.com/jotyy/mantine-admin');
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
