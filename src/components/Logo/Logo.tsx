'use client';

import { Box, Typography } from '@mui/material';
import Link from 'next/link';

interface Props {
	width?: string;
	height?: string;
	compact?: boolean;
}

export const Logo: React.FC<Props> = ({ compact = false }) => {
	return (
		<Box component={Link} href="/dashboard" sx={{ textDecoration: 'none', color: 'inherit' }}>
			<Typography variant="h6" fontWeight={700} lineHeight={1.2} noWrap>
				{compact ? 'K' : 'Kabbik'}
				{!compact && (
					<Typography component="span" fontWeight={400} color="text.secondary" sx={{ ml: 0.5 }}>
						CRM
					</Typography>
				)}
			</Typography>
		</Box>
	);
};
