'use client';

import {
	Avatar,
	Box,
	Stack,
	Typography,
	alpha,
	useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type AnalyticCardProps = {
	title: string;
	count: ReactNode;
	icon: ReactNode;
	color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
	extra?: ReactNode;
};

const colorKey = {
	primary: 'primary',
	success: 'success',
	warning: 'warning',
	error: 'error',
	info: 'primary',
} as const;

export function AnalyticCard({ title, count, icon, color = 'primary', extra }: AnalyticCardProps) {
	const theme = useTheme();
	const paletteKey = colorKey[color];
	const main = theme.palette[paletteKey].main;
	const light = alpha(main, 0.1);

	return (
		<Box
			component={motion.div}
			whileHover={{ y: -3, boxShadow: `0 8px 24px ${alpha(main, 0.14)}` }}
			transition={{ duration: 0.18 }}
			sx={{
				p: 2.5,
				borderRadius: 2,
				border: `1px solid ${theme.palette.divider}`,
				bgcolor: 'background.paper',
				height: '100%',
				overflow: 'hidden',
				position: 'relative',
				cursor: 'default',
				boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
				'&::before': {
					content: '""',
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					height: 3,
					bgcolor: main,
					borderRadius: '8px 8px 0 0',
					opacity: 0.85,
				},
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
				<Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
					<Typography
						variant="caption"
						sx={{
							color: 'text.secondary',
							fontWeight: 600,
							textTransform: 'uppercase',
							letterSpacing: '0.06em',
							lineHeight: 1.4,
						}}
					>
						{title}
					</Typography>
					<Typography variant="h4" fontWeight={800} lineHeight={1.15} color="text.primary">
						{count}
					</Typography>
				</Stack>
				<Avatar
					variant="rounded"
					sx={{
						width: 46,
						height: 46,
						bgcolor: light,
						color: main,
						borderRadius: 2,
						flexShrink: 0,
						boxShadow: `0 0 0 1px ${alpha(main, 0.18)}`,
					}}
				>
					{icon}
				</Avatar>
			</Box>
			{extra ? <Box sx={{ mt: 1.5 }}>{extra}</Box> : null}
		</Box>
	);
}
