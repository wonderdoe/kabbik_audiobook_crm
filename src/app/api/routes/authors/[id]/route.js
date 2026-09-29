

import { NextResponse } from 'next/server';
import authorController from '../../../controllers/author.controller';

export const dynamic = 'force-dynamic';

export async function POST(req,{params}){
    const {id} = params
    let passedValue = await new NextResponse(req.body).text();
    let bodyreq = JSON.parse(passedValue);
    
    const {name, description, imageUrl, en_name} = bodyreq
    try {
        const data =await authorController.editAuthor(name, description, imageUrl, en_name,id)
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