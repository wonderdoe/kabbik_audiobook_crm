'use client';

import { MainCard } from '@/components/mantis/MainCard';
import {
	Chip,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import { IconEye } from '@tabler/icons-react';
import { formatDateDhaka, isExpired } from '@/utils/date';
import type { RewardClaimRow } from '@/types/rewards';
import { getStatusBadge } from '@/types/rewards';

type Props = {
	rows: RewardClaimRow[];
	onView: (row: RewardClaimRow) => void;
};

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

function userDisplayName(row: RewardClaimRow) {
	const name = row.full_name || row.user_name || 'Unknown user';
	return row.user_deleted ? `${name} (deleted)` : name;
}

export function RewardClaimsTable({ rows, onView }: Props) {
	return (
		<MainCard title="Claims" contentSX={{ p: 0 }}>
		<TableContainer sx={{ maxHeight: 560 }}>
			<Table stickyHeader size="small">
				<TableHead>
					<TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
						<TableCell>User</TableCell>
						<TableCell>Phone / City</TableCell>
						<TableCell>Tier</TableCell>
						<TableCell>Reward / Offer</TableCell>
						<TableCell>Points</TableCell>
						<TableCell>Claim status</TableCell>
						<TableCell>Used</TableCell>
						<TableCell>Expires</TableCell>
						<TableCell>Claimed at</TableCell>
						<TableCell />
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map(row => {
						const claimBadge = getStatusBadge('claim_status', row.claim_status);
						const usedBadge = getStatusBadge('is_used', row.is_used);
						const expired = isExpired(row.expire_at) && !row.is_used;
						return (
							<TableRow key={row.id} hover>
								<TableCell>
									<Typography variant="body2" fontWeight={500}>
										{userDisplayName(row)}
									</Typography>
									{row.user_name && row.full_name ? (
										<Typography variant="caption" color="text.secondary">
											@{row.user_name}
										</Typography>
									) : null}
									<Typography variant="caption" color="text.secondary" display="block">
										{row.user_email || '—'}
									</Typography>
								</TableCell>
								<TableCell>
									<Typography variant="body2">{row.phone_no || '—'}</Typography>
									<Typography variant="caption" color="text.secondary">
										{row.city || '—'}
									</Typography>
								</TableCell>
								<TableCell>{row.tier_name || row.tier_id || '—'}</TableCell>
								<TableCell>
									<Typography variant="body2">{row.reward_name || `Reward #${row.reward_id}`}</Typography>
									{row.offer ? (
										<Typography variant="caption" color="text.secondary">
											{row.offer}
										</Typography>
									) : null}
								</TableCell>
								<TableCell>{row.usage_point ?? '—'}</TableCell>
								<TableCell>
									<Chip size="small" label={claimBadge.label} color={chipColor(claimBadge.color)} variant="outlined" />
								</TableCell>
								<TableCell>
									<Chip size="small" label={usedBadge.label} color={chipColor(usedBadge.color)} variant="outlined" />
								</TableCell>
								<TableCell>
									<Typography variant="body2" color={expired ? 'error' : 'inherit'}>
										{formatDateDhaka(row.expire_at)}
									</Typography>
								</TableCell>
								<TableCell>{formatDateDhaka(row.created_at)}</TableCell>
								<TableCell>
									<IconButton size="small" aria-label="View claim" onClick={() => onView(row)}>
										<IconEye size={18} />
									</IconButton>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
		</MainCard>
	);
}
