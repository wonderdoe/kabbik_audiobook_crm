'use client';

import {
	Box,
	Button,
	Card,
	CardContent,
	TextField,
	Typography,
} from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { modals } from '@/components/providers/ConfirmModal';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
	name: z.string().min(1, { message: 'Username is required' }),
	email: z.string().email('Email is not valid'),
});

type User = z.infer<typeof schema>;

export const SimpleForm = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<User>({
		resolver: zodResolver(schema),
	});

	const onSubmit = (data: User) =>
		modals.openConfirmModal({
			title: 'Register successfully',
			children: data.name,
			labels: { confirm: 'Confirm', cancel: 'Cancel' },
			onConfirm: () => console.log('Confirmed'),
		});

	return (
		<Card sx={{ maxWidth: 400 }}>
			<CardContent>
				<Typography variant="h6" fontWeight={700} gutterBottom>
					Register
				</Typography>
				<TextField
					label="Username"
					error={Boolean(errors.name)}
					helperText={errors.name?.message}
					sx={{ width: "100%" }}
					margin="normal"
					{...register('name')}
				/>
				<TextField
					label="Email"
					error={Boolean(errors.email)}
					helperText={errors.email?.message}
					sx={{ width: "100%" }}
					margin="normal"
					{...register('email')}
				/>
				<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
					We will send you a confirmation email
				</Typography>
				<Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmit(onSubmit)}>
					Register
				</Button>
			</CardContent>
		</Card>
	);
};
