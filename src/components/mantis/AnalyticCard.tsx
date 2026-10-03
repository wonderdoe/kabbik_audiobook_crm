'use client';

import {
	Box,
	Stack,
	Typography,
	alpha,
	useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { StatCardValue } from '@/components/ui/StatCardValue';
import { cardShadow } from '@/styles/cardShadow';

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
			whileHover={{ y: -2, boxShadow: `0 6px 16px ${alpha(main, 0.1)}` }}
			transition={{ duration: 0.18 }}
			sx={{
				pl: 0,
				borderRadius: 1,
				border: `1px solid ${theme.palette.divider}`,
				bgcolor: 'background.paper',
				height: '100%',
				overflow: 'hidden',
				position: 'relative',
				cursor: 'default',
				boxShadow: cardShadow.rest,
				transition: 'box-shadow 0.2s, transform 0.2s',
				/* left accent bar */
				'&::before': {
					content: '""',
					position: 'absolute',
					left: 0,
					top: 0,
					bottom: 0,
					width: 4,
					background: `linear-gradient(180deg, ${main}, ${alpha(main, 0.45)})`,
				},
			}}
		>
			<Box sx={{ pl: 2.5, pr: 2.5, pt: 2, pb: 2 }}>
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
								display: 'block',
							}}
						>
							{title}
						</Typography>
						<Typography
							variant="h4"
							fontWeight={800}
							lineHeight={1.15}
							color="text.primary"
							sx={{ fontSize: { xs: '1.125rem', sm: '1.35rem', md: '1.5rem' } }}
						>
							<StatCardValue value={count} />
						</Typography>
					</Stack>
					<Box
						sx={{
							width: 46,
							height: 46,
							bgcolor: light,
							color: main,
							borderRadius: 1,
							flexShrink: 0,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow: `0 0 0 1px ${alpha(main, 0.15)}`,
						}}
					>
						{icon}
					</Box>
				</Box>
				{extra ? <Box sx={{ mt: 1.5 }}>{extra}</Box> : null}
			</Box>
		</Box>
	);
}
