'use client';

import { ActionIcon, Badge, ScrollArea, Table, Text } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { formatDateDhaka, isExpired } from '@/utils/date';
import type { RewardClaimRow } from '@/types/rewards';
import { getStatusBadge } from '@/types/rewards';

type Props = {
	rows: RewardClaimRow[];
	onView: (row: RewardClaimRow) => void;
};

function userDisplayName(row: RewardClaimRow) {
	const name = row.full_name || row.user_name || 'Unknown user';
	return row.user_deleted ? `${name} (deleted)` : name;
}

export function RewardClaimsTable({ rows, onView }: Props) {
	return (
		<ScrollArea>
			<Table striped highlightOnHover withTableBorder stickyHeader>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>User</Table.Th>
						<Table.Th>Phone / City</Table.Th>
						<Table.Th>Tier</Table.Th>
						<Table.Th>Reward / Offer</Table.Th>
						<Table.Th>Points</Table.Th>
						<Table.Th>Claim status</Table.Th>
						<Table.Th>Used</Table.Th>
						<Table.Th>Expires</Table.Th>
						<Table.Th>Claimed at</Table.Th>
						<Table.Th />
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{rows.map(row => {
						const claimBadge = getStatusBadge('claim_status', row.claim_status);
						const usedBadge = getStatusBadge('is_used', row.is_used);
						const expired = isExpired(row.expire_at) && !row.is_used;
						return (
							<Table.Tr key={row.id}>
								<Table.Td>
									<Text size="sm" fw={500}>
										{userDisplayName(row)}
									</Text>
									{row.user_name && row.full_name ? (
										<Text size="xs" c="dimmed">
											@{row.user_name}
										</Text>
									) : null}
									<Text size="xs" c="dimmed">
										{row.user_email || '—'}
									</Text>
								</Table.Td>
								<Table.Td>
									<Text size="sm">{row.phone_no || '—'}</Text>
									<Text size="xs" c="dimmed">
										{row.city || '—'}
									</Text>
								</Table.Td>
								<Table.Td>{row.tier_name || row.tier_id || '—'}</Table.Td>
								<Table.Td>
									<Text size="sm">{row.reward_name || `Reward #${row.reward_id}`}</Text>
									{row.offer ? (
										<Text size="xs" c="dimmed">
											{row.offer}
										</Text>
									) : null}
								</Table.Td>
								<Table.Td>{row.usage_point ?? '—'}</Table.Td>
								<Table.Td>
									<Badge color={claimBadge.color} variant="light">
										{claimBadge.label}
									</Badge>
								</Table.Td>
								<Table.Td>
									<Badge color={usedBadge.color} variant="light">
										{usedBadge.label}
									</Badge>
								</Table.Td>
								<Table.Td>
									<Text size="sm" c={expired ? 'red' : undefined}>
										{formatDateDhaka(row.expire_at)}
									</Text>
								</Table.Td>
								<Table.Td>{formatDateDhaka(row.created_at)}</Table.Td>
								<Table.Td>
									<ActionIcon variant="subtle" aria-label="View claim" onClick={() => onView(row)}>
										<IconEye size={18} />
									</ActionIcon>
								</Table.Td>
							</Table.Tr>
						);
					})}
				</Table.Tbody>
			</Table>
		</ScrollArea>
	);
}
