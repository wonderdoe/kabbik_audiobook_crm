'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
	getReadClaimIds,
	REWARDS_READ_UPDATED,
} from '@/helper/reward-notifications-storage';
import type { RewardClaimRow } from '@/types/rewards';

const POLL_MS = 60_000;
const LIST_LIMIT = 100;

const PENDING_QUERY =
	'claimStatus=PENDING&page=1&pageSize=100&sort=created_at&order=desc';

function displayName(row: RewardClaimRow): string {
	return row.full_name || row.user_name || row.user_email || `User #${row.user_id}`;
}

function rewardLabel(row: RewardClaimRow): string {
	return row.reward_name || row.offer || `Reward #${row.reward_id}`;
}

export type RewardNotificationItem = RewardClaimRow & {
	displayUser: string;
	displayReward: string;
};

function toUnread(rows: RewardClaimRow[]): RewardNotificationItem[] {
	const read = getReadClaimIds();
	return rows
		.filter(row => !read.has(row.id))
		.map(row => ({
			...row,
			displayUser: displayName(row),
			displayReward: rewardLabel(row),
		}));
}

function scheduleDeferred(fn: () => void): () => void {
	let cancelled = false;
	let timeoutId: number | undefined;
	const raf = requestAnimationFrame(() => {
		timeoutId = window.setTimeout(() => {
			if (!cancelled) fn();
		}, 0);
	});
	return () => {
		cancelled = true;
		cancelAnimationFrame(raf);
		if (timeoutId !== undefined) clearTimeout(timeoutId);
	};
}

type Options = {
	enabled: boolean;
};

export function useRewardNotifications({ enabled }: Options) {
	const [unreadClaims, setUnreadClaims] = useState<RewardNotificationItem[]>([]);
	const [loading, setLoading] = useState(false);
	const abortRef = useRef<AbortController | null>(null);

	const refresh = useCallback(async () => {
		if (!enabled) {
			setUnreadClaims([]);
			return;
		}

		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setLoading(true);
		try {
			const res = await fetch(`/api/routes/rewards?${PENDING_QUERY}`, {
				signal: controller.signal,
			});
			if (!res.ok) return;
			const json = await res.json();
			const rows = (json.data ?? []) as RewardClaimRow[];
			setUnreadClaims(toUnread(rows).slice(0, LIST_LIMIT));
		} catch (err) {
			if (err instanceof DOMException && err.name === 'AbortError') return;
		} finally {
			if (!controller.signal.aborted) setLoading(false);
		}
	}, [enabled]);

	useEffect(() => {
		if (!enabled) {
			setUnreadClaims([]);
			return;
		}

		const cancelDefer = scheduleDeferred(() => {
			void refresh();
		});

		const onReadUpdated = () => {
			void refresh();
		};
		const onStorage = (e: StorageEvent) => {
			if (e.key?.startsWith('kabbik_rewards_read_claim_ids_')) onReadUpdated();
		};
		const onVisibility = () => {
			if (!document.hidden) void refresh();
		};

		window.addEventListener(REWARDS_READ_UPDATED, onReadUpdated);
		window.addEventListener('storage', onStorage);
		document.addEventListener('visibilitychange', onVisibility);

		const interval = window.setInterval(() => {
			if (!document.hidden) void refresh();
		}, POLL_MS);

		return () => {
			cancelDefer();
			abortRef.current?.abort();
			window.clearInterval(interval);
			window.removeEventListener(REWARDS_READ_UPDATED, onReadUpdated);
			window.removeEventListener('storage', onStorage);
			document.removeEventListener('visibilitychange', onVisibility);
		};
	}, [enabled, refresh]);

	return {
		unreadClaims,
		unreadCount: unreadClaims.length,
		loading,
		refresh,
	};
}
