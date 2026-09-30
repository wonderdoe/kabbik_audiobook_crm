import { NextResponse } from 'next/server';
import rewardsController from '../../../controllers/rewards-controller';
import { parseRewardsIdParam } from '../../../utils/rewards-query-schema';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
	try {
		const parsed = parseRewardsIdParam(params.id);
		if (parsed.error) {
			return NextResponse.json({ message: parsed.error }, { status: 400 });
		}

		const data = await rewardsController.getClaimById(parsed.id);
		if (!data) {
			return NextResponse.json({ message: 'Claim not found' }, { status: 404 });
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error('[rewards id GET]', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
