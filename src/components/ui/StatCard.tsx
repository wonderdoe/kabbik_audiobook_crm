'use client';

import { Box, Card, Skeleton, Stack, Typography, alpha, useTheme } from '@mui/material';
import type { ReactNode } from 'react';
import { StatCardValue } from '@/components/ui/StatCardValue';
import { cardShadow } from '@/styles/cardShadow';
import { statCardIconBoxSize, statCardPadding, statCardValueFontSize } from '@/styles/statCard';

export type StatCardColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

type StatCardProps = {
	title: string;
	value: ReactNode;
	icon?: ReactNode;
	color?: StatCardColor;
	loading?: boolean;
	subtitle?: string;
	sx?: object;
};

export function StatCard({ title, value, icon, color = 'primary', loading, subtitle, sx }: StatCardProps) {
	const theme = useTheme();
	const palette = theme.palette[color];

	return (
		<Card
			variant="outlined"
			sx={{
				position: 'relative',
				overflow: 'hidden',
				borderRadius: 1,
				pl: 0,
				height: '100%',
				width: '100%',
				minWidth: 0,
				boxShadow: cardShadow.rest,
				transition: 'box-shadow 0.2s, transform 0.2s',
				'&:hover': {
					boxShadow: `0 2px 8px ${alpha(palette.main, 0.06)}`,
					transform: 'translateY(-1px)',
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
				...sx,
			}}
		>
			<Stack
				direction="row"
				alignItems="flex-start"
				justifyContent="space-between"
				sx={{ ...statCardPadding, gap: 1, minWidth: 0 }}
			>
				<Box sx={{ minWidth: 0, flex: 1 }}>
					<Typography
						variant="caption"
						color="text.secondary"
						fontWeight={600}
						textTransform="uppercase"
						letterSpacing={0.5}
						sx={{ display: 'block', lineHeight: 1.3 }}
					>
						{title}
					</Typography>
					{loading ? (
						<Skeleton width="70%" height={28} sx={{ mt: 0.35, maxWidth: 100 }} />
					) : (
						<Typography
							component="div"
							fontWeight={800}
							sx={{
								mt: 0.35,
								lineHeight: 1.2,
								wordBreak: 'break-word',
								overflowWrap: 'anywhere',
								fontSize: statCardValueFontSize,
							}}
						>
							<StatCardValue value={value} />
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
							width: statCardIconBoxSize,
							height: statCardIconBoxSize,
							borderRadius: 1,
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
