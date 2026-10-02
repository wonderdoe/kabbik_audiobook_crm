'use client';

import {
	Box,
	Button,
	TextField,
	Typography,
} from '@mui/material';
import classes from './EmailSection.module.css';

export function EmailSection() {
	return (
		<div className={classes.wrapper}>
			<div className={classes.body}>
				<Typography variant="h6" component="h3" className={classes.title}>
					Wait a minute...
				</Typography>
				<Typography fontWeight={500} fontSize="md" mb={5}>
					Subscribe to our newsletter!
				</Typography>
				<Typography fontSize="sm" color="text.secondary">
					You will never miss important product updates, latest news and community QA sessions. Our
					newsletter is once a week, every Sunday.
				</Typography>

				<div className={classes.controls}>
					<TextField
						placeholder="Your email"
					/>
					<Button className={classes.control}>Subscribe</Button>
				</div>
			</div>
			<Box component="img" src="/static/images/img-email.svg" className={classes.image} alt="email" />
		</div>
	);
}
