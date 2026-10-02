'use client';

import { Grid } from '@mui/material';
import type { ReactNode } from 'react';
import {
	IconAward,
	IconCheck,
	IconClock,
	IconCoin,
	IconHourglass,
	IconTicket,
	IconUsers,
} from '@tabler/icons-react';
import { StatCard, type StatCardColor } from '@/components/ui/StatCard';
import type { RewardSummary } from '@/types/rewards';

type Props = {
	summary: RewardSummary | null;
	loading: boolean;
};

const cards: {
	key: keyof RewardSummary;
	title: string;
	color: StatCardColor;
	icon: ReactNode;
}[] = [
	{ key: 'total_claims', title: 'Total claims', color: 'primary', icon: <IconTicket size={22} /> },
	{ key: 'claimed', title: 'Claimed', color: 'success', icon: <IconCheck size={22} /> },
	{ key: 'pending', title: 'Pending', color: 'warning', icon: <IconHourglass size={22} /> },
	{ key: 'used', title: 'Used', color: 'info', icon: <IconAward size={22} /> },
	{ key: 'expired', title: 'Expired', color: 'error', icon: <IconClock size={22} /> },
	{ key: 'unique_users', title: 'Unique users', color: 'secondary', icon: <IconUsers size={22} /> },
	{ key: 'total_points', title: 'Points spent', color: 'primary', icon: <IconCoin size={22} /> },
];

export function RewardSummaryCards({ summary, loading }: Props) {
	return (
		<Grid container spacing={2}>
			{cards.map(({ key, title, color, icon }) => (
				<Grid item xs={12} sm={6} md={4} lg={3} xl={12 / 7} key={key}>
					<StatCard
						title={title}
						color={color}
						icon={icon}
						loading={loading}
						value={loading || !summary ? '—' : Number(summary[key] ?? 0).toLocaleString()}
					/>
				</Grid>
			))}
		</Grid>
	);
}
