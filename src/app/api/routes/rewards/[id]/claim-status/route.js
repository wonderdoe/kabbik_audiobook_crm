import { NextResponse } from 'next/server';
import rewardsController from '../../../../controllers/rewards-controller';
import {
	parseClaimStatusBody,
	parseRewardsIdParam,
} from '../../../../utils/rewards-query-schema';

export const dynamic = 'force-dynamic';

export async function PATCH(req, { params }) {
	try {
		const idParsed = parseRewardsIdParam(params.id);
		if (idParsed.error) {
			return NextResponse.json({ message: idParsed.error }, { status: 400 });
		}

		let body;
		try {
			body = await req.json();
		} catch {
			return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
		}

		const bodyParsed = parseClaimStatusBody(body);
		if (bodyParsed.error) {
			return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
		}

		const data = await rewardsController.updateClaimStatus(
			idParsed.id,
			bodyParsed.claimStatus,
		);

		if (!data) {
			return NextResponse.json({ message: 'Claim not found' }, { status: 404 });
		}

		return NextResponse.json({
			message: 'Claim status updated',
			claim: data.claim,
			otherClaims: data.otherClaims,
		});
	} catch (error) {
		console.error('[rewards claim-status PATCH]', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
