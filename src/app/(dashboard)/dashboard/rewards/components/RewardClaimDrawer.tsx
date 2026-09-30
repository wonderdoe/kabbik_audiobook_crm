'use client';

import { createActivityLog } from '@/helper/Commonfunction';
import { Badge, Button, Drawer, Group, Loader, Select, Stack, Table, Text, Title } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { formatDateDhaka } from '@/utils/date';
import type { ClaimStatus, RewardClaimRow } from '@/types/rewards';
import { ALLOWED_CLAIM_STATUSES, getStatusBadge } from '@/types/rewards';

type DetailPayload = {
	claim: RewardClaimRow;
	otherClaims: RewardClaimRow[];
};

type Props = {
	claimId: number | null;
	opened: boolean;
	onClose: () => void;
	onUpdated?: () => void;
};

const claimStatusSelectData = ALLOWED_CLAIM_STATUSES.map(value => {
	const badge = getStatusBadge('claim_status', value);
	return { value, label: badge.label };
});

function userDisplayName(claim: RewardClaimRow) {
	const name = claim.full_name || claim.user_name || 'Unknown user';
	return claim.user_deleted ? `${name} (deleted)` : name;
}

export function RewardClaimDrawer({ claimId, opened, onClose, onUpdated }: Props) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<DetailPayload | null>(null);
	const [selectedStatus, setSelectedStatus] = useState<ClaimStatus | null>(null);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!opened || !claimId) return;
		let cancelled = false;
		(async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`/api/routes/rewards/${claimId}`);
				if (!res.ok) throw new Error('Failed to load claim');
				const json = await res.json();
				if (!cancelled) {
					setData(json);
					const current = json.claim?.claim_status as ClaimStatus;
					if (ALLOWED_CLAIM_STATUSES.includes(current)) {
						setSelectedStatus(current);
					} else {
						setSelectedStatus(null);
					}
				}
			} catch {
				if (!cancelled) setError('Could not load claim details.');
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [opened, claimId]);

	const claim = data?.claim;

	const statusUnchanged = useMemo(() => {
		if (!claim || !selectedStatus) return true;
		return claim.claim_status === selectedStatus;
	}, [claim, selectedStatus]);

	const handleSaveStatus = async () => {
		if (!claimId || !claim || !selectedStatus || statusUnchanged) return;

		const oldStatus = claim.claim_status;
		const confirm = await Swal.fire({
			title: 'Update claim status?',
			text: `Change from ${oldStatus} to ${selectedStatus}?`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Update',
		});

		if (!confirm.isConfirmed) return;

		setSaving(true);
		try {
			const response = await fetch(`/api/routes/rewards/${claimId}/claim-status`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ claimStatus: selectedStatus }),
			});
			const result = await response.json();

			if (!response.ok) {
				Swal.fire({
					title: 'Error',
					text: result.message || 'Failed to update claim status',
					icon: 'error',
				});
				return;
			}

			createActivityLog({
				name: 'updateRewardClaimStatus,rewards/RewardClaimDrawer.tsx',
				action_type: 'update',
				payload: JSON.stringify({
					id: claimId,
					from: oldStatus,
					to: selectedStatus,
				}),
				api_end_point: `/api/routes/rewards/${claimId}/claim-status`,
			});

			setData({
				claim: result.claim,
				otherClaims: result.otherClaims ?? data?.otherClaims ?? [],
			});

			Swal.fire({
				title: 'Success',
				text: result.message || 'Claim status updated',
				icon: 'success',
			});

			onUpdated?.();
		} catch {
			Swal.fire({
				title: 'Error',
				text: 'Failed to update claim status',
				icon: 'error',
			});
		} finally {
			setSaving(false);
		}
	};

	return (
		<Drawer opened={opened} onClose={onClose} title="Reward claim" position="right" size="lg">
			{loading ? (
				<Loader />
			) : error ? (
				<Text c="red">{error}</Text>
			) : !claim ? (
				<Text c="dimmed">No data</Text>
			) : (
				<Stack gap="md">
					<div>
						<Title order={4}>{userDisplayName(claim)}</Title>
						<Text size="sm" c="dimmed">
							{claim.user_email || '—'} · {claim.phone_no || '—'}
						</Text>
						<Text size="sm">{claim.city || '—'}</Text>
					</div>

					<div>
						<Text fw={600} size="sm" mb="xs">
							Claim status
						</Text>
						<Group align="flex-end" wrap="wrap">
							<Select
								label="Status"
								data={claimStatusSelectData}
								value={selectedStatus}
								onChange={v => setSelectedStatus(v as ClaimStatus | null)}
								w={220}
								disabled={saving}
							/>
							<Button
								onClick={handleSaveStatus}
								loading={saving}
								disabled={statusUnchanged || !selectedStatus}
							>
								Save
							</Button>
						</Group>
					</div>

					<div>
						<Text fw={600} size="sm">
							Tier and points
						</Text>
						<Text size="sm">
							Tier: {claim.tier_name || claim.tier_id} · Acquired: {claim.acquired_point ?? '—'} ·
							Balance: {claim.balance_point ?? '—'}
						</Text>
					</div>

					<div>
						<Text fw={600} size="sm">
							Reward
						</Text>
						<Text size="sm">{claim.reward_name || `Reward #${claim.reward_id}`}</Text>
						{claim.offer ? <Text size="sm">Offer: {claim.offer}</Text> : null}
						<GroupBadges claim={claim} />
					</div>

					{claim.user_additional_info && typeof claim.user_additional_info === 'object' ? (
						<div>
							<Text fw={600} size="sm" mb="xs">
								Additional info
							</Text>
							<Table withTableBorder>
								<Table.Tbody>
									{Object.entries(claim.user_additional_info).map(([k, v]) => (
										<Table.Tr key={k}>
											<Table.Td fw={500}>{k}</Table.Td>
											<Table.Td>{String(v)}</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</div>
					) : null}

					<div>
						<Text size="sm">Created: {formatDateDhaka(claim.created_at)}</Text>
						<Text size="sm">Updated: {formatDateDhaka(claim.updated_at)}</Text>
						<Text size="sm">Expires: {formatDateDhaka(claim.expire_at)}</Text>
						<Text size="sm">Usage points: {claim.usage_point ?? '—'}</Text>
					</div>

					{data?.otherClaims?.length ? (
						<div>
							<Text fw={600} size="sm" mb="xs">
								Other recent claims
							</Text>
							<Table withTableBorder>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Reward</Table.Th>
										<Table.Th>Status</Table.Th>
										<Table.Th>Date</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{data.otherClaims.map(oc => (
										<Table.Tr key={oc.id}>
											<Table.Td>{oc.reward_name || oc.reward_id}</Table.Td>
											<Table.Td>{oc.claim_status}</Table.Td>
											<Table.Td>{formatDateDhaka(oc.created_at)}</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</div>
					) : null}
				</Stack>
			)}
		</Drawer>
	);
}

function GroupBadges({ claim }: { claim: RewardClaimRow }) {
	const claimBadge = getStatusBadge('claim_status', claim.claim_status);
	const statusBadge = getStatusBadge('status', claim.status);
	const usedBadge = getStatusBadge('is_used', claim.is_used);
	return (
		<Stack gap={4} mt="xs">
			<Badge color={claimBadge.color}>{claimBadge.label}</Badge>
			<Badge color={statusBadge.color}>{statusBadge.label}</Badge>
			<Badge color={usedBadge.color}>{usedBadge.label}</Badge>
		</Stack>
	);
}
