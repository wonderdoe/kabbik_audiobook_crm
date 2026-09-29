import { NextRequest, NextResponse } from 'next/server';
import totalUsersController from '@/app/api/controllers/total-users-controller';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
	try {
		const textBody = await new NextResponse(req.body).text();
		const jsonBody = JSON.parse(textBody);
		const newUsers = await totalUsersController.getNewUsers(jsonBody.startDate, jsonBody.endDate);
		const brevoApiUrl = 'https://api.brevo.com/v3/smtp/email';
		const response = await fetch(brevoApiUrl, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'api-key': `${process.env.BREVO_API_KEY}`,
			},
			body: JSON.stringify({
				sender: {
					name: 'Wondersoft Solution',
					email: 'wondersoftsolution@gmail.com',
				},
				// bcc: [
				// 	{
				// 		email: 'rafisamiur@gmail.com',
				// 		name: 'Rafi Sakib',
				// 	},
				// 	{
				// 		email: 'samiurrafi2@gmail.com',
				// 		name: 'Samiur Rafi',
				// 	},
				// ],
				bcc: newUsers,
				subject: jsonBody.subject,
				htmlContent: `<html><head></head><body><p>${jsonBody.body}</p></body></html>`,
			}),
		});

		if (!response.ok) {
			return NextResponse.json({ message: 'Sending email failed' }, { status: 400 });
		}
		return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
	} catch (err) {
		return NextResponse.json({ message: err }, { status: 500 });
	}
}
