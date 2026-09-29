import UserAdminModel from '../models/user_admin-model';
import { generateAccessToken } from '../utils/jwt';

import compareHash, { genHash } from '../utils/bcrypt';
class UserAdminController {
	signIn = async req => {
		const email = req.email;
		const userPassword = req.password;
		const user = await UserAdminModel.findAdminByEmail(email);

		if (!user) {
			return { message: 'User not found!!', statusCode: 400 };
		}
		const comparePassHashNew = compareHash(userPassword, user.password);

		if (!comparePassHashNew) {
			return { message: 'Wrong password!', statusCode: 400 };
		}

		const jwtPayload = {
			id: user.id,
			user_id:user.id,
			name: user.name,
			email: user.email,
			role:user.role_id,
			userPermissions: user.permissions?.permissions || [],
		};

		const jwtAccessToken = generateAccessToken(jwtPayload);

		const { password, ...userData } = user;
		const response = {
			userData,
			statusCode: 200,
			token: jwtAccessToken,
			message: 'Log in successfull',
		};
		return response;
	};

	signUp = async req => {
		const { name, email, phone_no, role_id, password } = req;

		if (!name || !email || !phone_no || !role_id || !password) {
			return { statusCode: 400, message: 'Name, email, Phone No and password required!' };
		}
		const userExist = await UserAdminModel.findAdminByEmail(email);

		if (userExist) {
			return { statusCode: 400, message: 'User already exist with this email!' };
		}
		const hashPassword = genHash(password);
		const user = await UserAdminModel.createUser({
			name,
			email,
			phone_no,
			role_id,
			password: hashPassword,
		});
		if (!user) {
			return { statusCode: 400, message: 'Something went wrong! Please try again.' };
		}
	};

	getUser = async () => {
		try {
			const data = await UserAdminModel.getUser();
			return data;
		} catch (error) {}
	};

	logOut = async name => {
		try {
			const data = await UserAdminModel.logOut(name);
			return data;
		} catch (error) {}
	};
}

export default new UserAdminController();

// import comparePassHash from '../utils/bcrypt';
// import { NextResponse } from 'next/server';
// const comparePassHashNew = comparePassHash(password, user.password);

// if (!comparePassHashNew) {
// 	return NextResponse.json({ error: 'Wrong password!' }, { status: 400 })
// }


// superAdmin@gmail.com -> 1234Ff@5
// ruth123@gmail.com -> ruth@123
//soikot123@gmail.com ->soikot@123