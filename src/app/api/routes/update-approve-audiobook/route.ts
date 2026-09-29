import { NextRequest, NextResponse } from 'next/server';
import audiobookController from '../../controllers/audiobook-controller';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
	try {
		const audiobookId = req.nextUrl.searchParams.get('audiobookId');
		const action = req.nextUrl.searchParams.get('action');
		const data = await audiobookController.updateApprovalStatus(audiobookId, action);
		if (data) {
			return NextResponse.json(data);
		}
		return NextResponse.json({ error: 'Could not update' }, { status: 500 });
	} catch (err) {
		console.error(err);
		return NextResponse.json({ error: 'Could not update' }, { status: 500 });
	}
}
