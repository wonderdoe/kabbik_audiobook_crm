import { NextResponse } from 'next/server';
import PopupController from '../../controllers/popup-controller';

export async function GET() {
	
	try {
		const data = await PopupController.getPopupList();
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
export const dynamic = "force-dynamic";



