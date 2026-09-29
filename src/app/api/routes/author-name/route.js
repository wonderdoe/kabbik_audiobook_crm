import { NextResponse } from 'next/server';
import authorController from '../../controllers/author.controller';

export const dynamic = 'force-dynamic';

export async function GET(){
    
    try {
        const data =await authorController.getAuthorList()
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