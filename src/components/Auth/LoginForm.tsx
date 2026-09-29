'use client';

import { Button, Card, PasswordInput, TextInput } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createToast, createToast2 } from 'helpers/SweetAlert';
import classes from './Login.module.css';
import Loader from '../Loader';
import Cookies from 'js-cookie';
import { create } from 'domain';
import { createActivityLog } from '@/helper/Commonfunction';

export function LoginForm() {
	const router = useRouter();
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);

	const handleSubmit = async () => {
		// e.preventDefault();
		if (!email) {
			createToast('Please Enter Email');
			return;
		}
		if (!password) {
			createToast('Please Enter Password');
			return;
		}
		try {
			const payload = {
				email: email,
				password: password,
			};
			setLoading(true);
			const response = await fetch('/api/routes/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			let activityLogPayload = {
				name: 'login',
				action_type: 'login',
				payload: JSON.stringify({ email }),
				api_end_point: '/api/routes/login',
			};
			createActivityLog(activityLogPayload);

			const apidata = await response.json();
			if (apidata.data.statusCode === 200) {
				router.push('/dashboard');
				localStorage.setItem('id', apidata.data.userData.id);
				localStorage.setItem('name', apidata.data.userData.name);
				localStorage.setItem('email', apidata.data.userData.email);
				Cookies.set('admin_token', apidata.data.token, { expires: 1 });
				setLoading(false);
				createToast2(apidata.data.message);
			} else {
				createToast(apidata.data.message);
			}
			setLoading(false);
		} catch (error) {}
	};

	return (
		<>
			{loading && <Loader />}
			<div className={classes.container}>
				<div >
					<Card className={classes.demo} withBorder shadow="md" p={30} mt={30} radius="md">
						<TextInput
							onChange={e => setEmail(e.target.value)}
							label="Email"
							placeholder="Email"
							// required
						/>
						<PasswordInput
							onChange={e => setPassword(e.target.value)}
							label="Password"
							placeholder="Password"
							// required
							mt="md"
						/>
						<Button onClick={handleSubmit} fullWidth mt="xl">
							Sign In
						</Button>
					</Card>
				</div>
			</div>
		</>
	);
}
