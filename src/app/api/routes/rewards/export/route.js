import { NextResponse } from 'next/server';
import rewardsController from '../../../controllers/rewards-controller';
import { parseRewardsListParams } from '../../../utils/rewards-query-schema';

export const dynamic = 'force-dynamic';

const CSV_HEADERS = [
	'id',
	'user_id',
	'full_name',
	'user_name',
	'user_email',
	'phone_no',
	'city',
	'tier_name',
	'reward_name',
	'offer',
	'usage_point',
	'claim_status',
	'status',
	'is_used',
	'expire_at',
	'created_at',
];

function escapeCsvCell(value) {
	if (value === null || value === undefined) return '""';
	const str = String(value).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
	return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(req) {
	try {
		const parsed = parseRewardsListParams(req.nextUrl.searchParams, { maxPageSize: 10000 });
		if (parsed.error) {
			return NextResponse.json({ message: 'Invalid query parameters' }, { status: 400 });
		}

		const { params } = parsed;
		params.page = 1;
		params.pageSize = 10000;

		const result = await rewardsController.getClaims(params);
		const lines = [CSV_HEADERS.join(',')];

		for (const row of result.data) {
			const deletedSuffix = row.user_deleted ? ' (deleted)' : '';
			const cells = [
				row.id,
				row.user_id,
				`${row.full_name || ''}${deletedSuffix}`,
				row.user_name,
				row.user_email,
				row.phone_no,
				row.city,
				row.tier_name || row.tier_id,
				row.reward_name || row.reward_id,
				row.offer,
				row.usage_point,
				row.claim_status,
				row.status,
				row.is_used,
				row.expire_at,
				row.created_at,
			];
			lines.push(cells.map(escapeCsvCell).join(','));
		}

		const csv = lines.join('\n');
		return new NextResponse(csv, {
			status: 200,
			headers: {
				'Content-Type': 'text/csv; charset=utf-8',
				'Content-Disposition': 'attachment; filename="rewards-export.csv"',
			},
		});
	} catch (error) {
		console.error('[rewards export GET]', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
