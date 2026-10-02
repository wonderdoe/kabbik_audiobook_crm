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
				borderRadius: 2,
				boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
				transition: 'box-shadow 0.2s',
				'&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.07)' },
				...sx,
			}}
		>
			{(title || secondary) && (
				<Box
					sx={{
						px: 2.5,
						py: 1.75,
						display: 'flex',
						alignItems: 'center',
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
			<CardContent sx={{ p: 2.5, pt: 2.5, ...contentSX }}>{children}</CardContent>
		</Card>
	);
}
