'use client';

import { Card, Chip, Grid, Stack, Typography } from '@mui/material';
import { TableThumbnail } from '@/components/mantis/TableThumbnail';

type Item = { title: string; count: number; image: string };

export function PlayCountGrid({ list }: { list: Item[] }) {
	return (
		<Grid container spacing={2}>
			{list.map(item => (
				<Grid item xs={6} sm={4} md={3} lg={2} key={item.title}>
					<Card
						variant="outlined"
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							minHeight: 160,
							borderRadius: 2,
							'&:hover': { boxShadow: 3 },
						}}
					>
						<Stack alignItems="center" spacing={1}>
							{item.image ? (
								<TableThumbnail src={item.image} alt={item.title} objectFit="contain" size={48} />
							) : null}
							<Typography variant="caption" color="text.secondary" textAlign="center" textTransform="uppercase" fontWeight={600}>
								{item.title}
							</Typography>
							<Chip label={item.count ?? 'N/A'} color="primary" variant="outlined" size="small" />
						</Stack>
					</Card>
				</Grid>
			))}
		</Grid>
	);
}
