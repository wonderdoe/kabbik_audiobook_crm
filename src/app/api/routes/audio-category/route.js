import { NextResponse } from 'next/server';
import AudioBookCategoryController from '../../controllers/audioBookCategoryController';

export const dynamic = 'force-dynamic';

export async function GET() {
	try {
		const data = await AudioBookCategoryController.getCategory();
		return NextResponse.json(data);
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
