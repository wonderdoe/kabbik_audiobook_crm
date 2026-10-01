import Redis from 'ioredis';

function buildRedisOptions() {
	const env = process.env.REDIS_ENV === 'production' ? 'production' : 'staging';

	if (env === 'production') {
		const password = process.env.REDIS_PASSWORD;
		const username = process.env.REDIS_USERNAME || 'default';
		return {
			host: process.env.REDIS_HOST,
			port: Number(process.env.REDIS_PORT) || 25061,
			username,
			password,
			db: Number(process.env.REDIS_DB) || 0,
			tls: {},
			maxRetriesPerRequest: 2,
			enableOfflineQueue: false,
			lazyConnect: false,
		};
	}

	const password = process.env.REDIS_STAGING_PASSWORD;
	return {
		host: process.env.REDIS_STAGING_HOST || '127.0.0.1',
		port: Number(process.env.REDIS_STAGING_PORT) || 6379,
		...(password ? { password } : {}),
		db: Number(process.env.REDIS_STAGING_DB) || 0,
		maxRetriesPerRequest: 2,
		enableOfflineQueue: false,
		lazyConnect: false,
	};
}

const g = globalThis;

function createClient() {
	return new Redis(buildRedisOptions());
}

export const redis = g.__redis ?? createClient();

if (process.env.NODE_ENV !== 'production') {
	g.__redis = redis;
}

redis.on('error', e => console.error('[redis]', e.message));

export async function ensureRedisReady() {
	if (redis.status === 'ready') return true;
	if (redis.status === 'connecting' || redis.status === 'reconnecting') {
		try {
			await new Promise((resolve, reject) => {
				const timeout = setTimeout(() => {
					cleanup();
					reject(new Error('redis connect timeout'));
				}, 5000);
				const onReady = () => {
					cleanup();
					resolve();
				};
				const onError = err => {
					cleanup();
					reject(err);
				};
				const cleanup = () => {
					clearTimeout(timeout);
					redis.off('ready', onReady);
					redis.off('error', onError);
				};
				redis.once('ready', onReady);
				redis.once('error', onError);
			});
			return true;
		} catch {
			return false;
		}
	}
	try {
		await redis.connect();
		return true;
	} catch {
		return false;
	}
}
