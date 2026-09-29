import { NextResponse } from 'next/server';
import UserAdminController from '../../controllers/useradmin-controller';

export const dynamic = 'force-dynamic';

export async function GET(){
   
    try {
        const data =await UserAdminController.getUser()
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


