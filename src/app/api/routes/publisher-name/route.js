
import { NextResponse } from 'next/server';

import publisherController from '../../controllers/publisher.controller';


export const dynamic = 'force-dynamic';


export async function GET(req) {
	
	try {
		const data = await publisherController.getPublisherName();
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