'use client';

import { Box, Card, Skeleton, Stack, Typography, alpha, useTheme } from '@mui/material';
import type { ReactNode } from 'react';

export type StatCardColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

type StatCardProps = {
	title: string;
	value: ReactNode;
	icon?: ReactNode;
	color?: StatCardColor;
	loading?: boolean;
	subtitle?: string;
};

export function StatCard({ title, value, icon, color = 'primary', loading, subtitle }: StatCardProps) {
	const theme = useTheme();
	const palette = theme.palette[color];

	return (
		<Card
			variant="outlined"
			sx={{
				position: 'relative',
				overflow: 'hidden',
				borderRadius: 2,
				pl: 0,
				transition: 'box-shadow 0.2s, transform 0.2s',
				'&:hover': {
					boxShadow: `0 8px 24px ${alpha(palette.main, 0.12)}`,
					transform: 'translateY(-2px)',
				},
				'&::before': {
					content: '""',
					position: 'absolute',
					left: 0,
					top: 0,
					bottom: 0,
					width: 4,
					background: `linear-gradient(180deg, ${palette.main}, ${alpha(palette.main, 0.5)})`,
				},
			}}
		>
			<Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ p: 2, pl: 2.5 }}>
				<Box sx={{ minWidth: 0 }}>
					<Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
						{title}
					</Typography>
					{loading ? (
						<Skeleton width={80} height={36} sx={{ mt: 0.5 }} />
					) : (
						<Typography variant="h5" fontWeight={800} sx={{ mt: 0.5, lineHeight: 1.2 }}>
							{value}
						</Typography>
					)}
					{subtitle && !loading ? (
						<Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
							{subtitle}
						</Typography>
					) : null}
				</Box>
				{icon ? (
					<Box
						sx={{
							width: 44,
							height: 44,
							borderRadius: 2,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexShrink: 0,
							bgcolor: alpha(palette.main, 0.1),
							color: palette.main,
						}}
					>
						{icon}
					</Box>
				) : null}
			</Stack>
		</Card>
	);
}
