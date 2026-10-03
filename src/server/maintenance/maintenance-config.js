const PLATFORMS = ['app', 'website'];

export function getMaintenanceEnvironmentLabel() {
	const explicit = process.env.MAINTENANCE_ENV_LABEL?.trim();
	if (explicit) {
		return explicit.toUpperCase();
	}
	return process.env.REDIS_ENV === 'production' ? 'PRODUCTION' : 'STAGING';
}

export function getMaintenancePublicBaseUrl() {
	return process.env.MAINTENANCE_PUBLIC_BASE_URL?.replace(/\/$/, '') ?? '';
}

/** Map DO Spaces origin hostname to CDN hostname for anonymous client GET */
export function toDigitalOceanSpacesCdnUrl(url) {
	if (!url || url.includes('.cdn.digitaloceanspaces.com')) return url;
	if (url.includes('.digitaloceanspaces.com')) {
		return url.replace('.digitaloceanspaces.com', '.cdn.digitaloceanspaces.com');
	}
	return url;
}

/** CDN base for client URLs: {base}/{platform}.json — appends key prefix if omitted from env */
export function getMaintenancePublicReadBaseUrl() {
	let base = getMaintenancePublicBaseUrl();
	if (!base) return '';
	base = toDigitalOceanSpacesCdnUrl(base);
	const prefix = getMaintenanceKeyPrefix();
	const suffix = `/${prefix}`;
	if (base.endsWith(suffix) || base.endsWith(`/${prefix}`)) return base;
	return `${base}${suffix}`;
}

export function getMaintenanceKeyPrefix() {
	const prefix = process.env.MAINTENANCE_KEY_PREFIX?.trim();
	return prefix || 'kabbik-maintenance';
}

export function getMaintenanceBucketDefault() {
	return process.env.MAINTENANCE_BUCKET?.trim() || 'kabbik-space';
}

/** DigitalOcean Spaces endpoint from MAINTENANCE_S3_ENDPOINT or MAINTENANCE_REGION */
export function getMaintenanceS3Endpoint() {
	const explicit = process.env.MAINTENANCE_S3_ENDPOINT?.trim();
	if (explicit) return explicit;
	const region = process.env.MAINTENANCE_REGION?.trim();
	if (region) return `https://${region}.digitaloceanspaces.com`;
	return undefined;
}

export function objectKeyForPlatform(platform) {
	return `${getMaintenanceKeyPrefix()}/${platform}.json`;
}

export function validateMaintenanceStorageConfig() {
	const missing = [];
	if (!getMaintenanceBucketDefault()) missing.push('MAINTENANCE_BUCKET');
	if (!process.env.MAINTENANCE_REGION?.trim()) missing.push('MAINTENANCE_REGION');
	if (!process.env.MAINTENANCE_WRITE_KEY_ID?.trim()) missing.push('MAINTENANCE_WRITE_KEY_ID');
	if (!process.env.MAINTENANCE_WRITE_SECRET?.trim()) missing.push('MAINTENANCE_WRITE_SECRET');
	if (missing.length) {
		return {
			ok: false,
			message: `Maintenance storage is not configured (${missing.join(', ')})`,
		};
	}
	return { ok: true };
}

export { PLATFORMS };
