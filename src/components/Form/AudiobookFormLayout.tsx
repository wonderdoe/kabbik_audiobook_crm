'use client';

import { Box, Grid, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

/** Tighter vertical rhythm inside audiobook add/edit dialogs */
export const audiobookFormDenseSx = {
	'& .MuiFormControl-marginNormal': {
		marginTop: 0,
		marginBottom: 1,
	},
	'& .MuiOutlinedInput-root': {
		borderRadius: 1.5,
	},
	'& .MuiFormHelperText-root': {
		marginLeft: 0,
		marginRight: 0,
	},
};

type SectionProps = {
	title: string;
	description?: string;
	children: ReactNode;
};

export function AudiobookFormSection({ title, description, children }: SectionProps) {
	return (
		<Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
			<Stack spacing={0.25} mb={1.5}>
				<Typography variant="subtitle2" fontWeight={700}>
					{title}
				</Typography>
				{description ? (
					<Typography variant="caption" color="text.secondary">
						{description}
					</Typography>
				) : null}
			</Stack>
			{children}
		</Paper>
	);
}

export function AudiobookFormGrid({ children }: { children: ReactNode }) {
	return (
		<Grid container spacing={2}>
			{children}
		</Grid>
	);
}

export function AudiobookFormField({ xs = 12, md = 6, children }: { xs?: number; md?: number; children: ReactNode }) {
	return (
		<Grid item xs={xs} md={md}>
			{children}
		</Grid>
	);
}

export function AudiobookFormRoot({ children, onSubmit, formId }: { children: ReactNode; onSubmit: (e: React.FormEvent) => void; formId: string }) {
	return (
		<Box component="form" id={formId} onSubmit={onSubmit} sx={audiobookFormDenseSx}>
			<Stack spacing={2}>
				{children}
			</Stack>
		</Box>
	);
}
