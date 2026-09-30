/**
 * Populated from Phase 0 discovery (tier_user_reward_claim_log):
 * - claim_status: PENDING (24), CANCELLED (1)
 * - status: 0 (4 rows), 1 (21 rows) — numeric flag paired with claim_status
 * - is_used: 0 (all rows in sample)
 *
 * Suggested indexes (do not run automatically):
 * CREATE INDEX idx_turcl_user_id ON tier_user_reward_claim_log (user_id);
 * CREATE INDEX idx_turcl_claim_status ON tier_user_reward_claim_log (claim_status);
 * CREATE INDEX idx_turcl_created_at ON tier_user_reward_claim_log (created_at);
 */

export const REWARD_STATUS_MAP = {
	claim_status: {
		PENDING: { label: 'Pending', color: 'yellow' },
		CANCELLED: { label: 'Cancelled', color: 'red' },
		CLAIMED: { label: 'Claimed', color: 'green' },
	},
	status: {
		0: { label: 'Status 0', color: 'gray' },
		1: { label: 'Status 1', color: 'blue' },
	},
	is_used: {
		0: { label: 'Not used', color: 'gray' },
		1: { label: 'Used', color: 'green' },
	},
};

/** Admin-settable claim_status values (CRM override). */
export const ALLOWED_CLAIM_STATUSES = ['PENDING', 'CLAIMED', 'CANCELLED'];

/**
 * CRM normalization: PENDING → status 1; CLAIMED / CANCELLED → status 0.
 * Legacy rows may differ until updated via CRM.
 */
export function claimStatusToNumericStatus(claimStatus) {
	return claimStatus === 'PENDING' ? 1 : 0;
}

export function getStatusBadge(mapKey, value) {
	const key = value === null || value === undefined ? '' : String(value);
	const entry = REWARD_STATUS_MAP[mapKey]?.[key];
	if (entry) return entry;
	return { label: key || '—', color: 'gray' };
}

export function parseUserAdditionalInfo(raw) {
	if (raw === null || raw === undefined || raw === '') return null;
	if (typeof raw === 'object') return raw;
	try {
		return JSON.parse(raw);
	} catch {
		return { raw: String(raw) };
	}
}
