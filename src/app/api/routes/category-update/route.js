import { NextResponse } from 'next/server';
import CategotyController from '../../controllers/category-controller'
export const dynamic = 'force-dynamic';

export async function POST(req){
    let passedValue = await new NextResponse(req.body).text();
    let bodyreq = JSON.parse(passedValue);
    const {id,name,thumb_path} = bodyreq
	
  
    try {
        const data =await CategotyController.categotyUpdate(id,name,thumb_path)
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

// 

export async function DELETE(req){
    let passedValue = await new NextResponse(req.body).text();
    let bodyreq = JSON.parse(passedValue);
    const {id} = bodyreq
	
   
    try {
        const data =await CategotyController.categoryDelete(id)
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






