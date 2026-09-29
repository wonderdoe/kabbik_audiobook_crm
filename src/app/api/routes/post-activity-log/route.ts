import { NextRequest, NextResponse } from 'next/server';
import ActivityLogController from '../../controllers/activity-log-controller';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    let passedValue = await new NextResponse(req.body).text();
    let bodyreq = JSON.parse(passedValue);
    const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0] || req.ip || 'Unknown';
  bodyreq.device_info=bodyreq.device_info + `,IP=${ip}`;
    try {
        const data = await ActivityLogController.createActivity(bodyreq);
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
