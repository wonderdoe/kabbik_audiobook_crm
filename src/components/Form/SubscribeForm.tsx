import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Center, Grid, Paper, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createToast2 } from 'helpers/SweetAlert';
import { CustomDatePicker } from './CustomDatePicker';
import { CustomFileInput } from './CustomFileInput';
import { CustomInput } from './CustomInput';
import { CustomSelect } from './CustomSelect';
import '@mantine/dates/styles.css';
import moment from 'moment';
import { createActivityLog } from '@/helper/Commonfunction';

export const getLocalDate = () => {
	const now = new Date();
	const localDate = new Date(now.getTime() + 6 * 60 * 60 * 1000);
	const year = localDate.getUTCFullYear();
	const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
	const day = String(localDate.getUTCDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

export type SubscribeFormDataType = z.infer<typeof formSchema>;

const formSchema = z.object({
	userId: z.number(),
	packageId: z.enum(['monthly', 'halfYearly', 'halfYearlyR', 'yearly'], {
		required_error: 'Package type is required',
	}),
	paymentMethod: z.enum(['bKash', 'robi', 'surjoPay', 'nagad', 'googlePay', 'upay', 'applePay'], {
		required_error: 'Payment method is required',
	}),
	subscriptionDate: z.date({ required_error: 'Subscription date is required' }),
	transactionId: z.string(),
	subscriptionId: z.string(),
	promocode: z.string(),
	proofOfPayment: z.string(),
	modifiedBy: z.number(),
});

export const SubscribeForm = ({ userId, modifiedBy }: { userId: number; modifiedBy: number }) => {
	const [loading, setLoading] = useState(false);
	const [resetImagePath, setResetImagePath] = useState(false);
	const {
		register,
		control,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitSuccessful },
		reset,
	} = useForm<SubscribeFormDataType>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			userId,
			modifiedBy,
			packageId: 'monthly',
			paymentMethod: 'bKash',
			promocode: '',
			transactionId: '',
			subscriptionId: '',
			subscriptionDate: new Date(),
			proofOfPayment: '',
		},
	});

	const onSubmit = async (formData: SubscribeFormDataType) => {
		const refinedFormData = {
			...formData,
			paymentMethod:
				formData.paymentMethod === 'bKash' && formData.packageId === 'halfYearly'
					? 'bKashOnetime'
					: formData.paymentMethod,
			packageId: formData.packageId === 'monthly' ? 1 : formData.packageId === 'yearly' ? 3 : 2,
			subscriptionDate: moment(formData.subscriptionDate).format('YYYY-MM-DD'),
		};
		const result = await fetch('/api/routes/subscription', {
			method: 'POST',
			body: JSON.stringify(refinedFormData),
		});

		let activityLogPayload = {
			name: 'createSubscription',
			action_type: 'create',
			payload:JSON.stringify({ refinedFormData }),
			api_end_point: '/api/routes/subscription',
		}
		createActivityLog(activityLogPayload);
		const data = await result.json();
		createToast2(data.message);
	};

	useEffect(() => {
		if (isSubmitSuccessful) {
			reset({
				packageId: 'monthly',
				paymentMethod: 'bKash',
				promocode: '',
				transactionId: '',
				subscriptionId: '',
				subscriptionDate: new Date(),
				proofOfPayment: '',
			});
			setResetImagePath(prev => !prev);
		}
	}, [isSubmitSuccessful, reset]);

	return (
		<Paper shadow="md" p="md" pt="0">
			<Center>
				<Title order={2}>User Id: {userId}</Title>
			</Center>
			<form
				onSubmit={handleSubmit(onSubmit, e => console.error(e))}
				style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}
			>
				<Grid grow>
					<Grid.Col
						span={{ base: 12, sm: 6 }}
						style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
					>
						<CustomSelect
							label="Package Type"
							name="packageId"
							data={[
								{ label: 'Monthly', value: 'monthly' },
								{ label: 'Half yearly', value: 'halfYearly' },
								{ label: 'Half yearly Recurring', value: 'halfYearlyR' },
								{ label: 'Yearly', value: 'yearly' },
							]}
							placeholder="Pick a package type ..."
							control={control}
							error={(errors.packageId && errors.packageId.message) as string}
							clearable
							withAsterisk
						/>
						<CustomSelect
							label="Payment Method"
							name="paymentMethod"
							data={[
								{ label: 'bKash', value: 'bKash' },
								{ label: 'robi', value: 'robi' },
								{ label: 'nagad', value: 'nagad' },
								{ label: 'upay', value: 'upay' },
								{ label: 'surjoPay', value: 'surjoPay' },
								{ label: 'googlePay', value: 'googlePay' },
								{ label: 'applePay', value: 'applePay' },
							]}
							placeholder="Pick a payment method ..."
							control={control}
							error={(errors.paymentMethod && errors.paymentMethod.message) as string}
							clearable
							withAsterisk
						/>
						<CustomInput
							label="Promocode"
							name="promocode"
							placeholder="place a promocode ..."
							control={control}
							error={(errors.promocode && errors.promocode.message) as string}
						/>
						<CustomDatePicker
							label="Subscription Date"
							name="subscriptionDate"
							placeholder="pick a date"
							control={control}
							error={(errors.subscriptionDate && errors.subscriptionDate.message) as string}
							withAsterisk
						/>
					</Grid.Col>
					<Grid.Col
						span={{ base: 12, sm: 6 }}
						style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
					>
						<CustomInput
							label="Transaction Id"
							name="transactionId"
							placeholder="place transaction id ..."
							control={control}
							error={(errors.transactionId && errors.transactionId.message) as string}
						/>
						<CustomInput
							label="Subscription Id"
							name="subscriptionId"
							placeholder="place subscription id ..."
							control={control}
							error={(errors.subscriptionId && errors.subscriptionId?.message) as string}
						/>
						<CustomFileInput
							label="Proof Of Payment"
							name="proofOfPayment"
							placeholder="upload an image ..."
							multiple={true}
							register={register}
							setValue={setValue}
							setLoading={setLoading}
							reset={resetImagePath}
							withAsterisk
						/>
					</Grid.Col>
					<Button m="xs" mt="md" type="submit" fullWidth disabled={loading}>
						Submit
					</Button>
				</Grid>
			</form>
		</Paper>
	);
};
