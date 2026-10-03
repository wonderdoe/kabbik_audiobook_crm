import {
	CreateInvalidationCommand,
	CloudFrontClient,
} from '@aws-sdk/client-cloudfront';
import {
	GetObjectCommand,
	ListObjectVersionsCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { objectKeyForPlatform, validateMaintenanceStorageConfig, getMaintenanceBucketDefault, getMaintenanceS3Endpoint, getMaintenanceKeyPrefix } from './maintenance-config.js';
import { parsePublicDocumentJson } from './maintenance-json.js';

let s3Client;
let cloudFrontClient;

function assertConfigured() {
	const check = validateMaintenanceStorageConfig();
	if (!check.ok) {
		const err = new Error(check.message);
		err.code = 'MAINTENANCE_NOT_CONFIGURED';
		throw err;
	}
}

function getS3Client() {
	assertConfigured();
	if (!s3Client) {
		const endpoint = getMaintenanceS3Endpoint();
		const forcePathStyle =
			process.env.MAINTENANCE_FORCE_PATH_STYLE === 'true' ||
			process.env.MAINTENANCE_FORCE_PATH_STYLE === '1';
		s3Client = new S3Client({
			region: process.env.MAINTENANCE_REGION,
			credentials: {
				accessKeyId: process.env.MAINTENANCE_WRITE_KEY_ID,
				secretAccessKey: process.env.MAINTENANCE_WRITE_SECRET,
			},
			...(endpoint ? { endpoint, forcePathStyle } : {}),
		});
	}
	return s3Client;
}

function maintenanceBucket() {
	return getMaintenanceBucketDefault();
}

function getCloudFrontClient() {
	if (!process.env.MAINTENANCE_CDN_DISTRIBUTION_ID?.trim()) return null;
	if (!cloudFrontClient) {
		cloudFrontClient = new CloudFrontClient({
			region: process.env.MAINTENANCE_REGION,
			credentials: {
				accessKeyId: process.env.MAINTENANCE_WRITE_KEY_ID,
				secretAccessKey: process.env.MAINTENANCE_WRITE_SECRET,
			},
		});
	}
	return cloudFrontClient;
}

async function streamToString(stream) {
	const chunks = [];
	for await (const chunk of stream) {
		chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
	}
	return Buffer.concat(chunks).toString('utf8');
}

export async function getObject(platform) {
	const client = getS3Client();
	const Key = objectKeyForPlatform(platform);
	const response = await client.send(
		new GetObjectCommand({
			Bucket: maintenanceBucket(),
			Key,
		}),
	);
	const body = await streamToString(response.Body);
	const parsed = parsePublicDocumentJson(body, platform);
	if (parsed.error) {
		const err = new Error(parsed.error);
		err.code = 'MAINTENANCE_INVALID_OBJECT';
		throw err;
	}
	return {
		document: parsed.document,
		etag: response.ETag?.replace(/^"|"$/g, '') ?? null,
		versionId: response.VersionId ?? null,
	};
}

export async function getObjectVersion(platform, versionId) {
	const client = getS3Client();
	const Key = objectKeyForPlatform(platform);
	const response = await client.send(
		new GetObjectCommand({
			Bucket: maintenanceBucket(),
			Key,
			VersionId: versionId,
		}),
	);
	const body = await streamToString(response.Body);
	const parsed = parsePublicDocumentJson(body, platform);
	if (parsed.error) {
		const err = new Error(parsed.error);
		err.code = 'MAINTENANCE_INVALID_OBJECT';
		throw err;
	}
	return {
		document: parsed.document,
		etag: response.ETag?.replace(/^"|"$/g, '') ?? null,
		versionId: response.VersionId ?? versionId,
	};
}

export async function putObject(platform, document, { ifMatch } = {}) {
	const client = getS3Client();
	const Key = objectKeyForPlatform(platform);
	const body = JSON.stringify(document);
	const baseParams = {
		Bucket: maintenanceBucket(),
		Key,
		Body: body,
		ContentType: 'application/json',
		CacheControl: 'public, max-age=15',
		...(ifMatch ? { IfMatch: ifMatch.startsWith('"') ? ifMatch : `"${ifMatch}"` } : {}),
	};

	const sendPut = extra => client.send(new PutObjectCommand({ ...baseParams, ...extra }));

	try {
		let response;
		try {
			// Required for DigitalOcean CDN/public GET; manual uploads are often public, API puts default private.
			response = await sendPut({ ACL: 'public-read' });
		} catch (aclError) {
			const aclCode = aclError.Code ?? aclError.name;
			if (
				aclCode === 'AccessControlListNotSupported' ||
				aclCode === 'InvalidArgument' ||
				aclError.message?.includes('ACL')
			) {
				console.warn('[maintenance] public-read ACL rejected; ensure bucket policy allows public Get on prefix', Key);
				response = await sendPut({});
			} else {
				throw aclError;
			}
		}
		await maybeInvalidateCdn(platform);
		return {
			etag: response.ETag?.replace(/^"|"$/g, '') ?? null,
			versionId: response.VersionId ?? null,
		};
	} catch (error) {
		const code = error.Code ?? error.name;
		const status = error.$metadata?.httpStatusCode;
		if (
			code === 'PreconditionFailed' ||
			status === 412 ||
			status === 409
		) {
			return { conflict: true };
		}
		throw error;
	}
}

async function maybeInvalidateCdn(platform) {
	const distributionId = process.env.MAINTENANCE_CDN_DISTRIBUTION_ID?.trim();
	if (!distributionId) return;
	const cf = getCloudFrontClient();
	if (!cf) return;
	const prefix = getMaintenanceKeyPrefix();
	const path = `/${prefix}/${platform}.json`;
	try {
		await cf.send(
			new CreateInvalidationCommand({
				DistributionId: distributionId,
				InvalidationBatch: {
					CallerReference: `${platform}-${Date.now()}`,
					Paths: {
						Quantity: 1,
						Items: [path],
					},
				},
			}),
		);
	} catch (error) {
		console.error('[maintenance] CDN invalidation failed', error);
	}
}

export async function listVersions(platform, limit = 20) {
	const client = getS3Client();
	const Key = objectKeyForPlatform(platform);
	const capped = Math.min(Math.max(1, limit), 20);
	const response = await client.send(
		new ListObjectVersionsCommand({
			Bucket: maintenanceBucket(),
			Prefix: Key,
			MaxKeys: capped,
		}),
	);
	const versions = (response.Versions ?? []).filter(v => v.Key === Key).slice(0, capped);
	const entries = [];
	for (const version of versions) {
		if (!version.VersionId) continue;
		try {
			const { document } = await getObjectVersion(platform, version.VersionId);
			entries.push({
				versionId: version.VersionId,
				isLatest: Boolean(version.IsLatest),
				document,
			});
		} catch (error) {
			console.error('[maintenance] skip version', version.VersionId, error);
		}
	}
	return entries;
}

export { validateMaintenanceStorageConfig };
