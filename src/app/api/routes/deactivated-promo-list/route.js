// 

import { NextResponse } from 'next/server';
import PromoController from '../../controllers/promocode-controller'

export const dynamic = 'force-dynamic';

export async function GET(){
   
    try {
        const data =await PromoController.deactivatedPromo()
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