import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Paper } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { z } from 'zod';
import { pushNotificationGotoDetailsActivityUrl, scheduledPushNotificationUrl } from '@/utils/constant';
import { createToast2 } from 'helpers/SweetAlert';
import { CustomFileInput } from './CustomFileInput';
import { CustomInput } from './CustomInput';
import { CustomNumberInput } from './CustomNumberInput';
import CustomDateTimePicker from '../CustomDateTimePicker/CustomDateTimePicker';
import { DateValue } from '@mantine/dates';
import { createActivityLog } from '@/helper/Commonfunction';

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
	} = useForm<AudiobookFormDataType>({
		resolver: zodResolver(audiobookFormSchema),
		defaultValues: {
			title: '',
			description: '',
			audiobookTitle: '',
			imageUrl: '',
		},
	});

	const dateTimeChangeHandler=(value:DateValue)=>{
		setDateTimeError(false)
		setDateTime(value)
	}

	// useEffect(() => {
	// 	if (isSubmitSuccessful) {
	// 		reset({
	// 			title: '',
	// 			description: '',
	// 			audiobookId: 0,
	// 			audiobookTitle: '',
	// 			imageUrl: '',
	// 		});
	// 		setResetImagePath(prev => !prev);
	// 	}
	// }, [isSubmitSuccessful, reset]);

	const resetAll=()=>{
		reset({
			title: '',
			description: '',
			audiobookId: 0,
			audiobookTitle: '',
			imageUrl: '',
		});
		setDateTime(null)
		setResetImagePath(prev => !prev);
	}

	const scheduledPushNotification=async(formData: AudiobookFormDataType)=>{
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
		newFormData.redirectRoute=pushNotificationGotoDetailsActivityUrl;
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
			payload: JSON.stringify({ newFormData }),
			api_end_point: scheduledPushNotificationUrl,
		};
		createActivityLog(activityLogPayload)

		const result = await response.json();
		
		if(result?.data?.success){
			createToast2('Audiobook notification succeeded');
			resetAll()
		}else{
			createToast2('Something went wrong');
		}
	}

	const onSubmitAudiobookForm = async (formData: AudiobookFormDataType) => {
		if(isSchedule ){
			scheduledPushNotification(formData)
			// setDateTimeError(true)
			return;
		}
		
		const response = await fetch(pushNotificationGotoDetailsActivityUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formData),
		});
		let activityLogPayload = {
			name: 'onSubmitAudiobookForm',
			action_type: 'create',
			payload:JSON.stringify({ formData }),
			api_end_point: pushNotificationGotoDetailsActivityUrl,
		}
		createActivityLog(activityLogPayload);
		const result = await response.json();
		if (result.data.name) {
			createToast2('Audiobook notification succeeded');
		} else {
			createToast2('Audiobook notification failed');
		}
		resetAll()
	};

	

	return (
		<Paper shadow="xs" p="lg">
			<form
				onSubmit={handleSubmit(onSubmitAudiobookForm, e => console.log(e,"fffffffffff"))}
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
				<CustomNumberInput
					label="Audiobook Id"
					name="audiobookId"
					placeholder="type audiobook id ..."
					control={control}
					error={(errors.audiobookId && errors.audiobookId.message) as string}
					withAsterisk
				/>
				<CustomInput
					label="Audiobook Title"
					name="audiobookTitle"
					placeholder="type audiobook title ..."
					control={control}
					error={(errors.audiobookTitle && errors.audiobookTitle.message) as string}
					withAsterisk
				/>
				<CustomFileInput
					label="Image"
					name="imageUrl"
					placeholder="upload an image ..."
					register={register}
					// error={(errors.imageUrl && errors.imageUrl.message) as string}
					setValue={setValue}
					setLoading={setIsLoading}
					reset={resetImagePath}
				/>
				<Button type="submit" mt={20} py={10} fullWidth disabled={isLoading || isSubmitting}>
					Submit
				</Button>
			</form>
		</Paper>
	);
};
