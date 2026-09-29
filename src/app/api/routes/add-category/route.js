import { NextResponse } from 'next/server';
import CategotyController from '../../controllers/category-controller'

export const dynamic = 'force-dynamic';

export async function POST(req){
    let passedValue = await new NextResponse(req.body).text();
    let bodyreq = JSON.parse(passedValue);
    const {name,priority,thumb_path} = bodyreq
	
    try {
        const data =await CategotyController.categotyAdd(name,thumb_path,priority)
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


