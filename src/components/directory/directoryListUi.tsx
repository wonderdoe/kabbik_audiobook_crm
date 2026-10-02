'use client';

import { Avatar, Box, Pagination, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { MainCard } from '@/components/mantis/MainCard';

export const directoryTableSx = {
	minWidth: 720,
	'& .MuiTableCell-head': {
		py: 1.25,
		px: 2,
		fontWeight: 700,
		bgcolor: 'grey.50',
		borderBottom: 1,
		borderColor: 'divider',
	},
	'& .MuiTableCell-body': {
		px: 2,
		py: 1.5,
		borderColor: 'divider',
		verticalAlign: 'middle',
	},
} as const;

type DirectoryListCardProps = {
	title: string;
	subtitle?: string;
	totalCount: number;
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	children: ReactNode;
	emptyMessage?: string;
	isEmpty?: boolean;
};

export function DirectoryListCard({
	title,
	subtitle,
	totalCount,
	currentPage,
	totalPages,
	onPageChange,
	children,
	emptyMessage = 'No records found',
	isEmpty,
}: DirectoryListCardProps) {
	const showEmpty = isEmpty ?? totalCount === 0;

	return (
		<MainCard
			title={title}
			subtitle={subtitle ?? `${totalCount.toLocaleString()} total`}
			contentSX={{ p: 0, pt: 0, '&:last-child': { pb: 0 } }}
		>
			{showEmpty ? (
				<Box sx={{ py: 8, px: 2, textAlign: 'center' }}>
					<Typography variant="body2" color="text.secondary">
						{emptyMessage}
					</Typography>
				</Box>
			) : (
				<>
					<Box
						sx={{
							width: '100%',
							maxWidth: '100%',
							overflowX: 'auto',
							WebkitOverflowScrolling: 'touch',
						}}
					>
						{children}
					</Box>
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						alignItems={{ xs: 'stretch', sm: 'center' }}
						justifyContent="space-between"
						gap={1}
						sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider' }}
					>
						<Typography variant="body2" color="text.secondary">
							Page {currentPage} of {Math.max(totalPages, 1)}
						</Typography>
						{totalPages > 1 ? (
							<Pagination
								page={currentPage}
								count={totalPages}
								onChange={(_, page) => onPageChange(page)}
								size="small"
								siblingCount={1}
								sx={{ alignSelf: { xs: 'center', sm: 'auto' } }}
							/>
						) : null}
					</Stack>
				</>
			)}
		</MainCard>
	);
}

type DirectoryAvatarProps = {
	src?: string | null;
	name?: string | null;
};

export function DirectoryAvatar({ src, name }: DirectoryAvatarProps) {
	const label = name?.trim() || '?';
	const initial = label.charAt(0).toUpperCase();

	return (
		<Avatar
			variant="rounded"
			src={src || undefined}
			alt={label}
			sx={{
				width: 56,
				height: 56,
				bgcolor: 'grey.100',
				color: 'primary.main',
				fontWeight: 700,
				fontSize: '1.1rem',
				border: 1,
				borderColor: 'divider',
				boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
				'& img': { objectFit: 'cover' },
			}}
		>
			{!src ? initial : null}
		</Avatar>
	);
}
