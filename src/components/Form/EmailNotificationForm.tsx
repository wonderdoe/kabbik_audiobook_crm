'use client';

import {
	Box,
	Button,
	Stack,
	Typography,
} from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CustomInput } from '@/components/Form/CustomInput';
import { createToast, createToast2 } from 'helpers/SweetAlert';
import { CustomDatePicker } from './CustomDatePicker';
import { CustomTextarea } from './CustomTextarea';
import { createActivityLog } from '@/helper/Commonfunction';

const emailNotificationFormSchema = z.object({
	subject: z.string({ required_error: 'Subject is required' }).min(1, 'Subject can not be empty'),
	body: z.string({ required_error: 'Body is required' }).min(1, 'Body can not be empty'),
	startDate: z.date({ required_error: 'Starting date is required' }),
	endDate: z.date({ required_error: 'Ending date is required' }),
});

type EmailNotificationFormDataType = z.infer<typeof emailNotificationFormSchema>;

export const EmailNotificationForm = () => {
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting, isSubmitSuccessful },
		reset,
	} = useForm<EmailNotificationFormDataType>({
		resolver: zodResolver(emailNotificationFormSchema),
		defaultValues: {
			subject: '',
			body: '',
			startDate: new Date(),
			endDate: new Date(),
		},
	});

	useEffect(() => {
		if (isSubmitSuccessful) {
			reset({ subject: '', body: '', startDate: new Date(), endDate: new Date() });
		}
	}, [isSubmitSuccessful, reset]);

	const onSubmitEmailNotificationForm = async (formData: EmailNotificationFormDataType) => {
		const refinedFormData = {
			...formData,
			startDate: moment(formData.startDate).format('YYYY-MM-DD'),
			endDate: moment(formData.endDate).format('YYYY-MM-DD'),
		};
		const response = await fetch(`/api/routes/send-email-notification`, {
			method: 'POST',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
			body: JSON.stringify(refinedFormData),
		});
		createActivityLog({
			name: 'onSubmitEmailNotificationForm',
			action_type: 'create',
			payload: JSON.stringify({ refinedFormData }),
			api_end_point: '/api/routes/send-email-notification',
		});
		if (!response.ok) {
			const result = await response.json();
			return createToast(result.message);
		}
		const result = await response.json();
		createToast2(result.message);
	};

	return (
		<Stack
			component="form"
			id="email-notification-form"
			spacing={0}
			onSubmit={handleSubmit(onSubmitEmailNotificationForm, e => console.log(e))}
		>
			{/* Header */}
			<Box sx={{ mb: 3 }}>
				<Typography variant="h6" fontWeight={600}>Email Notification</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
					Send an email to users within a date range
				</Typography>
			</Box>

			<Stack spacing={2}>
				{/* Notification content */}
				<Box sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
					<Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 2, display: 'block' }}>
						Email content
					</Typography>
					<Stack spacing={0.5}>
						<CustomInput
							label="Subject"
							name="subject"
							placeholder="Email subject line"
							control={control}
							error={(errors.subject?.message) as string}
							required
						/>
						<CustomTextarea
							label="Body"
							name="body"
							placeholder="Email body content"
							control={control}
							error={(errors.body?.message) as string}
							required
							minRows={5}
						/>
					</Stack>
				</Box>

				{/* Date range */}
				<Box sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
					<Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 2, display: 'block' }}>
						Target date range
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						Send to users who registered within this range
					</Typography>
					<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
						<Box sx={{ flex: 1 }}>
							<CustomDatePicker
								label="Start date"
								name="startDate"
								placeholder="Pick start date"
								control={control}
								error={(errors.startDate?.message) as string}
								required
							/>
						</Box>
						<Box sx={{ flex: 1 }}>
							<CustomDatePicker
								label="End date"
								name="endDate"
								placeholder="Pick end date"
								control={control}
								error={(errors.endDate?.message) as string}
								required
							/>
						</Box>
					</Stack>
				</Box>

				<Button
					type="submit"
					form="email-notification-form"
					variant="contained"
					size="large"
					disabled={isSubmitting}
					sx={{ alignSelf: 'flex-end', minWidth: 160 }}
				>
					Send email
				</Button>
			</Stack>
		</Stack>
	);
};
