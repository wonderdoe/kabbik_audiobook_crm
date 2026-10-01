import { NextResponse } from 'next/server';

import publisherController from '../../controllers/publisher.controller';

export const dynamic = 'force-dynamic';

export async function GET() {
	try {
		const data = await publisherController.getPublisherName();
		return NextResponse.json(data ?? []);
	} catch (error) {
		console.error('[publisher-name GET]', error);
		return NextResponse.json(
			{ message: error?.message ?? 'Internal server error' },
			{ status: 500 },
		);
	}
}
