import { ensureRedisReady, redis } from '../config/redis.js';

const enabled = () => process.env.CACHE_ENABLED !== 'false';

/** Redis key retention; logical freshness uses `freshUntil` inside the envelope. */
export const CACHE_HARD_TTL_SECONDS = 86400;

/** Holder lock TTL for cache miss / stale refresh (heavy report loaders can run minutes). */
const LOCK_TTL_SECONDS = 300;
const MISS_WAIT_ITERATIONS = 60;
const MISS_WAIT_MS = 1000;

export class CacheStampedeError extends Error {
	constructor(key) {
		super(`Cache populate in progress for ${key}`);
		this.name = 'CacheStampedeError';
		this.key = key;
	}
}

const LOG_HITS = () => process.env.CACHE_LOG_HITS === '1';

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function wrapPayload(payload, freshTtlSeconds) {
	return {
		payload,
		freshUntil: Date.now() + freshTtlSeconds * 1000,
	};
}

function normalizeEntry(parsed) {
	if (
		parsed &&
		typeof parsed === 'object' &&
		'payload' in parsed &&
		typeof parsed.freshUntil === 'number'
	) {
		return parsed;
	}
	return { payload: parsed, freshUntil: 0 };
}

export async function cacheGetEntry(key) {
	if (!enabled()) return null;
	try {
		if (!(await ensureRedisReady())) {
			console.warn('[cache] get skipped (redis not ready)', key);
			return null;
		}
		const raw = await redis.get(key);
		if (!raw) {
			if (LOG_HITS()) console.log('[cache] MISS', key);
			return null;
		}
		const entry = normalizeEntry(JSON.parse(raw));
		const isFresh = entry.freshUntil > Date.now();
		if (LOG_HITS()) console.log('[cache]', isFresh ? 'HIT' : 'STALE', key);
		return { ...entry, isFresh };
	} catch (e) {
		console.warn('[cache] get failed', key, e?.message || e);
		return null;
	}
}

export async function cacheGet(key) {
	const entry = await cacheGetEntry(key);
	return entry ? entry.payload : null;
}

export async function cacheSet(key, value, freshTtlSeconds) {
	if (!enabled()) return;
	try {
		if (!(await ensureRedisReady())) {
			console.warn('[cache] set skipped (redis not ready)', key);
			return;
		}
		const envelope = wrapPayload(value, freshTtlSeconds);
		await redis.set(key, JSON.stringify(envelope), 'EX', CACHE_HARD_TTL_SECONDS);
	} catch (e) {
		console.warn('[cache] set failed', key, e?.message || e);
	}
}

export async function getOrSet(key, freshTtlSeconds, loader) {
	const entry = await cacheGetEntry(key);
	if (entry?.isFresh) return entry.payload;

	const fresh = await loader();
	await cacheSet(key, fresh, freshTtlSeconds);
	return fresh;
}

async function refreshUnderLock(key, freshTtlSeconds, loader) {
	let locked = false;
	try {
		if (await ensureRedisReady()) {
			locked = (await redis.set(`lock:${key}`, '1', 'EX', LOCK_TTL_SECONDS, 'NX')) === 'OK';
		}
	} catch (e) {
		console.warn('[cache] refresh lock failed', key, e?.message || e);
	}
	if (!locked) return;
	try {
		const fresh = await loader();
		await cacheSet(key, fresh, freshTtlSeconds);
	} catch (e) {
		console.warn('[cache] background refresh failed', key, e?.message || e);
	} finally {
		if (locked) {
			try {
				await redis.del(`lock:${key}`);
			} catch {
				/* ignore */
			}
		}
	}
}

function triggerStaleRefresh(key, freshTtlSeconds, loader) {
	void refreshUnderLock(key, freshTtlSeconds, loader);
}

/** Prevents cache stampede; serves stale payload while revalidating in background. */
export async function getOrSetLocked(key, freshTtlSeconds, loader) {
	const entry = await cacheGetEntry(key);
	if (entry?.isFresh) return entry.payload;
	if (entry && !entry.isFresh) {
		triggerStaleRefresh(key, freshTtlSeconds, loader);
		return entry.payload;
	}

	let locked = false;
	try {
		if (await ensureRedisReady()) {
			locked = (await redis.set(`lock:${key}`, '1', 'EX', LOCK_TTL_SECONDS, 'NX')) === 'OK';
		}
	} catch (e) {
		console.warn('[cache] lock failed', key, e?.message || e);
	}

	if (!locked) {
		if (!(await ensureRedisReady())) {
			console.warn('[cache] redis unavailable (loader)', key);
			const fresh = await loader();
			await cacheSet(key, fresh, freshTtlSeconds);
			return fresh;
		}
		for (let i = 0; i < MISS_WAIT_ITERATIONS; i += 1) {
			await sleep(MISS_WAIT_MS);
			const retry = await cacheGetEntry(key);
			if (retry?.isFresh) return retry.payload;
			if (retry && !retry.isFresh) {
				triggerStaleRefresh(key, freshTtlSeconds, loader);
				return retry.payload;
			}
		}
		const lastChance = await cacheGetEntry(key);
		if (lastChance?.isFresh) return lastChance.payload;
		if (lastChance && !lastChance.isFresh) {
			triggerStaleRefresh(key, freshTtlSeconds, loader);
			return lastChance.payload;
		}
		console.warn('[cache] populate wait timeout', key);
		throw new CacheStampedeError(key);
	}

	try {
		const fresh = await loader();
		await cacheSet(key, fresh, freshTtlSeconds);
		return fresh;
	} finally {
		if (locked) {
			try {
				await redis.del(`lock:${key}`);
			} catch {
				/* ignore */
			}
		}
	}
}
