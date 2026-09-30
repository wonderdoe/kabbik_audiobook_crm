'use client';

import { Card, Group, SimpleGrid, Text } from '@mantine/core';
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
		<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
			{cards.map(({ key, title }) => (
				<Card key={key} withBorder padding="md" radius="md">
					<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
						{title}
					</Text>
					<Group mt="xs">
						<Text size="xl" fw={700}>
							{loading || !summary ? '—' : Number(summary[key] ?? 0).toLocaleString()}
						</Text>
					</Group>
				</Card>
			))}
		</SimpleGrid>
	);
}
