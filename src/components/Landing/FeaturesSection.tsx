'use client';

import {
	Avatar,
	Box,
	Container,
	Grid,
	Paper,
	Typography,
} from '@mui/material';
import {
	IconBrandMantine,
	IconBrandNextjs,
	IconBrandOauth,
	IconBrandPlanetscale,
	IconBrandReact,
} from '@tabler/icons-react';
import classes from './FeatureSection.module.css';

export const featuresData = [
	{
		icon: IconBrandNextjs,
		title: 'Next.js',
		description: 'App dir, Routing, Layouts, Loading UI and API routes.',
	},
	{
		icon: IconBrandReact,
		title: 'React 18',
		description: 'Server and Client Components. Use hook.',
	},
	{
		icon: IconBrandPlanetscale,
		title: 'Database',
		description: 'ORM using Prisma and deployed on PlanetScale.',
	},
	{
		icon: IconBrandMantine,
		title: 'Components',
		description: 'UI components built using Mantine UI.',
	},
	{
		icon: IconBrandOauth,
		title: 'Authentication',
		description: 'Authentication using NextAuth.js and middlewares.',
	},
];

interface FeatureProps {
	icon: React.FC<any>;
	title: React.ReactNode;
	description: React.ReactNode;
}

export function Feature({ icon: Icon, title, description }: FeatureProps) {
	return (
		<Paper h="100%" elevation={3} px="lg" sx={{ borderRadius: 2 }} variant="outlined">
			<ThemeIcon variant="outlined" size={60} radius={60}>
				<Icon size="2rem" stroke={1.5} />
			</ThemeIcon>
			<Typography mb={7} fontWeight="600">
				{title}
			</Typography>
			<Typography variant="body2" color="text.secondary" style={{ lineHeight: 1.6 }}>
				{description}
			</Typography>
		</Paper>
	);
}

interface FeaturesGridProps {
	title: React.ReactNode;
	description: React.ReactNode;
	data?: FeatureProps[];
}

export function FeaturesSection({ title, description, data = featuresData }: FeaturesGridProps) {
	const features = data.map((feature, index) => <Feature {...feature} key={index} />);

	return (
		<Container className={classes.wrapper}>
			<Typography className={classes.title} component="h2" variant="h4">{title}</Typography>
			<Box sx={{ height: 16 }} />

			<Container size={560} p={0}>
				<Typography variant="body2" className={classes.description}>
					{description}
				</Typography>
			</Container>

			<Grid container
				mt={60}
				cols={{ base: 1, sm: 2, lg: 3 }}
				spacing={{ base: 'lg', md: 'lg', lg: 'xl' }}
			>
				{features}
			</Grid>
		</Container>
	);
}
