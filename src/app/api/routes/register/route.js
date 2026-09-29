import { NextResponse } from 'next/server';
import UserAdminController from '../../controllers/useradmin-controller';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    let passedValue = await new NextResponse(req.body).text();
    let bodyreq = JSON.parse(passedValue);


    try {
        const data = await UserAdminController.signUp(bodyreq);
        return NextResponse.json(
            {
                data: data,
                message: "Register successful",
                status:201
            },
            {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }
        );
    } catch (error) {
        return NextResponse.json(
            {
                message: error.message || "Internal Server Error"
            },
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}
