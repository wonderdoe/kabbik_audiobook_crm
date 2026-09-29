import { NextResponse } from 'next/server';
import TrackUserSignUpController from '../../controllers/track-user-sign-up-controller'

export const dynamic = 'force-dynamic';

export async function POST(){
   
    try {
        const data =await TrackUserSignUpController.getLastSevenDaysList()
        if (data) {
            return NextResponse.json(data)       
    }
    } catch (error) {
        return NextResponse.json({
            message:error
        },
        
        {
            status:500
        })
    }
   
}


