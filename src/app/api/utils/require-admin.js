import { NextResponse } from 'next/server';
import { tokenFromRequest } from '../../../server/auth/admin-token.js';
import { decodeJwtAccessToken } from './jwt.js';

export function getAdminFromRequest(req) {
	const token = tokenFromRequest(req);
	if (!token) return null;
	const payload = decodeJwtAccessToken(token);
	if (!payload?.id) return null;
	return payload;
}

export function unauthorizedResponse() {
	return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
}
