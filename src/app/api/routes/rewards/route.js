import { NextResponse } from 'next/server';
import rewardsController from '../../controllers/rewards-controller';
import { parseRewardsListParams } from '../../utils/rewards-query-schema';

export const dynamic = 'force-dynamic';

export async function GET(req) {
	try {
		const parsed = parseRewardsListParams(req.nextUrl.searchParams);
		if (parsed.error) {
			return NextResponse.json({ message: 'Invalid query parameters' }, { status: 400 });
		}

		const { params } = parsed;

		if (params.type === 'summary') {
			const summary = await rewardsController.getSummary(params);
			return NextResponse.json({ summary });
		}

		if (params.type === 'filters') {
			const filters = await rewardsController.getFilterOptions();
			return NextResponse.json({ filters });
		}

		const result = await rewardsController.getClaims(params);
		return NextResponse.json(result);
	} catch (error) {
		console.error('[rewards GET]', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
