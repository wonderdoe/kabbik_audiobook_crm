'use client';

import {
	Box,
	Button,
	Checkbox,
	Divider,
	FormControlLabel,
	IconButton,
	InputAdornment,
	Paper,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import Loader from '@/components/Loader';
import { AuthSplit } from '@/sections/auth/AuthSplit';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createToast, createToast2 } from 'helpers/SweetAlert';
import { createActivityLog } from '@/helper/Commonfunction';
import { fadeInUp, transition } from '@/styles/motion';
import { IconEye, IconEyeOff, IconLock, IconMail } from '@tabler/icons-react';

/* Fix browser autofill blue/grey background on inputs */
const noAutofillBg = {
	'& input:-webkit-autofill': {
		WebkitBoxShadow: '0 0 0 100px #fff inset',
		WebkitTextFillColor: 'inherit',
		caretColor: 'inherit',
	},
	'& input:-webkit-autofill:focus': {
		WebkitBoxShadow: '0 0 0 100px #fff inset',
	},
};

export function LoginForm() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!email) { createToast('Please enter your email'); return; }
		if (!password) { createToast('Please enter your password'); return; }

		try {
			setLoading(true);
			const payload = { email, password };
			const response = await fetch('/api/routes/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			createActivityLog({
				name: 'login',
				action_type: 'login',
				payload: JSON.stringify({ email }),
				api_end_point: '/api/routes/login',
			});

			const apidata = await response.json();
			if (apidata.data.statusCode === 200) {
				router.push('/dashboard');
				localStorage.setItem('id', apidata.data.userData.id);
				localStorage.setItem('name', apidata.data.userData.name);
				localStorage.setItem('email', apidata.data.userData.email);
				Cookies.set('admin_token', apidata.data.token, { expires: rememberMe ? 30 : 1 });
				createToast2(apidata.data.message);
			} else {
				createToast(apidata.data.message);
			}
		} catch {
			createToast('Login failed. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			{loading && <Loader />}
			<AuthSplit>
				<Box
					component={motion.div}
					initial={fadeInUp.initial}
					animate={fadeInUp.animate}
					transition={transition.normal}
					sx={{ width: '100%' }}
				>
					{/* Brand mark */}
					<Stack spacing={0.5} mb={4}>
						<Typography
							variant="h3"
							fontWeight={800}
							sx={{
						background: 'linear-gradient(135deg, #e91e8c 0%, #4a0080 100%)',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
								letterSpacing: '-0.5px',
							}}
						>
							Kabbik CRM
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Sign in to your account to continue
						</Typography>
					</Stack>

					<Paper
						variant="outlined"
						sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
					>
						<Box component="form" onSubmit={handleSubmit}>
							<Stack spacing={2.5}>
								<TextField
									fullWidth
									label="Email address"
									type="email"
									autoComplete="username"
									value={email}
									onChange={e => setEmail(e.target.value)}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<IconMail size={18} stroke={1.5} />
											</InputAdornment>
										),
									}}
									sx={noAutofillBg}
								/>

								<TextField
									fullWidth
									label="Password"
									type={showPassword ? 'text' : 'password'}
									autoComplete="current-password"
									value={password}
									onChange={e => setPassword(e.target.value)}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<IconLock size={18} stroke={1.5} />
											</InputAdornment>
										),
										endAdornment: (
											<InputAdornment position="end">
												<IconButton
													size="small"
													edge="end"
													onClick={() => setShowPassword(p => !p)}
													aria-label={showPassword ? 'Hide password' : 'Show password'}
												>
													{showPassword
														? <IconEyeOff size={18} stroke={1.5} />
														: <IconEye size={18} stroke={1.5} />
													}
												</IconButton>
											</InputAdornment>
										),
									}}
									sx={noAutofillBg}
								/>

								<FormControlLabel
									control={
										<Checkbox
											size="small"
											checked={rememberMe}
											onChange={e => setRememberMe(e.target.checked)}
										/>
									}
									label={
										<Typography variant="body2" color="text.secondary">
											Keep me signed in for 30 days
										</Typography>
									}
								/>

								<Button
									fullWidth
									variant="contained"
									color="primary"
									size="large"
									type="submit"
									disabled={loading}
									sx={{
										borderRadius: 2,
										py: 1.25,
										fontWeight: 700,
										fontSize: '1rem',
									}}
								>
									Sign in
								</Button>
							</Stack>
						</Box>
					</Paper>

					<Typography variant="caption" color="text.disabled" display="block" textAlign="center" mt={3}>
						Kabbik CRM · Admin portal
					</Typography>
				</Box>
			</AuthSplit>
		</>
	);
}
