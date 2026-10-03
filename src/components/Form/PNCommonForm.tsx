'use client';

import {
	Box,
	Button,
	FormControlLabel,
	Radio,
	RadioGroup,
	Stack,
	Switch,
	TextField,
	Typography,
} from '@mui/material';
import { DataSelect } from '@/components/Form/DataSelect';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import {
	formatScheduledPushDateTimeForApi,
	getScheduledPushNotificationMessage,
	isScheduledPushNotificationCreated,
} from '@/utils/pushNotificationSchedule';
import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { sendPushNotification } from '@/services/services';
import { createToast, createToast2 } from 'helpers/SweetAlert';
import { createActivityLog } from '@/helper/Commonfunction';
import { CustomFileInput } from './CustomFileInput';
import { CustomInput } from './CustomInput';
import { pushNotificationToallUsersUrl, pushNotificationToSpecificUsersUrl, scheduledPushNotificationUrl } from '@/utils/constant';
import CustomDateTimePicker from '../CustomDateTimePicker/CustomDateTimePicker';
import Swal from 'sweetalert2';

type DateValue = Date | null;

const CommonFormSchema = z.object({
	title: z.string({ required_error: 'Title is required' }).min(1, 'Title can not be empty'),
	description: z
		.string({ required_error: 'Description is required' })
		.min(1, 'Description can not be empty'),
	imageUrl: z.string().transform(value => (value === '' ? null : value)),
});

type CommonFormDataType = z.infer<typeof CommonFormSchema>;
type SelectProps = 'allUsers' | 'unSubscribedUsers' | 'subscribedUsers';

type PNCommonFormProps = {
	onScheduleSuccess?: () => void;
};

export const PNCommonForm = ({ onScheduleSuccess }: PNCommonFormProps) => {
	const [dateTime, setDateTime] = useState<DateValue | null>(() => {
		const d = new Date();
		d.setMinutes(d.getMinutes() + 5);
		return d;
	});
	const [isSchedule, setIsSchedule] = useState(true);
	const [dateTimeError, setDateTimeError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [resetImagePath, setResetImagePath] = useState(false);
	const [type, setType] = useState<SelectProps>('allUsers');
	const [error, setError] = useState('');
	const [gotoPage, setGotoPage] = useState('');
	const [audiobook_id, setAudiobook_id] = useState('');
	const [audiobook_title, setAudiobookTitle] = useState('');
	const [autoSplit, setAutoSplit] = useState('auto');
	const [categoryList, setCategoryList] = useState<any[]>([]);
	const [catItems, setCatItems] = useState<any>();
	const [startDate, setStartDate] = useState<Date | null>(new Date(moment().startOf('month').toDate()));
	const [endDate, setEndDate] = useState<Date | null>(new Date());

	const { register, control, handleSubmit, setValue, formState: { errors, isSubmitting }, reset } =
		useForm<CommonFormDataType>({
			resolver: zodResolver(CommonFormSchema),
			defaultValues: { title: '', description: '', imageUrl: '' },
		});

	const defaultScheduleDate = () => {
		const d = new Date();
		d.setMinutes(d.getMinutes() + 5);
		return d;
	};

	const resetAll = () => {
		reset({ title: '', description: '', imageUrl: '' });
		setIsSchedule(true);
		setDateTime(defaultScheduleDate());
		setDateTimeError(false);
		setType('allUsers');
		setGotoPage('');
		setAudiobook_id('');
		setAudiobookTitle('');
		setAutoSplit('auto');
		setCatItems(undefined);
		setError('');
		setStartDate(new Date(moment().startOf('month').toDate()));
		setEndDate(new Date());
		setResetImagePath(prev => !prev);
	};

	async function getData() {
		try {
			const response = await fetch('/api/routes/audio-category', { cache: 'no-store' });
			const apidata = await response.json();
			setCategoryList(Array.isArray(apidata) ? apidata : []);
		} catch {
			/* ignore */
		}
	}

	useEffect(() => { getData(); }, []);

	const handleCategoryChange = (value: string | null) => {
		if (!value) return;
		const cat: any = categoryList.find((item: any) => String(item.id) === value);
		if (!cat) return;
		setCatItems({
			name: cat.name, catId: cat.id, price: cat.price, isPurchased: 0,
			forRent: cat.for_rent, durationDay: cat.rent_duration_day, excludedPaymentMethods: [],
		});
	};

	const buildGotoPayload = (payload: any) => {
		const book_id = audiobook_id.trim();
		const book_title = audiobook_title.trim();
		if (gotoPage === 'gotoDetailsActivity' && book_id && book_title) {
			payload.audiobook_id = book_id;
			payload.audiobook_title = book_title;
			if (type === 'allUsers') { payload.gotoPage = '/book_details'; payload.gotoActivity = 'gotoDetailsActivity'; }
		} else if (gotoPage === 'gotoSubscriptionPage' && type === 'allUsers') {
			payload.gotoPage = '/subscription'; payload.gotoActivity = 'gotoSubscriptionPage';
		}
		if (gotoPage === 'gotoCategoryWiseBookActivity') {
			payload.gotoPage = '/categories'; payload.gotoActivity = 'gotoCategoryWiseBookActivity'; payload.arguments = catItems;
		}
		if (gotoPage === 'quiz') { payload.gotoPage = '/fifa_quiz_page'; payload.gotoActivity = 'dynamicScreen'; }
		return payload;
	};

	const scheduledPushNotification = async (formData: CommonFormDataType) => {
		if (!dateTime) { setDateTimeError(true); return; }
		const book_id = audiobook_id.trim();
		const book_title = audiobook_title.trim();
		if (gotoPage === 'gotoDetailsActivity' && !(book_id && book_title)) { setError('Book ID and book title are required'); return; }

		const newFormData: any = {
			redirectRoute: type === 'allUsers' ? pushNotificationToallUsersUrl : pushNotificationToSpecificUsersUrl,
			dateTime: formatScheduledPushDateTimeForApi(dateTime),
			payload: buildGotoPayload({ ...formData, type }),
		};
		if (autoSplit === 'not' && startDate && endDate) {
			newFormData.startDate = moment(startDate).format('YYYY-MM-DD');
			newFormData.endDate = moment(endDate).format('YYYY-MM-DD');
		}

		const response = await fetch(scheduledPushNotificationUrl, {
			method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newFormData),
		});
		createActivityLog({ name: 'scheduledPushNotification', action_type: 'create', payload: JSON.stringify({ newFormData }), api_end_point: scheduledPushNotificationUrl });
		const result = await response.json();
		if (isScheduledPushNotificationCreated(result)) {
			createToast2('Notification scheduled');
			resetAll();
			onScheduleSuccess?.();
		} else {
			createToast2(getScheduledPushNotificationMessage(result) ?? 'Schedule was not created');
		}
	};

	const onSubmitCommonForm = async (formData: CommonFormDataType) => {
		const book_id = audiobook_id.trim();
		const book_title = audiobook_title.trim();
		if (gotoPage === 'gotoDetailsActivity' && !(book_id && book_title)) { setError('Book ID and book title are required'); return; }
		if (isSchedule) { scheduledPushNotification(formData); return; }

		let payload: any = buildGotoPayload({ ...formData });
		if (autoSplit === 'not' && startDate && endDate) {
			payload.startDate = moment(endDate).format('YYYY-MM-DD');
			payload.endDate = moment(startDate).format('YYYY-MM-DD');
		}

		const result = await sendPushNotification({ ...payload, type });
		if (type === 'allUsers' ? result.data.name : result.data.success) {
			createToast2(type === 'allUsers' ? 'Notification sent' : `Sent. OK: ${result.data.Successful} / Fail: ${result.data.UnSuccessful}`);
			resetAll();
		} else {
			createToast('Common notification failed');
		}
	};

	return (
		<Stack
			component="form"
			id="pn-common-form"
			spacing={0}
			onSubmit={handleSubmit(onSubmitCommonForm, e => console.log(e))}
		>
			<Box sx={{ mb: 3 }}>
				<Typography variant="h6" fontWeight={600}>Common Notification</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
					Broadcast a notification to all or specific user segments
				</Typography>
			</Box>

			<Stack spacing={2}>
				{/* Schedule toggle */}
				<Box sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'divider', bgcolor: isSchedule ? 'primary.50' : 'grey.50' }}>
					<FormControlLabel
						control={<Switch checked={isSchedule} onChange={e => { setIsSchedule(e.target.checked); if (!e.target.checked) { setDateTimeError(false); } }} />}
						label={
							<Box>
								<Typography variant="body2" fontWeight={600}>Schedule for later</Typography>
								<Typography variant="caption" color="text.secondary">Pick a date & time to send automatically</Typography>
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

				{/* Audience & destination */}
				<Box sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
					<Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 2, display: 'block' }}>
						Audience & destination
					</Typography>
					<Stack spacing={1.5}>
						<DataSelect
							label="Target audience"
							placeholder="Select audience"
							value={type}
							data={[
								{ label: 'All users', value: 'allUsers' },
								{ label: 'Free users', value: 'unSubscribedUsers' },
								{ label: 'Subscribed users', value: 'subscribedUsers' },
							]}
							onChange={e => {
								if (e === 'subscribedUsers' && gotoPage === 'gotoSubscriptionPage') {
									Swal.fire({ icon: 'error', title: "Subscribed users can't go to subscribe page" });
									return;
								}
								setType(e as SelectProps);
							}}
						/>
						<DataSelect
							label="Goto page"
							placeholder="Select target page"
							value={gotoPage}
							data={[
								{ label: 'Book Details', value: 'gotoDetailsActivity' },
								{ label: 'Subscribe', value: 'gotoSubscriptionPage' },
								{ label: 'Category Details', value: 'gotoCategoryWiseBookActivity' },
								{ label: 'Quiz', value: 'quiz' },
							]}
							onChange={e => {
								if (type === 'subscribedUsers' && e === 'gotoSubscriptionPage') {
									Swal.fire({ icon: 'error', title: "Subscribed users can't go to subscribe page" });
									return;
								}
								setGotoPage(e as string);
								setAudiobook_id('');
								setAudiobookTitle('');
							}}
						/>

						{gotoPage === 'gotoDetailsActivity' && (
							<Stack spacing={1.5}>
								{error && <Typography variant="caption" color="error.main">{error}</Typography>}
								<TextField
									label="Audiobook ID"
									placeholder="Enter audiobook ID"
									size="small"
									fullWidth
									required
									value={audiobook_id}
									onChange={e => { setAudiobook_id(e.target.value.trim()); setError(''); }}
								/>
								<TextField
									label="Audiobook title"
									placeholder="Enter audiobook title"
									size="small"
									fullWidth
									required
									value={audiobook_title}
									onChange={e => { setAudiobookTitle(e.target.value); setError(''); }}
								/>
							</Stack>
						)}

						{gotoPage === 'gotoCategoryWiseBookActivity' && (
							<DataSelect
								label="Category"
								placeholder="Select a category"
								data={categoryList.map((item: any) => ({ value: String(item?.id), label: item.name }))}
								onChange={handleCategoryChange}
							/>
						)}
					</Stack>
				</Box>

				{/* Scale */}
				{isSchedule && (
					<Box sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
						<Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 1.5, display: 'block' }}>
							Send scale
						</Typography>
						<RadioGroup row value={autoSplit} onChange={e => setAutoSplit(e.target.value)}>
							<FormControlLabel value="auto" control={<Radio size="small" />} label="Auto scale" />
							<FormControlLabel value="not" control={<Radio size="small" />} label="Manual scale (date range)" />
						</RadioGroup>
						{autoSplit === 'not' && (
							<Stack direction="row" spacing={2} sx={{ mt: 2 }}>
								<DatePicker
									label="Start date"
									value={startDate ? dayjs(startDate) : null}
									onChange={d => setStartDate(d?.toDate() ?? null)}
									slotProps={{ textField: { size: 'small', fullWidth: true } }}
								/>
								<DatePicker
									label="End date"
									value={endDate ? dayjs(endDate) : null}
									onChange={d => setEndDate(d?.toDate() ?? null)}
									slotProps={{ textField: { size: 'small', fullWidth: true } }}
								/>
							</Stack>
						)}
					</Box>
				)}

				{/* Notification content */}
				<Box sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
					<Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 2, display: 'block' }}>
						Notification content
					</Typography>
					<Stack spacing={0.5}>
						<CustomInput label="Title" name="title" placeholder="Notification title" control={control} error={errors.title?.message as string} required />
						<CustomInput label="Description" name="description" placeholder="Short description shown in notification" control={control} error={errors.description?.message as string} required />
						<CustomFileInput label="Banner image" name="imageUrl" placeholder="Upload an image (optional)" register={register} setValue={setValue} setLoading={setIsLoading} reset={resetImagePath} />
					</Stack>
				</Box>

				<Button
					type="submit"
					form="pn-common-form"
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
