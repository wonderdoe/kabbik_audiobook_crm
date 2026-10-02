import { NextResponse } from 'next/server';
import AudioBookCategoryController from '../../controllers/audioBookCategoryController';

export const dynamic = 'force-dynamic';

export async function GET() {
	try {
		const data = await AudioBookCategoryController.getCategory();
		return NextResponse.json(Array.isArray(data) ? data : []);
	} catch (error) {
		console.error(error);
		return NextResponse.json([], { status: 500 });
	}
}
