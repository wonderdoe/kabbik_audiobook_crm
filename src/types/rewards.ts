export type ClaimStatus = 'PENDING' | 'CLAIMED' | 'CANCELLED';

export const ALLOWED_CLAIM_STATUSES: ClaimStatus[] = ['PENDING', 'CLAIMED', 'CANCELLED'];

export type RewardClaimRow = {
	id: number;
	user_id: number;
	tier_id: number;
	reward_id: number;
	is_used: number;
	offer: string | null;
	user_additional_info: Record<string, unknown> | null;
	usage_point: number | null;
	status: number;
	claim_status: string;
	expire_at: string | null;
	created_at: string | null;
	updated_at: string | null;
	user_name: string | null;
	full_name: string | null;
	user_email: string | null;
	phone_no: string | null;
	city: string | null;
	user_deleted?: number;
	tier_name?: string | null;
	reward_name?: string | null;
	acquired_point?: number | null;
	balance_point?: number | null;
};

export type RewardSummary = {
	total_claims: number;
	claimed: number;
	pending: number;
	used: number;
	expired: number;
	unique_users: number;
	total_points: number;
};

export type RewardFilters = {
	search: string;
	claimStatus: string | null;
	tierId: string | null;
	isUsed: string | null;
	dateFrom: Date | null;
	dateTo: Date | null;
};

export const REWARD_STATUS_MAP = {
	claim_status: {
		PENDING: { label: 'Pending', color: 'yellow' },
		CANCELLED: { label: 'Cancelled', color: 'red' },
		CLAIMED: { label: 'Claimed', color: 'green' },
	},
	status: {
		'0': { label: 'Status 0', color: 'gray' },
		'1': { label: 'Status 1', color: 'blue' },
	},
	is_used: {
		'0': { label: 'Not used', color: 'gray' },
		'1': { label: 'Used', color: 'green' },
	},
} as const;

export function getStatusBadge(
	mapKey: keyof typeof REWARD_STATUS_MAP,
	value: string | number | null | undefined,
) {
	const key = value === null || value === undefined ? '' : String(value);
	const map = REWARD_STATUS_MAP[mapKey] as Record<string, { label: string; color: string }>;
	const entry = map[key];
	if (entry) return entry;
	return { label: key || '—', color: 'gray' };
}
