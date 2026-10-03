import { cacheGet, getOrSetLocked } from '../cache/index.js';

export const USD_BDT_CACHE_KEY = 'fx:usd:bdt:v1';

const DEFAULT_FALLBACK = 121.14;
const MIN_RATE = 50;
const MAX_RATE = 500;
const DEFAULT_CACHE_TTL_SECONDS = 3600;

/** When Redis is down, avoid refetching on every SQL report. */
let memoryCache = null;

/**
 * @param {unknown} value
 * @returns {number | null}
 */
export function normalizeUsdBdtRate(value) {
	const n = typeof value === 'string' ? parseFloat(value) : Number(value);
	if (!Number.isFinite(n) || n < MIN_RATE || n > MAX_RATE) return null;
	return Math.round(n * 100) / 100;
}

/**
 * @param {number} usd
 * @param {number} rate
 */
export function usdToBdt(usd, rate) {
	const r = normalizeUsdBdtRate(rate);
	if (r == null) return Math.round(Number(usd) * DEFAULT_FALLBACK);
	return Math.round(Number(usd) * r);
}

/** Numeric literal safe to embed in SQL (no user input). */
export function sqlUsdBdtRateLiteral(rate) {
	const n = normalizeUsdBdtRate(rate);
	if (n == null) throw new Error('Invalid USD/BDT rate for SQL');
	return String(n);
}

async function fetchUsdBdtFromApi() {
	const url = process.env.USD_BDT_API_URL || 'https://open.er-api.com/v6/latest/USD';
	const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
	if (!res.ok) {
		throw new Error(`USD/BDT API HTTP ${res.status}`);
	}
	const data = await res.json();
	const rate = normalizeUsdBdtRate(data?.rates?.BDT);
	if (rate == null) {
		throw new Error('USD/BDT API response missing BDT rate');
	}
	return {
		rate,
		updatedAt: data.time_last_update_utc || new Date().toISOString(),
		source: 'open.er-api.com',
	};
}

function fallbackRatePayload() {
	const fromEnv = normalizeUsdBdtRate(process.env.USD_BDT_FALLBACK);
	return {
		rate: fromEnv ?? DEFAULT_FALLBACK,
		updatedAt: null,
		source: 'fallback',
	};
}

/**
 * Current USD → BDT rate for IAP/Stripe SQL conversions.
 * @returns {Promise<{ rate: number, updatedAt: string | null, source: string }>}
 */
export async function getUsdToBdtRate() {
	const envFixed = normalizeUsdBdtRate(process.env.USD_BDT_RATE);
	if (envFixed != null) {
		return { rate: envFixed, updatedAt: null, source: 'env:USD_BDT_RATE' };
	}

	const ttl =
		Number(process.env.USD_BDT_CACHE_TTL_SECONDS) || DEFAULT_CACHE_TTL_SECONDS;

	if (memoryCache && memoryCache.expiresAt > Date.now()) {
		return memoryCache.payload;
	}

	try {
		const cached = await cacheGet(USD_BDT_CACHE_KEY);
		if (cached?.rate != null) {
			const rate = normalizeUsdBdtRate(cached.rate);
			if (rate != null) return { ...cached, rate };
		}

		const payload = await getOrSetLocked(
			USD_BDT_CACHE_KEY,
			ttl,
			async () => {
				try {
					return await fetchUsdBdtFromApi();
				} catch (e) {
					console.warn('[usd-bdt-rate] live fetch failed', e?.message || e);
					return fallbackRatePayload();
				}
			},
			{ lockTtlSeconds: 60, maxWaitMs: 20_000 },
		);
		memoryCache = { payload, expiresAt: Date.now() + ttl * 1000 };
		return payload;
	} catch (e) {
		console.warn('[usd-bdt-rate] cache path failed', e?.message || e);
		const payload = fallbackRatePayload();
		memoryCache = { payload, expiresAt: Date.now() + ttl * 1000 };
		return payload;
	}
}

/** @returns {Promise<number>} */
export async function getUsdToBdtRateNumber() {
	const { rate } = await getUsdToBdtRate();
	return rate;
}
