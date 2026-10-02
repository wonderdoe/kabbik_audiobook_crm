'use client';

import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Drawer,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import { createActivityLog } from '@/helper/Commonfunction';
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

function chipColor(mantineColor: string): 'default' | 'error' | 'info' | 'success' | 'warning' {
	const map: Record<string, 'default' | 'error' | 'info' | 'success' | 'warning'> = {
		yellow: 'warning',
		red: 'error',
		green: 'success',
		gray: 'default',
		blue: 'info',
	};
	return map[mantineColor] ?? 'default';
}

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
		<Drawer anchor="right" open={opened} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}>
			<Box sx={{ p: 2 }}>
				<Typography variant="h6" gutterBottom>Reward claim</Typography>
				{loading ? (
					<CircularProgress size={32} />
				) : error ? (
					<Typography color="error">{error}</Typography>
				) : !claim ? (
					<Typography color="text.secondary">No data</Typography>
				) : (
					<Stack spacing={2}>
						<div>
							<Typography variant="h6">{userDisplayName(claim)}</Typography>
							<Typography variant="body2" color="text.secondary">
								{claim.user_email || '—'} · {claim.phone_no || '—'}
							</Typography>
							<Typography variant="body2">{claim.city || '—'}</Typography>
						</div>

						<div>
							<Typography fontWeight={600} variant="body2" mb={1}>
								Claim status
							</Typography>
							<Stack direction="row" flexWrap="wrap" alignItems="flex-end" gap={1}>
								<FormControl size="small" sx={{ width: 220 }} disabled={saving}>
									<InputLabel>Status</InputLabel>
									<Select
										label="Status"
										value={selectedStatus ?? ''}
										onChange={e => setSelectedStatus((e.target.value as ClaimStatus) || null)}
									>
										{claimStatusSelectData.map(o => (
											<MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
										))}
									</Select>
								</FormControl>
								<Button
									variant="contained"
									onClick={handleSaveStatus}
									disabled={saving || statusUnchanged || !selectedStatus}
								>
									{saving ? 'Saving…' : 'Save'}
								</Button>
							</Stack>
						</div>

						<div>
							<Typography fontWeight={600} variant="body2">
								Tier and points
							</Typography>
							<Typography variant="body2">
								Tier: {claim.tier_name || claim.tier_id} · Acquired: {claim.acquired_point ?? '—'} ·
								Balance: {claim.balance_point ?? '—'}
							</Typography>
						</div>

						<div>
							<Typography fontWeight={600} variant="body2">
								Reward
							</Typography>
							<Typography variant="body2">{claim.reward_name || `Reward #${claim.reward_id}`}</Typography>
							{claim.offer ? <Typography variant="body2">Offer: {claim.offer}</Typography> : null}
							<GroupBadges claim={claim} />
						</div>

						{claim.user_additional_info && typeof claim.user_additional_info === 'object' ? (
							<div>
								<Typography fontWeight={600} variant="body2" mb={1}>
									Additional info
								</Typography>
								<TableContainer>
									<Table size="small">
										<TableBody>
											{Object.entries(claim.user_additional_info).map(([k, v]) => (
												<TableRow key={k}>
													<TableCell sx={{ fontWeight: 500 }}>{k}</TableCell>
													<TableCell>{String(v)}</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>
							</div>
						) : null}

						<div>
							<Typography variant="body2">Created: {formatDateDhaka(claim.created_at)}</Typography>
							<Typography variant="body2">Updated: {formatDateDhaka(claim.updated_at)}</Typography>
							<Typography variant="body2">Expires: {formatDateDhaka(claim.expire_at)}</Typography>
							<Typography variant="body2">Usage points: {claim.usage_point ?? '—'}</Typography>
						</div>

						{data?.otherClaims?.length ? (
							<div>
								<Typography fontWeight={600} variant="body2" mb={1}>
									Other recent claims
								</Typography>
								<TableContainer>
									<Table size="small">
										<TableHead>
											<TableRow>
												<TableCell>Reward</TableCell>
												<TableCell>Status</TableCell>
												<TableCell>Date</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{data.otherClaims.map(oc => (
												<TableRow key={oc.id}>
													<TableCell>{oc.reward_name || oc.reward_id}</TableCell>
													<TableCell>{oc.claim_status}</TableCell>
													<TableCell>{formatDateDhaka(oc.created_at)}</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>
							</div>
						) : null}
					</Stack>
				)}
			</Box>
		</Drawer>
	);
}

function GroupBadges({ claim }: { claim: RewardClaimRow }) {
	const claimBadge = getStatusBadge('claim_status', claim.claim_status);
	const statusBadge = getStatusBadge('status', claim.status);
	const usedBadge = getStatusBadge('is_used', claim.is_used);
	return (
		<Stack spacing={0.5} mt={1}>
			<Chip size="small" label={claimBadge.label} color={chipColor(claimBadge.color)} />
			<Chip size="small" label={statusBadge.label} color={chipColor(statusBadge.color)} />
			<Chip size="small" label={usedBadge.label} color={chipColor(usedBadge.color)} />
		</Stack>
	);
}
