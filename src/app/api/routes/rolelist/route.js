import { NextResponse } from 'next/server';
import RoleController from '../../controllers/role-controller';

export const dynamic = 'force-dynamic';

export async function GET() {
	try {
		const data = await RoleController.getRole();
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
