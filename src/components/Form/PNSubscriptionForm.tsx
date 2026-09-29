import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Paper } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { pushNotificationGotoSubscriptionPageUrl, scheduledPushNotificationUrl } from '@/utils/constant';
import { createToast2 } from 'helpers/SweetAlert';
import { CustomFileInput } from './CustomFileInput';
import { CustomInput } from './CustomInput';
import { CustomSelect } from './CustomSelect';
import { DateValue } from '@mantine/dates';
import CustomDateTimePicker from '../CustomDateTimePicker/CustomDateTimePicker';
import dayjs from 'dayjs';
import { createActivityLog } from '@/helper/Commonfunction';

const SubscriptionFormSchema = z.object({
	title: z.string({ required_error: 'Title is required' }).min(1, 'Title can not be empty'),
	description: z
		.string({ required_error: 'Description is required' })
		.min(1, 'Description can not be empty'),
	package: z
		.enum(['1', '2', '3'])
		.optional()
		.transform(value => (value === undefined ? null : value)),
	imageUrl: z.string().transform(value => (value === '' ? null : value)),
});

type SubscriptionFormDataType = z.infer<typeof SubscriptionFormSchema>;

export const PNSubscriptionForm = () => {
	const [dateTime,setDateTime]=useState<DateValue | null>(null);
	const [isSchedule,setIsSchedule]=useState<boolean>(false);
	const [dateTimeError,setDateTimeError]=useState<boolean>(false)
	const [isLoading, setIsLoading] = useState(false);
	const [resetImagePath, setResetImagePath] = useState(false);
	const {
		register,
		control,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting, isSubmitSuccessful },
		reset,
	} = useForm<SubscriptionFormDataType>({
		resolver: zodResolver(SubscriptionFormSchema),
		defaultValues: {
			title: '',
			description: '',
			package: '1',
			imageUrl: '',
		},
	});

	const dateTimeChangeHandler=(value:DateValue)=>{
		setDateTimeError(false)
		setDateTime(value)
	}

	const resetAll=()=>{
		reset({
			title: '',
			description: '',
			package: '1',
			imageUrl: '',
		});
		setResetImagePath(prev => !prev)
		setDateTime(null)
	}

	const scheduledPushNotification=async(formData: SubscriptionFormDataType)=>{
		let newFormData:any={
			redirectRoute:'',
			dateTime:''
		}
		if(!dateTime ){
			setDateTimeError(true)
			return;
		}
		newFormData.dateTime=dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss');
		newFormData.payload={...formData};
		// newFormData.redirectRoute='https://api.kabbik.com/v3/pushnotification/gotoDetailsActivity'
		newFormData.redirectRoute=pushNotificationGotoSubscriptionPageUrl;
		
		const response = await fetch(scheduledPushNotificationUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(newFormData),
		});
		let activityLogPayload = {
			name: 'scheduledPushNotification',
			action_type: 'create',
			payload:JSON.stringify({ newFormData }),
			api_end_point: scheduledPushNotificationUrl,
		}
		createActivityLog(activityLogPayload);
		const result = await response.json();
		
		if(result?.data?.success){
			createToast2('Audiobook notification succeeded');
			resetAll()
		}else{
			createToast2('Something went wrong');
		}
	}

	const onSubmitSubscriptionForm = async (formData: SubscriptionFormDataType) => {
		if(isSchedule ){
			scheduledPushNotification(formData)
			// setDateTimeError(true)
			return;
		}
		const response = await fetch(pushNotificationGotoSubscriptionPageUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formData),
		});

		let activityLogPayload = {
			name: 'onSubmitSubscriptionForm',
			action_type: 'create',
			payload:JSON.stringify({ formData }),
			api_end_point: pushNotificationGotoSubscriptionPageUrl,
		}
		createActivityLog(activityLogPayload);

		const result = await response.json();
		if (result.data.name) {
			createToast2('Subscription notification succeeded');
			resetAll()
		} else {
			createToast2('Subscription notification failed');
		}
	};

	// useEffect(() => {
	// 	if (isSubmitSuccessful) {
	// 		reset({
	// 			title: '',
	// 			description: '',
	// 			package: '1',
	// 			imageUrl: '',
	// 		});
	// 		setResetImagePath(prev => !prev);
	// 	}
	// }, [isSubmitSuccessful, reset]);

	return (
		<Paper shadow="xs" p="lg">
			<form
				onSubmit={handleSubmit(onSubmitSubscriptionForm, e => console.log(e))}
				style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
			>
				<div>
					Do you want to schedule later?
					<input 
						type='checkbox' 
						style={{ "border": "2px solid #ccc"}}
						onChange={()=>{setIsSchedule(!isSchedule)}}
					/>
				</div>
				{isSchedule?(
					<CustomDateTimePicker
						error={dateTimeError}
						label={'Make a schedule'}
						placeholder={'Make a schedule'}
						changeHandler={dateTimeChangeHandler}
						value={dateTime}
					/>
				):''}
				<CustomInput
					label="Title"
					name="title"
					placeholder="type a title ..."
					control={control}
					error={(errors.title && errors.title.message) as string}
					withAsterisk
				/>
				<CustomInput
					label="Description"
					name="description"
					placeholder="type a description ..."
					control={control}
					error={(errors.description && errors.description.message) as string}
					withAsterisk
				/>
				<CustomSelect
					label="Select Package"
					name="package"
					data={[
						{ value: '1', label: 'Monthly' },
						{ value: '2', label: 'Half Yearly' },
						{ value: '3', label: 'Yearly' },
					]}
					placeholder="select a package ..."
					control={control}
					error={(errors.package && errors.package.message) as string}
					clearable
				/>
				<CustomFileInput
					label="Image"
					name="imageUrl"
					placeholder="upload an image ..."
					register={register}
					setValue={setValue}
					setLoading={setIsLoading}
					reset={resetImagePath}
					// error={(errors.imageUrl && errors.imageUrl.message) as string}
				/>
				<Button type="submit" mt={20} py={10} fullWidth disabled={isLoading || isSubmitting}>
					Submit
				</Button>
			</form>
		</Paper>
	);
};
