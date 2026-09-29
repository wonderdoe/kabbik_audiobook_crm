import { NextResponse } from 'next/server';
import BlogController from '../../controllers/blog-controller';

export const dynamic = 'force-dynamic';

export async function GET() {
	try {
		const blogs = await BlogController.getBlogs();
		return NextResponse.json(blogs);
	} catch (err) {
		return NextResponse.json({ message: err }, { status: 500 });
	}
}
