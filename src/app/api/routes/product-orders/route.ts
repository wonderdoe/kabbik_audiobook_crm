import { NextRequest, NextResponse } from 'next/server';
import ProductOrderController from '../../controllers/product-order-controller';

export const dynamic = 'force-dynamic';

export async function GET() {
	try {
		const productOrders = await ProductOrderController.getProductOrders();
		// if (productOrders.code) {
		// 	return NextResponse.json({ message: productOrders.code }, { status: 500 });
		// }
		return NextResponse.json(productOrders);
	} catch (err) {
		console.error(err);
		return NextResponse.json({ message: err }, { status: 500 });
	}
}

export async function PUT(req: NextRequest) {
	try {
		const bodyText = await new NextResponse(req.body).text();
		const bodyJSON = JSON.parse(bodyText);
		const updatedDeliveryStatus = await ProductOrderController.updateDeliveryStatus(bodyJSON);
		return NextResponse.json(updatedDeliveryStatus);
	} catch (err) {
		console.error(err);
		return NextResponse.json({ message: err }, { status: 500 });
	}
}
