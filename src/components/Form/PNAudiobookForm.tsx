'use client';

import {
	Box,
	Button,
	FormControlLabel,
	Stack,
	Switch,
	Typography,
} from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { z } from 'zod';
import { pushNotificationGotoDetailsActivityUrl, scheduledPushNotificationUrl } from '@/utils/constant';
import { createToast2 } from 'helpers/SweetAlert';
import { createActivityLog } from '@/helper/Commonfunction';
import { CustomFileInput } from './CustomFileInput';
import { CustomInput } from './CustomInput';
import { CustomNumberInput } from './CustomNumberInput';
import CustomDateTimePicker from '../CustomDateTimePicker/CustomDateTimePicker';

type DateValue = Date | null;

const audiobookFormSchema = z.object({
	title: z.string({ required_error: 'Title is required' }).min(1, 'Title can not be empty'),
	description: z
		.string({ required_error: 'Description is required' })
		.min(1, 'Description can not be empty'),
	audiobookId: z
		.number({ required_error: 'Audiobook id is required' })
		.nullable()
		.refine(value => value !== null, 'Audiobook id must be a number'),
	audiobookTitle: z
		.string({ required_error: 'Audiobook title is required' })
		.min(1, 'Audiobook title can not be empty'),
	imageUrl: z.string().transform(value => (value === '' ? null : value)),
});

type AudiobookFormDataType = z.infer<typeof audiobookFormSchema>;

export const PNAudiobookForm = () => {
	const [dateTime, setDateTime] = useState<DateValue | null>(null);
	const [isSchedule, setIsSchedule] = useState(false);
	const [dateTimeError, setDateTimeError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [resetImagePath, setResetImagePath] = useState(false);

	const {
		register,
		control,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<AudiobookFormDataType>({
		resolver: zodResolver(audiobookFormSchema),
		defaultValues: { title: '', description: '', audiobookTitle: '', imageUrl: '' },
	});

	const resetAll = () => {
		reset({ title: '', description: '', audiobookId: 0, audiobookTitle: '', imageUrl: '' });
		setDateTime(null);
		setResetImagePath(prev => !prev);
	};

	const scheduledPushNotification = async (formData: AudiobookFormDataType) => {
		if (!dateTime) { setDateTimeError(true); return; }
		const newFormData: any = {
			redirectRoute: pushNotificationGotoDetailsActivityUrl,
			dateTime: dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss'),
			payload: { ...formData },
		};
		const response = await fetch(scheduledPushNotificationUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newFormData),
		});
		createActivityLog({
			name: 'scheduledPushNotification',
			action_type: 'create',
			payload: JSON.stringify({ newFormData }),
			api_end_point: scheduledPushNotificationUrl,
		});
		const result = await response.json();
		if (result?.data?.success) {
			createToast2('Audiobook notification succeeded');
			resetAll();
		} else {
			createToast2('Something went wrong');
		}
	};

	const onSubmitAudiobookForm = async (formData: AudiobookFormDataType) => {
		if (isSchedule) { scheduledPushNotification(formData); return; }
		const response = await fetch(pushNotificationGotoDetailsActivityUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(formData),
		});
		createActivityLog({
			name: 'onSubmitAudiobookForm',
			action_type: 'create',
			payload: JSON.stringify({ formData }),
			api_end_point: pushNotificationGotoDetailsActivityUrl,
		});
		const result = await response.json();
		createToast2(result.data.name ? 'Audiobook notification succeeded' : 'Audiobook notification failed');
		resetAll();
	};

	return (
		<Stack
			component="form"
			id="pn-audiobook-form"
			spacing={0}
			onSubmit={handleSubmit(onSubmitAudiobookForm, e => console.log(e))}
		>
			{/* Section header */}
			<Box sx={{ mb: 3 }}>
				<Typography variant="h6" fontWeight={600}>
					Audiobook Details
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
					Send a push notification linking to a specific audiobook
				</Typography>
			</Box>

			<Stack spacing={2}>
				{/* Schedule toggle */}
				<Box
					sx={{
						p: 2,
						borderRadius: 2,
						border: 1,
						borderColor: 'divider',
						bgcolor: isSchedule ? 'primary.50' : 'grey.50',
						transition: 'background 0.2s',
					}}
				>
					<FormControlLabel
						control={
							<Switch
								checked={isSchedule}
								onChange={e => {
									setIsSchedule(e.target.checked);
									if (!e.target.checked) { setDateTimeError(false); setDateTime(null); }
								}}
							/>
						}
						label={
							<Box>
								<Typography variant="body2" fontWeight={600}>
									Schedule for later
								</Typography>
								<Typography variant="caption" color="text.secondary">
									Pick a date & time to send automatically
								</Typography>
							</Box>
						}
					/>
					{isSchedule && (
						<Box sx={{ mt: 2 }}>
							<CustomDateTimePicker
								error={dateTimeError}
								label="Send at"
								placeholder="Pick date & time"
								changeHandler={v => { setDateTimeError(false); setDateTime(v); }}
								value={dateTime}
							/>
						</Box>
					)}
				</Box>

				{/* Notification content */}
				<Box
					sx={{
						p: 2.5,
						borderRadius: 2,
						border: 1,
						borderColor: 'divider',
					}}
				>
					<Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 2, display: 'block' }}>
						Notification content
					</Typography>
					<Stack spacing={0.5}>
						<CustomInput
							label="Title"
							name="title"
							placeholder="Notification title"
							control={control}
							error={(errors.title?.message) as string}
							required
						/>
						<CustomInput
							label="Description"
							name="description"
							placeholder="Short description shown in the notification"
							control={control}
							error={(errors.description?.message) as string}
							required
						/>
						<CustomFileInput
							label="Banner image"
							name="imageUrl"
							placeholder="Upload an image (optional)"
							register={register}
							setValue={setValue}
							setLoading={setIsLoading}
							reset={resetImagePath}
						/>
					</Stack>
				</Box>

				{/* Target audiobook */}
				<Box
					sx={{
						p: 2.5,
						borderRadius: 2,
						border: 1,
						borderColor: 'divider',
					}}
				>
					<Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 2, display: 'block' }}>
						Target audiobook
					</Typography>
					<Stack spacing={0.5}>
						<CustomNumberInput
							label="Audiobook ID"
							name="audiobookId"
							placeholder="Enter the audiobook ID"
							control={control}
							error={(errors.audiobookId?.message) as string}
							required
						/>
						<CustomInput
							label="Audiobook title"
							name="audiobookTitle"
							placeholder="Enter the audiobook title"
							control={control}
							error={(errors.audiobookTitle?.message) as string}
							required
						/>
					</Stack>
				</Box>

				<Button
					type="submit"
					form="pn-audiobook-form"
					variant="contained"
					size="large"
					disabled={isLoading || isSubmitting}
					sx={{ alignSelf: 'flex-end', minWidth: 160 }}
				>
					{isSchedule ? 'Schedule' : 'Send now'}
				</Button>
			</Stack>
		</Stack>
	);
};
