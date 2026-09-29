import { NextRequest, NextResponse } from 'next/server';
import SubscriptionUserController from '../../controllers/subscription-user-controller';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const isActive = req.nextUrl.searchParams.get('isActive');
    const isUnique = req.nextUrl.searchParams.get('isUnique') ;
    try {
        const data = await SubscriptionUserController.getRentCount({isActive,isUnique});
        return NextResponse.json(data);
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
