'use client';

import {
	Container,
	IconButton,
	Link,
	Stack,
	Typography,
} from '@mui/material';
import { IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from '@tabler/icons-react';
import classes from './Footer.module.css';

export function Footer() {
	return (
		<div className={classes.footer}>
			<Container className={classes.inner}>
				<Typography color="text.secondary" fontSize="sm">
					Build by{' '}
					<Anchor href="https://github.com/jotyy" variant="body2">
						jotyy
					</Anchor>
					. Hosted on{' '}
					<Anchor href="https://vercel.com" variant="body2">
						Vercel
					</Anchor>
					.
				</Typography>
				<Stack direction="row" alignItems="center" spacing={0} className={classes.links} justifyContent="flex-end" wrap="nowrap">
					<IconButton variant="h6" color="gray" variant="text">
						<IconBrandTwitter size="1.05rem" stroke={1.5} />
					</IconButton>
					<IconButton variant="h6" color="gray" variant="text">
						<IconBrandYoutube size="1.05rem" stroke={1.5} />
					</IconButton>
					<IconButton variant="h6" color="gray" variant="text">
						<IconBrandInstagram size="1.05rem" stroke={1.5} />
					</IconButton>
				</Stack>
			</Container>
		</div>
	);
}
