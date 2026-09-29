'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mantine/core';
import moment from 'moment';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CustomInput } from '@/components/Form/CustomInput';
import { createToast, createToast2 } from 'helpers/SweetAlert';
import { CustomDatePicker } from './CustomDatePicker';
import '@mantine/dates/styles.css';
import { CustomTextarea } from './CustomTextarea';
import { create } from 'domain';
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
			reset({
				subject: '',
				body: '',
				startDate: new Date(),
				endDate: new Date(),
			});
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
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(refinedFormData),
		});

		let activityLogPayload = {
			name: 'onSubmitEmailNotificationForm',
			action_type: 'create',
			payload: JSON.stringify({ refinedFormData }),
			api_end_point: '/api/routes/send-email-notification',
		};
		createActivityLog(activityLogPayload);

		if (!response.ok) {
			const result = await response.json();
			return createToast(result.message);
		}
		const result = await response.json();
		createToast2(result.message);
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmitEmailNotificationForm, e => console.log(e))}
			style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
		>
			<CustomInput
				label="Subject"
				name="subject"
				placeholder="type a subject ..."
				control={control}
				error={(errors.subject && errors.subject.message) as string}
				withAsterisk
			/>
			<CustomTextarea
				label="Body"
				name="body"
				placeholder="type a body ..."
				control={control}
				error={(errors.body && errors.body.message) as string}
				withAsterisk
			/>
			<CustomDatePicker
				label="Start Date"
				name="startDate"
				placeholder="pick a date ..."
				control={control}
				error={(errors.startDate && errors.startDate.message) as string}
				withAsterisk
			/>
			<CustomDatePicker
				label="End Date"
				name="endDate"
				placeholder="pick a date ..."
				control={control}
				error={(errors.startDate && errors.startDate.message) as string}
				withAsterisk
			/>
			<Button type="submit" mt={20} py={10} fullWidth disabled={isSubmitting}>
				Submit
			</Button>
		</form>
	);
};
