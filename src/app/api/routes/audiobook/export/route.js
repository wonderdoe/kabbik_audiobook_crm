import { NextResponse } from 'next/server';
import AudioBookController from '../../../controllers/audiobook-controller';
import { parseAudiobookListParams } from '../../../utils/audiobook-query-schema';

export const dynamic = 'force-dynamic';

const CSV_HEADERS = [
	'id',
	'name',
	'en_name',
	'price',
	'play_count',
	'mybl_play_count',
	'author_name',
	'premium',
	'for_home',
	'for_rent',
	'isSubRestricted',
	'approval_status',
	'podcast',
	'bgm_episode_count',
	'total_episode_count',
	'has_bgm',
	'created_at',
];

function escapeCsvCell(value) {
	if (value === null || value === undefined) return '""';
	const str = String(value).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
	return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(req) {
	try {
		const searchParams = Object.fromEntries(req.nextUrl.searchParams);
		const parsed = parseAudiobookListParams(searchParams, { forExport: true });
		if (parsed.error) {
			return NextResponse.json({ message: 'Invalid query parameters' }, { status: 400 });
		}

		const { data, total, capped } = await AudioBookController.exportAudioList(searchParams);
		const lines = [CSV_HEADERS.join(',')];

		if (total === 0) {
			const csv = lines.join('\n');
			return new NextResponse(csv, {
				status: 200,
				headers: {
					'Content-Type': 'text/csv; charset=utf-8',
					'Content-Disposition': `attachment; filename="audiobooks-${parsed.filters.tab}-empty.csv"`,
					'X-Export-Row-Count': '0',
				},
			});
		}

		for (const row of data) {
			const bgmCount = Number(row.bgm_episode_count) || 0;
			const totalEpisodes = Number(row.total_episode_count) || 0;
			const cells = [
				row.id,
				row.name,
				row.en_name,
				row.price,
				row.play_count ?? 0,
				row.mybl_play_count ?? 0,
				row.author_name,
				row.premium,
				row.for_home,
				row.for_rent,
				row.isSubRestricted,
				row.approval_status,
				row.podcast,
				bgmCount,
				totalEpisodes,
				bgmCount > 0 ? 'yes' : 'no',
				row.created_at,
			];
			lines.push(cells.map(escapeCsvCell).join(','));
		}

		if (capped) {
			lines.push(
				escapeCsvCell(
					'Warning: export capped at 10000 rows; apply filters to narrow results.',
				),
			);
		}

		const dateStamp = new Date().toISOString().slice(0, 10);
		const csv = lines.join('\n');
		return new NextResponse(csv, {
			status: 200,
			headers: {
				'Content-Type': 'text/csv; charset=utf-8',
				'Content-Disposition': `attachment; filename="audiobooks-${parsed.filters.tab}-${dateStamp}.csv"`,
				'X-Export-Row-Count': String(data.length),
			},
		});
	} catch (error) {
		console.error('[audiobook export GET]', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
