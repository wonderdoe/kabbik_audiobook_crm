import { NextResponse } from 'next/server';
import SponSponsorController from '../../controllers/sponsorList';

export const dynamic = 'force-dynamic';

export async function GET(req:any) {
    try {
         const { searchParams } = new URL(req.url);

        const page = searchParams.get('page');   // string | null
        const limit = searchParams.get('limit');

        const response = await SponSponsorController.getSponsor(page,limit);
        return NextResponse.json({ response });
    } catch (error) {
        return NextResponse.json(
            {
                error,
            },
            {
                status: 500,
            },
        );
    }
}

export async function Patch(req:any) {
    let deleted = req.body.deleted;
    let checked= req.body.checked;
    let id=req.body.id;
    try {
        const data = await SponSponsorController.updateSponsor(id, deleted,checked);
        
        return NextResponse.json({ message: 'Subscription failed' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
