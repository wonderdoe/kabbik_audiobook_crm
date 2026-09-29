import { NextResponse } from 'next/server';
import AudioBookController from '../../../controllers/audiobook-controller';

export const dynamic = 'force-dynamic';

export async function PATCH(req, { params }) {
	const { id } = params;
	let passedValue = await new NextResponse(req.body).text();
	let bodyreq = JSON.parse(passedValue);

	const { premium, for_home,isSubRestricted } = bodyreq;

	try {
		const data = await AudioBookController.updatePremium(id, premium, for_home,isSubRestricted);
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

export async function POST(req, { params }) {
	const { id } = params;
	let passedValue = await new NextResponse(req.body).text();
	let bodyreq = JSON.parse(passedValue);
	

	const {name,description,author_name,price,en_name,thumb_path}= bodyreq

	try {
		const data = await AudioBookController.editAudioBook(id,name,description,author_name,price,en_name,thumb_path);
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

// export async function POST(req,{params}) {
	
// 	let passedValue = await new NextResponse(req.body).text();
//     let bodyreq = JSON.parse(passedValue);
// 	const {id} = params
// 	const {name,  audiobook_id} = bodyreq

// 	try {
// 		const data = await AudioBookController.addEpisode(name,  audiobook_id);
// 		return NextResponse.json(data);
// 	} catch (error) {}
// }
