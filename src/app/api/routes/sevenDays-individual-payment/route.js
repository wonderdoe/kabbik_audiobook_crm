import { NextResponse } from 'next/server';
import RevenueController from '../../controllers/revenue-controller'

export const dynamic = 'force-dynamic';

export async function POST(req){
    const item =  req.nextUrl.searchParams.get('created_at')
  
    try {
        const data =await RevenueController.individualPaymentGateway(item)
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


