'use client';

import {
	Box,
	Card,
	CardContent,
	Typography,
	alpha,
	useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { StatCardValue } from '@/components/ui/StatCardValue';
import { fadeInUp, transition } from '@/styles/motion';
import { cardShadow } from '@/styles/cardShadow';

type StatCardProps = {
	title: string;
	value: ReactNode;
	icon?: ReactNode;
	accent?: 'primary' | 'success' | 'warning' | 'info';
	index?: number;
};

const accentMap = {
	primary: 'primary.main',
	success: 'success.main',
	warning: 'warning.main',
	info: 'info.main',
} as const;

export function StatCard({ title, value, icon, accent = 'primary', index = 0 }: StatCardProps) {
	const theme = useTheme();
	const color = theme.palette[accent]?.main ?? theme.palette.primary.main;

	return (
		<Card
			component={motion.div}
			initial={fadeInUp.initial}
			animate={fadeInUp.animate}
			transition={{ ...transition.normal, delay: index * 0.05 }}
			whileHover={{ y: -1, boxShadow: cardShadow.hover }}
			elevation={0}
			sx={{
				height: '100%',
				borderRadius: 1,
				border: `1px solid ${alpha(theme.palette.divider, 1)}`,
				boxShadow: cardShadow.rest,
				overflow: 'hidden',
			}}
		>
			<CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
				<Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
					<Box sx={{ minWidth: 0, flex: 1 }}>
						<Typography
							variant="caption"
							component="p"
							sx={{
								color: 'text.secondary',
								fontWeight: 600,
								textTransform: 'uppercase',
								letterSpacing: '0.06em',
								lineHeight: 1.4,
								mb: 1,
							}}
						>
							{title}
						</Typography>
						<Typography
							variant="h5"
							component="p"
							sx={{
								fontWeight: 700,
								color: 'text.primary',
								lineHeight: 1.2,
								wordBreak: 'break-word',
							}}
						>
							<StatCardValue value={value} />
						</Typography>
					</Box>
					{icon ? (
						<Box
							sx={{
								width: 44,
								height: 44,
								borderRadius: 1,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								flexShrink: 0,
								bgcolor: alpha(color, 0.12),
								color,
							}}
						>
							{icon}
						</Box>
					) : null}
				</Box>
			</CardContent>
		</Card>
	);
}

type ChartSectionProps = {
	title: string;
	children: ReactNode;
};

export function ChartSectionCard({ title, children }: ChartSectionProps) {
	const theme = useTheme();

	return (
		<Card
			elevation={0}
			sx={{
				borderRadius: 1,
				border: `1px solid ${alpha(theme.palette.divider, 1)}`,
				boxShadow: cardShadow.rest,
				overflow: 'hidden',
			}}
		>
			<CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
				<Typography
					variant="subtitle2"
					sx={{
						fontWeight: 700,
						textTransform: 'uppercase',
						letterSpacing: '0.05em',
						color: 'text.secondary',
						mb: 2,
					}}
				>
					{title}
				</Typography>
				{children}
			</CardContent>
		</Card>
	);
}
