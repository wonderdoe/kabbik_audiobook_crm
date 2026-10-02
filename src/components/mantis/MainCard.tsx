'use client';

import {
	Box,
	Card,
	CardContent,
	Typography,
	alpha,
	useTheme,
} from '@mui/material';
import type { ReactNode } from 'react';
import { cardShadow } from '@/styles/cardShadow';

type MainCardProps = {
	title?: ReactNode;
	subtitle?: ReactNode;
	secondary?: ReactNode;
	children: ReactNode;
	contentSX?: object;
	border?: boolean;
	sx?: object;
};

export function MainCard({ title, subtitle, secondary, children, contentSX, border = true, sx }: MainCardProps) {
	const theme = useTheme();

	return (
		<Card
			sx={{
				border: border ? `1px solid ${theme.palette.divider}` : 'none',
				borderRadius: 1,
				boxShadow: cardShadow.rest,
				transition: 'box-shadow 0.2s',
				'&:hover': { boxShadow: cardShadow.hover },
				minWidth: 0,
				maxWidth: '100%',
				...sx,
			}}
		>
			{(title || secondary) && (
				<Box
					sx={{
						px: { xs: 1.5, sm: 2.5 },
						py: { xs: 1.25, sm: 1.75 },
						display: 'flex',
						flexDirection: { xs: 'column', sm: 'row' },
						alignItems: { xs: 'stretch', sm: 'center' },
						justifyContent: 'space-between',
						gap: 2,
						borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
					}}
				>
					<Box sx={{ minWidth: 0 }}>
						{title && (
							typeof title === 'string'
								? <Typography variant="subtitle1" fontWeight={700} color="text.primary" lineHeight={1.3}>{title}</Typography>
								: title
						)}
						{subtitle && (
							typeof subtitle === 'string'
								? <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>{subtitle}</Typography>
								: subtitle
						)}
					</Box>
					{secondary}
				</Box>
			)}
			<CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, pt: { xs: 1.5, sm: 2.5 }, ...contentSX }}>
				{children}
			</CardContent>
		</Card>
	);
}
