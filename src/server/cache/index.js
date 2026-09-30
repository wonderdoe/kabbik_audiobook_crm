import { ensureRedisReady, redis } from '../config/redis.js';

const enabled = () => process.env.CACHE_ENABLED !== 'false';

export async function cacheGet(key) {
	if (!enabled()) return null;
	try {
		if (!(await ensureRedisReady())) return null;
		const v = await redis.get(key);
		return v ? JSON.parse(v) : null;
	} catch {
		return null;
	}
}

export async function cacheSet(key, value, ttlSeconds) {
	if (!enabled()) return;
	try {
		if (!(await ensureRedisReady())) return;
		await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
	} catch {
		/* fail open */
	}
}

export async function getOrSet(key, ttlSeconds, loader) {
	const hit = await cacheGet(key);
	if (hit !== null) return hit;
	const fresh = await loader();
	await cacheSet(key, fresh, ttlSeconds);
	return fresh;
}

/** Prevents cache stampede on hot keys */
export async function getOrSetLocked(key, ttlSeconds, loader) {
	const hit = await cacheGet(key);
	if (hit !== null) return hit;
	let locked = false;
	try {
		if (await ensureRedisReady()) {
			locked = (await redis.set(`lock:${key}`, '1', 'EX', 10, 'NX')) === 'OK';
		}
	} catch {
		/* fail open */
	}
	if (!locked) {
		await new Promise(r => setTimeout(r, 150));
		const retry = await cacheGet(key);
		if (retry !== null) return retry;
	}
	const fresh = await loader();
	await cacheSet(key, fresh, ttlSeconds);
	return fresh;
}
