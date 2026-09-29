import { NextResponse } from 'next/server';
import CategotyController from '../../controllers/category-controller'

export const dynamic = 'force-dynamic';

export async function POST(req){
    let passedValue = await new NextResponse(req.body).text();
    let bodyreq = JSON.parse(passedValue);
    const {id,priority} = bodyreq
	
  
    try {
        const data =await CategotyController.priorityUpdate(id,priority)
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