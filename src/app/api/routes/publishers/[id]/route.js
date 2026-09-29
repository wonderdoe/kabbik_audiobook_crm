import { NextResponse } from 'next/server';

import publisherController from '../../../controllers/publisher.controller';

export const dynamic = 'force-dynamic';

export async function POST(req,{params}){
    const  {id} = params

    let passedValue = await new NextResponse(req.body).text();
    let bodyreq = JSON.parse(passedValue);
    const {full_name,en_name,email,address,phone,imageUrl} = bodyreq

	
    
    try {
        const data =await publisherController.getPublisherDetails(id,full_name,en_name,email,address,phone,imageUrl)
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


