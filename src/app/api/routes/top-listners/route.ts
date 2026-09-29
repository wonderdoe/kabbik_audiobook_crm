import { NextRequest, NextResponse } from 'next/server';
import TopListnerController from '../../controllers/top-listners';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    
    const startDate = req.nextUrl.searchParams.get('startDate');
	const endDate = req.nextUrl.searchParams.get('endDate');
    const limit = req.nextUrl.searchParams.get('limit');
    const promo_code = req.nextUrl.searchParams.get('promo_code');
    
    try {
        const data = await TopListnerController.getTopListners(startDate,endDate,limit,promo_code);
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                message: error,
            },
            {
                status: 500,
            },
        );
    }
}
