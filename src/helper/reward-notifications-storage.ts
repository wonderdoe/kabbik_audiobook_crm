const READ_IDS_CAP = 2000;
const KEY_PREFIX = 'kabbik_rewards_read_claim_ids_';

export const REWARDS_READ_UPDATED = 'kabbik:rewards-read-updated';

function getAdminId(): string {
	if (typeof window === 'undefined') return 'anonymous';
	return localStorage.getItem('id') || 'anonymous';
}

export function getRewardsReadStorageKey(adminId?: string): string {
	return `${KEY_PREFIX}${adminId ?? getAdminId()}`;
}

export function clearRewardsReadStorage(adminId?: string): void {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(getRewardsReadStorageKey(adminId));
}

function parseStoredIds(raw: string | null): number[] {
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((n): n is number => typeof n === 'number' && Number.isFinite(n));
	} catch {
		return [];
	}
}

export function getReadClaimIds(): Set<number> {
	if (typeof window === 'undefined') return new Set();
	const ids = parseStoredIds(localStorage.getItem(getRewardsReadStorageKey()));
	return new Set(ids);
}

export function markClaimIdsRead(ids: number[]): void {
	if (typeof window === 'undefined' || ids.length === 0) return;
	const key = getRewardsReadStorageKey();
	const existing = parseStoredIds(localStorage.getItem(key));
	const merged = [...existing];
	for (const id of ids) {
		if (!merged.includes(id)) merged.push(id);
	}
	const trimmed = merged.length > READ_IDS_CAP ? merged.slice(-READ_IDS_CAP) : merged;
	localStorage.setItem(key, JSON.stringify(trimmed));
}

export function isClaimRead(id: number): boolean {
	return getReadClaimIds().has(id);
}

export function dispatchRewardsReadUpdated(): void {
	if (typeof window === 'undefined') return;
	window.dispatchEvent(new CustomEvent(REWARDS_READ_UPDATED));
}
