'use client';

import {
	Grid,
	Stack,
	Typography,
	useTheme,
} from '@mui/material';
import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';
import { StatCard } from '@/components/Dashboard/StatCard';

interface StatsGroupProps {
	data: { title: string; value: string; diff: number }[];
}

export function StatsGroup({ data }: StatsGroupProps) {
	const theme = useTheme();
	const stats = data.map((stat, index) => {
		const DiffIcon = stat.diff > 0 ? IconArrowUpRight : IconArrowDownRight;
		const diffColor = stat.diff > 0 ? theme.palette.success.main : theme.palette.error.main;

		return (
			<Grid item xs={12} md={4} key={stat.title}>
				<StatCard
					title={stat.title}
					value={
						<Stack spacing={0.5}>
							<Typography component="span" variant="h5" fontWeight={700}>
								{stat.value}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								<Typography component="span" sx={{ color: diffColor, fontWeight: 700 }}>
									{stat.diff}%
								</Typography>{' '}
								<DiffIcon size={14} color={diffColor} style={{ verticalAlign: 'middle' }} />
							</Typography>
						</Stack>
					}
					index={index}
				/>
			</Grid>
		);
	});

	return (
		<Grid container spacing={2}>
			{stats}
		</Grid>
	);
}
