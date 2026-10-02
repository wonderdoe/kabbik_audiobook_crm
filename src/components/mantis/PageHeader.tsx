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
		<Box sx={{ mb: 3 }}>
			{breadcrumbs.length > 0 && (
				<Box sx={{ mb: 1 }}>
					<MantisBreadcrumbs items={breadcrumbs} />
				</Box>
			)}
			<Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
				<Box>
					<Typography variant="h4" component="h1">
						{title}
					</Typography>
					{subtitle}
				</Box>
				{actions}
			</Stack>
		</Box>
	);
}
