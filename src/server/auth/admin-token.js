import { decodeJwtAccessToken } from '../../app/api/utils/jwt.js';

export function tokenFromRequest(req) {
	const auth = req.headers.get?.('authorization');
	if (auth?.startsWith('Bearer ')) {
		return auth.slice(7).trim();
	}
	const cookie = req.headers.get?.('cookie') || '';
	const match = cookie.match(/(?:^|;\s*)admin_token=([^;]+)/);
	return match ? decodeURIComponent(match[1]) : null;
}

export function hasPermission(req, permissionName) {
	if (!permissionName) return true;
	const token = tokenFromRequest(req);
	if (!token) return false;
	const payload = decodeJwtAccessToken(token);
	if (!payload?.userPermissions) return false;
	return payload.userPermissions.includes(permissionName);
}
