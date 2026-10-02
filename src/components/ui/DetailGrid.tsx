'use client';

import { Box, Divider, Grid, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export type DetailField = { label: string; value: ReactNode };

type DetailGridProps = {
	title?: string;
	fields: DetailField[];
	columns?: 2 | 3;
};

export function DetailGrid({ title, fields, columns = 2 }: DetailGridProps) {
	return (
		<Box>
			{title ? (
				<>
					<Typography variant="subtitle2" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
						{title}
					</Typography>
					<Divider sx={{ my: 1.5 }} />
				</>
			) : null}
			<Grid container spacing={2}>
				{fields.map(({ label, value }) => (
					<Grid item xs={12} sm={columns === 3 ? 4 : 6} key={label}>
						<Typography variant="caption" color="text.secondary" display="block">
							{label}
						</Typography>
						<Typography variant="body2" fontWeight={500} sx={{ mt: 0.25, wordBreak: 'break-word' }}>
							{value ?? '—'}
						</Typography>
					</Grid>
				))}
			</Grid>
		</Box>
	);
}
