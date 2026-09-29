'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Flex, Paper, Title } from '@mantine/core';
import moment from 'moment';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CustomDatePicker } from '@/components/Form/CustomDatePicker';
import Loader from '../Loader';

const promocodeAnalyticsFormSchema = z.object({
	startDate: z.date({ required_error: 'Start date must be selected' }),
	endDate: z.date({ required_error: 'End date must be selected' }),
});

type PromocodeAnalyticsFormDataType = z.infer<typeof promocodeAnalyticsFormSchema>;

function PromocodeAnalytics() {
	const [isLoading, setIsLoading] = useState(true);

	const [date, setDate] = useState({
		startDate: moment(new Date()).format('YYYY-MM-DD'),
		endDate: moment(new Date()).format('YYYY-MM-DD'),
	});
	const {
		control,
		handleSubmit,
		reset,
		formState: { isSubmitting, errors },
	} = useForm<PromocodeAnalyticsFormDataType>({
		resolver: zodResolver(promocodeAnalyticsFormSchema),
		defaultValues: {
			startDate: new Date(date.startDate),
			endDate: new Date(date.endDate),
			promocode: '',
		},
	});

	const onSubmitShowAnalytics = async (formData: PromocodeAnalyticsFormDataType) => {
		setIsLoading(true);
		const refinedFormData = {
			...formData,
			startDate: moment(formData.startDate).format('YYYY-MM-DD'),
			endDate: moment(formData.endDate).format('YYYY-MM-DD'),
		};

		setIsLoading(false);
	};

	const handleResetFilter = () => {
		setDate({
			startDate: moment().format('YYYY-MM-DD'),
			endDate: moment().format('YYYY-MM-DD'),
		});
		reset({
			startDate: new Date(),
			endDate: new Date(),
			promocode: allPromocode[0].label ?? '',
		});
	};

	return (
		<>
			{isLoading ? (
				<Loader />
			) : (
				<>
					<Title order={1} style={{ marginBottom: 20 }}>
						Promocode Count
					</Title>
					<form onSubmit={handleSubmit(onSubmitShowAnalytics, err => console.error(err))}>
						<Flex direction={'column'}>
							<Flex direction={{ base: 'column', xs: 'row' }} gap={15}>
								<div style={{ width: '100%', flexGrow: 1 }}>
									<CustomDatePicker
										label="Start Date"
										name="startDate"
										placeholder="Select a date"
										control={control}
										clearable
										error={(errors.startDate && errors.startDate.message) as string}
									/>
								</div>
								<div style={{ width: '100%', flexGrow: 1 }}>
									<CustomDatePicker
										label="End Date"
										name="endDate"
										placeholder="Select a date"
										control={control}
										clearable
										error={(errors.endDate && errors.endDate.message) as string}
									/>
								</div>
							</Flex>
							<Flex direction="column" w={'100%'}>
								<p style={{ margin: 0, padding: 0, fontSize: 14, opacity: 0 }}>something</p>
								<Flex gap={20}>
									<Button type="submit" disabled={isSubmitting}>
										Filter
									</Button>
									<Button onClick={handleResetFilter}>Reset</Button>
								</Flex>
								<p style={{ margin: 0, padding: 0, fontSize: 12, opacity: 0 }}>something</p>
							</Flex>
						</Flex>
					</form>
					<Paper withBorder radius="md" p="md"></Paper>
				</>
			)}
		</>
	);
}

export default PromocodeAnalytics;
