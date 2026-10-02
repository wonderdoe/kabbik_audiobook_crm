'use client';

import {
	Box,
	Stack,
	Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import { MantisBreadcrumbs, type BreadcrumbItem } from './Breadcrumbs';

type PageHeaderProps = {
	title: string;
	breadcrumbs?: BreadcrumbItem[];
	actions?: ReactNode;
	subtitle?: ReactNode;
};

export function PageHeader({ title, breadcrumbs = [], actions, subtitle }: PageHeaderProps) {
	return (
		<Box sx={{ mb: { xs: 2, sm: 3 } }}>
			{breadcrumbs.length > 0 && (
				<Box sx={{ mb: 1 }}>
					<MantisBreadcrumbs items={breadcrumbs} />
				</Box>
			)}
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				alignItems={{ xs: 'stretch', sm: 'center' }}
				justifyContent="space-between"
				flexWrap="wrap"
				gap={2}
			>
				<Box sx={{ minWidth: 0 }}>
					<Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.125rem', sm: undefined } }}>
						{title}
					</Typography>
					{subtitle}
				</Box>
				{actions ? (
					<Box
						sx={{
							display: 'flex',
							flexDirection: { xs: 'column', sm: 'row' },
							gap: 1,
							width: { xs: '100%', sm: 'auto' },
							'& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } },
						}}
					>
						{actions}
					</Box>
				) : null}
			</Stack>
		</Box>
	);
}
