import { NextResponse } from 'next/server';
import authorController from '../../controllers/author.controller';

export const dynamic = 'force-dynamic';

export async function GET() {
	try {
		const data = await authorController.getAuthorList();
		return NextResponse.json(data ?? []);
	} catch (error) {
		console.error('[author-name GET]', error);
		return NextResponse.json(
			{ message: error?.message ?? 'Internal server error' },
			{ status: 500 },
		);
	}
}
