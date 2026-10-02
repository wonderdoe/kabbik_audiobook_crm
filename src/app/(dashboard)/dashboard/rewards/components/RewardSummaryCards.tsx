'use client';

import {
	Card,
	Grid,
	Stack,
	Typography,
} from '@mui/material';
import type { RewardSummary } from '@/types/rewards';

type Props = {
	summary: RewardSummary | null;
	loading: boolean;
};

const cards: { key: keyof RewardSummary; title: string }[] = [
	{ key: 'total_claims', title: 'Total claims' },
	{ key: 'claimed', title: 'Claimed' },
	{ key: 'pending', title: 'Pending' },
	{ key: 'used', title: 'Used' },
	{ key: 'expired', title: 'Expired' },
	{ key: 'unique_users', title: 'Unique users' },
	{ key: 'total_points', title: 'Points spent' },
];

export function RewardSummaryCards({ summary, loading }: Props) {
	return (
		<Grid container spacing={2}>
			{cards.map(({ key, title }) => (
				<Grid item xs={12} sm={6} md={3} key={key}>
					<Card variant="outlined" sx={{ p: 2 }}>
						<Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
							{title}
						</Typography>
						<Stack mt={0.5}>
							<Typography variant="h5" fontWeight={700}>
								{loading || !summary ? '—' : Number(summary[key] ?? 0).toLocaleString()}
							</Typography>
						</Stack>
					</Card>
				</Grid>
			))}
		</Grid>
	);
}
