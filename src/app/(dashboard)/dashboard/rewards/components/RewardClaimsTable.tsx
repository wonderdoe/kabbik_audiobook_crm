'use client';

import { MainCard } from '@/components/mantis/MainCard';
import {
	Box,
	Chip,
	IconButton,
	Table,
	TableBody,
	TableCell,
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

const TABLE_MIN_WIDTH = 1310;

const cellSx = {
	verticalAlign: 'top' as const,
	overflow: 'hidden',
	wordBreak: 'break-word' as const,
};

function chipColor(legacyToken: string): 'default' | 'error' | 'info' | 'success' | 'warning' {
	const map: Record<string, 'default' | 'error' | 'info' | 'success' | 'warning'> = {
		yellow: 'warning',
		red: 'error',
		green: 'success',
		gray: 'default',
		blue: 'info',
	};
	return map[legacyToken] ?? 'default';
}

function userDisplayName(row: RewardClaimRow) {
	const name = row.full_name || row.user_name || 'Unknown user';
	return row.user_deleted ? `${name} (deleted)` : name;
}

export function RewardClaimsTable({ rows, onView }: Props) {
	return (
		<MainCard title="Claims" contentSX={{ p: 0, pt: 0, '&:last-child': { pb: 0 } }}>
			<Box
				sx={{
					width: '100%',
					maxWidth: '100%',
					maxHeight: 560,
					overflowX: 'auto',
					overflowY: 'auto',
					WebkitOverflowScrolling: 'touch',
				}}
			>
				<Table
					stickyHeader
					size="small"
					sx={{
						minWidth: TABLE_MIN_WIDTH,
						width: TABLE_MIN_WIDTH,
						tableLayout: 'fixed',
						'& .MuiTableCell-head': {
							py: 1.25,
							px: 1.5,
							fontWeight: 700,
							whiteSpace: 'nowrap',
							bgcolor: 'grey.50',
							borderBottom: 1,
							borderColor: 'divider',
							top: 0,
							zIndex: 2,
						},
						'& .MuiTableCell-body': {
							px: 1.5,
							py: 1.25,
							borderColor: 'divider',
						},
					}}
				>
					<colgroup>
						<col style={{ width: 220 }} />
						<col style={{ width: 140 }} />
						<col style={{ width: 100 }} />
						<col style={{ width: 180 }} />
						<col style={{ width: 80 }} />
						<col style={{ width: 130 }} />
						<col style={{ width: 110 }} />
						<col style={{ width: 150 }} />
						<col style={{ width: 150 }} />
						<col style={{ width: 48 }} />
					</colgroup>
					<TableHead>
						<TableRow>
							<TableCell>User</TableCell>
							<TableCell>Phone / City</TableCell>
							<TableCell>Tier</TableCell>
							<TableCell>Reward / Offer</TableCell>
							<TableCell>Points</TableCell>
							<TableCell>Claim status</TableCell>
							<TableCell>Used</TableCell>
							<TableCell>Expires</TableCell>
							<TableCell>Claimed at</TableCell>
							<TableCell padding="checkbox" />
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.map(row => {
							const claimBadge = getStatusBadge('claim_status', row.claim_status);
							const usedBadge = getStatusBadge('is_used', row.is_used);
							const expired = isExpired(row.expire_at) && !row.is_used;
							return (
								<TableRow key={row.id} hover>
									<TableCell sx={cellSx}>
										<Typography variant="body2" fontWeight={500}>
											{userDisplayName(row)}
										</Typography>
										{row.user_name && row.full_name ? (
											<Typography variant="caption" color="text.secondary" display="block">
												@{row.user_name}
											</Typography>
										) : null}
										<Typography variant="caption" color="text.secondary" display="block">
											{row.user_email || '—'}
										</Typography>
									</TableCell>
									<TableCell sx={cellSx}>
										<Typography variant="body2">{row.phone_no || '—'}</Typography>
										<Typography variant="caption" color="text.secondary" display="block">
											{row.city || '—'}
										</Typography>
									</TableCell>
									<TableCell sx={cellSx}>{row.tier_name || row.tier_id || '—'}</TableCell>
									<TableCell sx={cellSx}>
										<Typography variant="body2">{row.reward_name || `Reward #${row.reward_id}`}</Typography>
										{row.offer ? (
											<Typography variant="caption" color="text.secondary" display="block">
												{row.offer}
											</Typography>
										) : null}
									</TableCell>
									<TableCell sx={cellSx}>{row.usage_point ?? '—'}</TableCell>
									<TableCell sx={cellSx}>
										<Chip
											size="small"
											label={claimBadge.label}
											color={chipColor(claimBadge.color)}
											variant="outlined"
										/>
									</TableCell>
									<TableCell sx={cellSx}>
										<Chip
											size="small"
											label={usedBadge.label}
											color={chipColor(usedBadge.color)}
											variant="outlined"
										/>
									</TableCell>
									<TableCell sx={cellSx}>
										<Typography variant="body2" color={expired ? 'error' : 'inherit'}>
											{formatDateDhaka(row.expire_at)}
										</Typography>
									</TableCell>
									<TableCell sx={cellSx}>{formatDateDhaka(row.created_at)}</TableCell>
									<TableCell sx={{ ...cellSx, px: 0.5, width: 48 }}>
										<IconButton size="small" aria-label="View claim" onClick={() => onView(row)}>
											<IconEye size={18} />
										</IconButton>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</Box>
		</MainCard>
	);
}
