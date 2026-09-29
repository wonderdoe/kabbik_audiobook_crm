
import { NextResponse } from 'next/server';
import PromoController from '../../controllers/promocode-controller'

export const dynamic = 'force-dynamic';
export async function POST(req) {
	
	let passedValue = await new NextResponse(req.body).text();
    let bodyreq = JSON.parse(passedValue);
	
     const {promocode, for_package,reduce_price,promo_type,bank_name} = bodyreq
	
	
	try {
		const data = await PromoController.addPromo(promocode, for_package,reduce_price,promo_type,bank_name);
		if (data) {
			return NextResponse.json(data);
		}
	} catch (error) {
		return NextResponse.json(
			{
				message: error,
			},

			{
				status: 500,
			},
		);
	}
}