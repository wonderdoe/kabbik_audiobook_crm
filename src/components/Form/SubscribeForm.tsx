'use client';

import {
	Box,
	Button,
	CircularProgress,
	Grid,
	Stack,
	Typography,
	alpha,
	useTheme,
} from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createToast2 } from 'helpers/SweetAlert';
import { CustomDatePicker } from './CustomDatePicker';
import { CustomFileInput } from './CustomFileInput';
import { CustomInput } from './CustomInput';
import { CustomSelect } from './CustomSelect';
import moment from 'moment';
import { createActivityLog } from '@/helper/Commonfunction';

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
	proofOfPayment: z.string().min(1, 'Proof of payment is required'),
	modifiedBy: z.number(),
});

const fieldWrapSx = {
	width: '100%',
	minWidth: 0,
	display: 'flex',
	flexDirection: 'column',
	'& .MuiFormControl-root': { mt: 0, mb: 0, width: '100%' },
	'& .MuiFormHelperText-root': {
		m: 0,
		mt: 0.5,
		minHeight: 20,
	},
};

type SubscribeFormProps = {
	userId: number;
	modifiedBy: number;
	onCancel?: () => void;
	onSuccess?: () => void;
};

export const SubscribeForm = ({ userId, modifiedBy, onCancel, onSuccess }: SubscribeFormProps) => {
	const theme = useTheme();
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

	useEffect(() => {
		setValue('userId', userId);
		setValue('modifiedBy', modifiedBy);
	}, [userId, modifiedBy, setValue]);

	const onSubmit = async (formData: SubscribeFormDataType) => {
		setLoading(true);
		try {
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

			createActivityLog({
				name: 'createSubscription',
				action_type: 'create',
				payload: JSON.stringify({ refinedFormData }),
				api_end_point: '/api/routes/subscription',
			});
			const data = await result.json();
			createToast2(data.message);
			if (result.ok) {
				onSuccess?.();
			}
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (isSubmitSuccessful) {
			reset({
				userId,
				modifiedBy,
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
	}, [isSubmitSuccessful, modifiedBy, reset, userId]);

	return (
		<Box
			component="form"
			onSubmit={handleSubmit(onSubmit, e => console.error(e))}
			sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
		>
			<Box
				sx={{
					px: 2,
					py: 1.25,
					borderRadius: 2,
					bgcolor: alpha(theme.palette.primary.main, 0.06),
					border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
				}}
			>
				<Typography variant="overline" color="text.secondary" fontWeight={700}>
					User
				</Typography>
				<Typography variant="body1" fontWeight={700}>
					ID {userId.toLocaleString()}
				</Typography>
			</Box>

			<Box
				sx={{
					p: { xs: 1.5, sm: 2 },
					borderRadius: 2,
					border: 1,
					borderColor: 'divider',
					bgcolor: 'background.paper',
				}}
			>
				<Grid container spacing={2} alignItems="flex-start">
					<Grid item xs={12} sm={6} sx={fieldWrapSx}>
						<CustomSelect
							label="Package type"
							name="packageId"
							data={[
								{ label: 'Monthly', value: 'monthly' },
								{ label: 'Half yearly', value: 'halfYearly' },
								{ label: 'Half yearly recurring', value: 'halfYearlyR' },
								{ label: 'Yearly', value: 'yearly' },
							]}
							placeholder="Select package"
							control={control}
							error={(errors.packageId?.message as string) ?? ''}
							clearable
							required
						/>
					</Grid>
					<Grid item xs={12} sm={6} sx={fieldWrapSx}>
						<CustomSelect
							label="Payment method"
							name="paymentMethod"
							data={[
								{ label: 'bKash', value: 'bKash' },
								{ label: 'Robi', value: 'robi' },
								{ label: 'Nagad', value: 'nagad' },
								{ label: 'Upay', value: 'upay' },
								{ label: 'SurjoPay', value: 'surjoPay' },
								{ label: 'Google Pay', value: 'googlePay' },
								{ label: 'Apple Pay', value: 'applePay' },
							]}
							placeholder="Select method"
							control={control}
							error={(errors.paymentMethod?.message as string) ?? ''}
							clearable
							required
						/>
					</Grid>
					<Grid item xs={12} sm={6} sx={fieldWrapSx}>
						<CustomInput
							label="Transaction ID"
							name="transactionId"
							placeholder="Enter transaction ID"
							control={control}
							error={(errors.transactionId?.message as string) ?? ''}
							dense
						/>
					</Grid>
					<Grid item xs={12} sm={6} sx={fieldWrapSx}>
						<CustomInput
							label="Subscription ID"
							name="subscriptionId"
							placeholder="Enter subscription ID"
							control={control}
							error={(errors.subscriptionId?.message as string) ?? ''}
							dense
						/>
					</Grid>
					<Grid item xs={12} sm={6} sx={fieldWrapSx}>
						<CustomInput
							label="Promocode"
							name="promocode"
							placeholder="Optional promocode"
							control={control}
							error={(errors.promocode?.message as string) ?? ''}
							dense
						/>
					</Grid>
					<Grid item xs={12} sm={6} sx={fieldWrapSx}>
						<CustomDatePicker
							label="Subscription date"
							name="subscriptionDate"
							placeholder="Select date"
							control={control}
							error={(errors.subscriptionDate?.message as string) ?? ''}
							required
						/>
					</Grid>
					<Grid item xs={12} sx={fieldWrapSx}>
						<CustomFileInput
							label="Proof of payment"
							name="proofOfPayment"
							placeholder="Upload receipt or screenshot"
							multiple={false}
							register={register}
							setValue={setValue}
							setLoading={setLoading}
							reset={resetImagePath}
							required
							accept="image/*"
							error={(errors.proofOfPayment?.message as string) ?? ''}
						/>
					</Grid>
				</Grid>
			</Box>

			<Stack
				direction={{ xs: 'column-reverse', sm: 'row' }}
				spacing={1.5}
				justifyContent="flex-end"
				alignItems={{ xs: 'stretch', sm: 'center' }}
			>
				{onCancel ? (
					<Button type="button" variant="outlined" color="inherit" onClick={onCancel} disabled={loading}>
						Cancel
					</Button>
				) : null}
				<Button
					type="submit"
					variant="contained"
					disabled={loading}
					sx={{ minWidth: { sm: 140 } }}
					startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
				>
					{loading ? 'Saving…' : 'Grant subscription'}
				</Button>
			</Stack>
		</Box>
	);
};
