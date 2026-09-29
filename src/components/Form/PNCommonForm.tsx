import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Paper, Select, TextInput } from '@mantine/core';
import { DatePickerInput, DateValue } from '@mantine/dates';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { sendPushNotification } from '@/services/services';
import { createToast, createToast2 } from 'helpers/SweetAlert';
import { CustomFileInput } from './CustomFileInput';
import { CustomInput } from './CustomInput';
import '@mantine/dates/styles.css';
import { pushNotificationToallUsersUrl, pushNotificationToSpecificUsersUrl, scheduledPushNotificationUrl } from '@/utils/constant';
import dayjs from 'dayjs';
import CustomDateTimePicker from '../CustomDateTimePicker/CustomDateTimePicker';
import { createActivityLog } from '@/helper/Commonfunction';
import Swal from 'sweetalert2';

const CommonFormSchema = z.object({
	title: z.string({ required_error: 'Title is required' }).min(1, 'Title can not be empty'),
	description: z
		.string({ required_error: 'Description is required' })
		.min(1, 'Description can not be empty'),
	imageUrl: z.string().transform(value => (value === '' ? null : value)),
	
});

type CommonFormDataType = z.infer<typeof CommonFormSchema>;

type SelectProps = 'allUsers' | 'unSubscribedUsers' | 'subscribedUsers';

export const PNCommonForm = () => {
	let date=new Date();
	date.setMinutes(date.getMinutes() + 5)
	const [dateTime,setDateTime]=useState<DateValue | null>(date);
	const [isSchedule,setIsSchedule]=useState<boolean>(true);
	const [dateTimeError,setDateTimeError]=useState<boolean>(false)
	const [isLoading, setIsLoading] = useState(false);
	const [resetImagePath, setResetImagePath] = useState(false);
	const [type, setType] = useState<SelectProps>('allUsers');
	const [error,setError]=useState('');
	const [gotoPage,setGotoPage]=useState('');
	const [audiobook_id,setAudiobook_id]=useState('');
	const [audiobook_title,setaudiobook_title]=useState('');
	const [autoSplit,setAutoSplit]=useState('auto');
	const [categoryList, setCategoryList] = useState([]);
	const [catItems,setCatItems]=useState<any>();

	const [startDate, setStartDate] = useState<Date | null>(
		new Date(moment().startOf('month').toDate()),
	);
	const [endDate, setEndDate] = useState<Date | null>(new Date());
	const {
		register,
		control,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<CommonFormDataType>({
		resolver: zodResolver(CommonFormSchema),
		defaultValues: {
			title: '',
			description: '',
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
			imageUrl: '',
		});
		setDateTime(null)
		setResetImagePath(prev => !prev);
	}

	const scheduledPushNotification=async(formData: CommonFormDataType)=>{
		let newFormData:any={
			redirectRoute:'',
			dateTime:''
		}
		if(!dateTime ){
			setDateTimeError(true)
			return;
		}
		let book_id=audiobook_id.trim();
		let book_title=audiobook_title.trim();
		if(gotoPage==='gotoDetailsActivity' && !(book_id && book_title) ){
			setError('book id and book title is required')
			return;
		}
		newFormData.dateTime=dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss');
		if(autoSplit==='not' && startDate && endDate ){
			newFormData.startDate= moment(startDate).format('YYYY-MM-DD')
			newFormData.endDate= moment(endDate).format('YYYY-MM-DD')
		}
		newFormData.payload={
			...formData,
			type
		};
		// newFormData.redirectRoute='https://api.kabbik.com/v3/pushnotification/gotoDetailsActivity'
		newFormData.redirectRoute= type === 'allUsers'
						? pushNotificationToallUsersUrl
						: pushNotificationToSpecificUsersUrl;
		if(gotoPage==='gotoDetailsActivity' && (book_id && book_title)){
			newFormData.payload.audiobook_id=book_id;
			newFormData.payload.audiobook_title=book_title;
			if(type==='allUsers'){
				newFormData.payload.gotoPage = '/book_details';
				newFormData.payload.gotoActivity = 'gotoDetailsActivity';
			}
		}else if(gotoPage==='gotoSubscriptionPage' && type==='allUsers'){
			newFormData.payload.gotoPage = '/subscription';
			newFormData.payload.gotoActivity = 'gotoSubscriptionPage';
		}

		if(gotoPage==='gotoCategoryWiseBookActivity'){
			newFormData.payload.gotoPage = '/categories';
			newFormData.payload.gotoActivity = 'gotoCategoryWiseBookActivity';
			newFormData.payload.arguments= catItems
		}
		if(gotoPage==='quiz'){
			newFormData.payload.gotoPage = '/fifa_quiz_page';
			newFormData.payload.gotoActivity = 'dynamicScreen';
			// newFormData.payload.arguments= catItems
		}


		console.log(newFormData,"formData")
		
		
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

	const onSubmitCommonForm = async (formData: CommonFormDataType) => {
		
		let book_id=audiobook_id.trim();
		let book_title=audiobook_title.trim();
		if(gotoPage==='gotoDetailsActivity' && !(book_id && book_title) ){
			setError('book id and book title is required')
			return;
		}
		
		if(isSchedule ){
			scheduledPushNotification(formData)
			// setDateTimeError(true)
			return;
		}
		let payload:{[key:string]:string|null}={...formData};
		if(gotoPage==='gotoDetailsActivity' && (book_id && book_title)){
			payload.audiobook_id=book_id;
			payload.audiobook_title=book_title;
			if(type==='allUsers'){
				payload.gotoPage = '/book_details';
				payload.gotoActivity = 'gotoDetailsActivity';
			}
		}else if(gotoPage==='gotoSubscriptionPage' && type==='allUsers'){
			payload.gotoPage = '/subscription';
			payload.gotoActivity = 'gotoSubscriptionPage';
		}

		if(gotoPage==='gotoCategoryWiseBookActivity'){
			payload.gotoPage = '/categories';
			payload.gotoActivity = 'gotoCategoryWiseBookActivity';
			payload.arguments= catItems
		}
		if(gotoPage==='quiz'){
			payload.gotoPage = '/fifa_quiz_page';
			payload.gotoActivity = 'dynamicScreen';
			// payload.arguments= catItems
		}
		
		
		
		if(autoSplit==='not' && startDate && endDate){
			payload.startDate= moment(endDate).format('YYYY-MM-DD')
			payload.endDate= moment(startDate).format('YYYY-MM-DD')
		}
		console.log(payload,"formData")

		const result = await sendPushNotification({
			...payload,
			type,
		});
		if (type === 'allUsers' ? result.data.name : result.data.success) {
			createToast2(
				type === 'allUsers'
					? 'Notification sent'
					: `Notification sent. Successful ${result.data.Successful} and Unsuccessful ${result.data.UnSuccessful}`,
			);
			reset({
				title: '',
				description: '',
				imageUrl: '',
			});
			setStartDate(new Date(moment().startOf('month').toDate()));
			setEndDate(new Date());
			setResetImagePath(prev => !prev);
		} else {
			createToast('Common notification failed');
		}
	};


	async function getData() {
		try {
			const response = await fetch('/api/routes/audio-category', {
				cache: 'no-store',
			});
			const apidata = await response.json();
			setIsLoading(false);
			setCategoryList(apidata);
			console.log(apidata,"apidata");

		} catch (error) {}
	}

	useEffect(()=>{
		getData();
	},[])

	const handleCategoryChange=(value:string|null) => {
    if (!value) return;

    const cat:any = categoryList.find(
      (item:any) => String(item.id) === value
    );

    if (!cat) return;

    const payload = {
      name: cat.name,
      catId: cat.id,
      price: cat.price,
      isPurchased: 0,
      forRent: cat.for_rent,
      durationDay: cat.rent_duration_day,
      excludedPaymentMethods: [],
    };

    console.log(payload);
	setCatItems(payload);
    // setState(payload) or send to API
  }

	// const selectData = ;

	return (
		<Paper shadow="xs" p="lg">
			<div>
				Do you want to schedule later?
				<input 
					type='checkbox' 
					checked={isSchedule}
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

			
			<Select
				mb={10}
				label="Type"
				placeholder="Select a type"
				max={200}
				value={type}
				data={[
					{ label: 'All users', value: 'allUsers' },
					{ label: 'Free users', value: 'unSubscribedUsers' },
					{ label: 'Subscribed users', value: 'subscribedUsers' },
				]}
				onChange={e => {
					if(e==='subscribedUsers' && gotoPage==='gotoSubscriptionPage'){
						 Swal.fire({
							icon: 'error',
							title: `Subscribed user shouldn't go to subscribe page!`,
							// text: 'Something went wrong. Please try again.',
						});	
						return;
					}
					setType(e as SelectProps)
				}}
			/>

			<Select
				mb={10}
				label="Goto Page"
				placeholder="Select Targeted Page"
				max={200}
				value={gotoPage}
				data={[
					{ label: 'Book Details', value: 'gotoDetailsActivity' },
					{ label: 'Subscribe', value: 'gotoSubscriptionPage' },
					{ label: 'Category Details', value: 'gotoCategoryWiseBookActivity' },
					{ label: 'Quiz', value: 'quiz' }
				]}
				onChange={e => {
					console.log(type,e,'pala')
					if(type==='subscribedUsers' && e==='gotoSubscriptionPage'){
						 Swal.fire({
							icon: 'error',
							title: `Subscribed user shouldn't go to subscribe page!`,
							// text: 'Something went wrong. Please try again.',
						});	
						return;
					}
					setGotoPage(e as SelectProps)
					setAudiobook_id('');
					setaudiobook_title('');
				}}
			/>
			<form
				onSubmit={handleSubmit(onSubmitCommonForm, e => console.log(e))}
				style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
			>
				
				{gotoPage==='gotoDetailsActivity'?(
					<>
						<TextInput
							label={"Audiobook Id"}
							placeholder={"Add a book id"}
							error={error}
							onSelect={(e:React.SyntheticEvent<HTMLInputElement, Event>)=>{
								setAudiobook_id(e.currentTarget.value.trim());
								setError('')
							}}
							withAsterisk={true}
						/>
						<TextInput
							label={"Audiobook Title"}
							placeholder={"Add a book title"}
							onSelect={(e:React.SyntheticEvent<HTMLInputElement, Event>)=>{
								
								setaudiobook_title(e.currentTarget.value);
								setError('')
							}}
							error={error}
							withAsterisk={true}
						/>
					</>
				):''}
				{
					gotoPage==='gotoCategoryWiseBookActivity'?(
						<Select
							mb={10}
							label="Select Categories"
							placeholder="Select One Category"
							max={200}
							// value={gotoPage}
							// data={categoryList}
							data={categoryList.map((item:any)=> ({
								value: String(item?.id),   // must be string
								label: item.name,         // shown in UI
							}))}
							
							onChange={handleCategoryChange}
						/>
					):''
				}
				<div className='flex gap-3'>
					{isSchedule&&<label>
						Auto Scale
						<input 
							type='radio' 
							id='scale'
							checked={autoSplit==='auto'}
							style={{ "border": "2px solid #ccc"}}
							onChange={()=>{setAutoSplit('auto')}}
						/>
						
					</label>}
					<label>
						Manual Scale
						<input 
							type='radio' 
							id='scale'
							checked={autoSplit==='not'}
							style={{ "border": "2px solid #ccc"}}
							onChange={()=>{setAutoSplit('not')}}
						/>
					</label>
				</div>
				{ autoSplit==='not'? (
					<>
						<DatePickerInput label="Start Date" value={startDate} onChange={setStartDate} />
						<DatePickerInput label="End Date" value={endDate} onChange={setEndDate} />
					</>
				) : (
					<></>
				)}

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
				<CustomFileInput
					label="Image"
					name="imageUrl"
					placeholder="upload an image ..."
					register={register}
					error={(errors.imageUrl && errors.imageUrl.message) as string}
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
