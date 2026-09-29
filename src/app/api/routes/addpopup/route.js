import { NextResponse } from 'next/server';
import PopupController from '../../controllers/popup-controller';

export const dynamic = 'force-dynamic';
export async function POST(req) {

    const data = await req.formData()
    const home_ad_image = data.get('home_ad_image');
    const home_ad_type = data.get('home_ad_type');
    const audiobook_id = data.get('audiobook_id');

    

   
	
	try {
		const data = await PopupController.addPopupList(home_ad_type,home_ad_image,audiobook_id);
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