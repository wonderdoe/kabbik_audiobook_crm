'use client';

import {
	Grid,
} from '@mui/material';
import { StatCard } from '@/components/Dashboard/StatCard';

export default function DashBoardViews({ data }: { data: { title: string; count?: number }[] }) {
	return (
		<Grid container spacing={2.5}>
			{data.map((item, index) => (
				<Grid item xs={12} sm={6} md={4} key={item.title}>
					<StatCard
						title={item.title}
						value={item.count !== undefined ? item.count : 'N/A'}
						index={index}
					/>
				</Grid>
			))}
		</Grid>
	);
}
