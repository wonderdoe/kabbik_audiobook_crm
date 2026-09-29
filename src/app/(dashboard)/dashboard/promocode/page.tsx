'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
	Button,
	Divider,
	Flex,
	Modal,
	Pagination,
	Paper,
	Select,
	Space,
	Switch,
	Table,
	Tabs,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { FieldErrors, useFieldArray, useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { z } from 'zod';
import { CustomDatePicker } from '@/components/Form/CustomDatePicker';
import { CustomNumberInput } from '@/components/Form/CustomNumberInput';
import { CustomSelect } from '@/components/Form/CustomSelect';
import Loader from '@/components/Loader';
import {
	addBinMapping,
	getAllPromocode,
	getGroupwiseFilteredPromoCount,
	togglePromocodeActivity,
} from '@/services/services';
import { getTotalPageNumber } from '@/utils/globalHelpers';
import { createToast, createToast2 } from 'helpers/SweetAlert';
import { createActivityLog } from '@/helper/Commonfunction';

const dateRangeFormSchema = z
	.object({
		startDate: z.date({ required_error: 'Start date must be selected' }).nullable(),
		endDate: z.date({ required_error: 'End date must be selected' }).nullable(),
		promocode: z
			.string({ required_error: 'Promocode must be selected' })
			.transform(val => val ?? '')
			.nullish(),
	})
	.superRefine(({ startDate, endDate, promocode }, ctx) => {
		if (startDate && !endDate) {
			ctx.addIssue({ code: 'custom', message: 'End date must be selected', path: ['endDate'] });
		}
		if (!startDate && endDate) {
			ctx.addIssue({ code: 'custom', message: 'Start date must be selected', path: ['startDate'] });
		}
		if (!startDate && !endDate && !promocode) {
			ctx.addIssue({
				code: 'custom',
				message: 'Either select promocode or date range',
				path: ['promocode'],
			});
		}
	})
	.transform(value => {
		if (!value.startDate && !value.endDate && (!value.promocode || !value.promocode.length)) {
			return {
				...value,
				startDate: new Date(moment(moment().dayOfYear(1)).format('YYYY-MM-DD')),
				endDate: new Date(),
			};
		}
		if (!value.startDate && !value.endDate && value.promocode) {
			return {
				...value,
				startDate: new Date(moment(moment().dayOfYear(1)).format('YYYY-MM-DD')),
				endDate: new Date(),
			};
		}
		return value;
	});

type DateRangeFormDataType = z.infer<typeof dateRangeFormSchema>;

const binMapFormSchema = z.object({
	cardType: z
		.string()
		.nullish()
		.refine(value => value !== null && value !== undefined && value !== '', {
			message: 'Card type must be selected',
		}),
	binNumber: z
		.number()
		.int()
		.refine(value => value >= 100000 && value <= 999999, {
			message: 'Bin number must be 6 digits',
		}),
});

type BinMapFormData = z.infer<typeof binMapFormSchema>;

const listOfBinsFormSchema = z.object({
	bins: z.array(
		z.object({
			binNumber: z
				.number()
				.int()
				.refine(value => value >= 100000 && value <= 999999, {
					message: 'Bin number must be 6 digits',
				}),
		}),
	),
});

type ListOfBinsFormData = z.infer<typeof listOfBinsFormSchema>;

export default function PromoCode() {
	const [activeTab, setActiveTab] = useState<string | null>('all');
	const [promocodeType, setPromocodeType] = useState<string>('all');
	const [date, setDate] = useState({
		startDate: moment(moment().dayOfYear(1)).format('YYYY-MM-DD'),
		endDate: moment().format('YYYY-MM-DD'),
	});
	const [currentPage, setCurrentPage] = useState(1);
	const [offset, setOffset] = useState(0);
	const limit = 10;
	const [loading, setLoading] = useState(true);
	const [binMappingModalOpened, { open: openBinMappingModal, close: closeBinMappingModal }] =
		useDisclosure(false);
	const [promocode, setPromocode] = useState<string>('');
	const [addingPromo, setAddingPromo] = useState('');
	const [promoType, setPromoType] = useState('');
	const [bankName, setBankName] = useState('');
	const [data, setData] = useState<{ promocodeList: any[]; total: number } | null>(null);
	const [price, setPrice]: any = useState();
	const [value, setValue] = useState<any>();
	const [allPromocode, setAllPromocode] = useState<{ label: string; value: string }[]>([]);
	const [mapBinDetails, setMapBinDetails] = useState<any>(null);
	const [binMapWithoutCardType, setBinMapWithoutCardType] = useState<boolean>(false);
	const [extraDetails, setExtraDetails] = useState<any>(null);

	const [addPromoOpened, { open: openAddPromo, close: closeAddPromo }] = useDisclosure(false);
	const [extraDetailsModalOpened, { open: openExtraDetailsModal, close: closeExtraDetailsModal }] =
		useDisclosure(false);

	const {
		control,
		handleSubmit,
		reset,
		formState: { isSubmitting, errors },
	} = useForm<DateRangeFormDataType>({
		resolver: zodResolver(dateRangeFormSchema),
		defaultValues: {
			startDate: new Date(date.startDate),
			endDate: new Date(date.endDate),
			promocode: '',
		},
	});
	const {
		control: controlBinMap,
		handleSubmit: handleSubmitBinMap,
		reset: resetBinMap,
		formState: { errors: errorsBinMap },
	} = useForm<BinMapFormData>({
		resolver: zodResolver(binMapFormSchema),
		defaultValues: {
			cardType: null,
			binNumber: 0,
		},
	});
	const {
		control: controlListOfBins,
		formState: { errors: errorsListOfBins },
		handleSubmit: handleSubmitListOfBins,
		reset: resetListOfBins,
	} = useForm<ListOfBinsFormData>({
		resolver: zodResolver(listOfBinsFormSchema),
		defaultValues: {
			bins: [{ binNumber: 0 }],
		},
	});
	const { fields, append, remove } = useFieldArray({
		name: 'bins',
		control: controlListOfBins,
	});

	const getPromoList = useCallback(async () => {
		setLoading(true);
		const data = await getGroupwiseFilteredPromoCount({
			limit,
			offset,
			startDate: date.startDate,
			endDate: date.endDate,
			promocode: promocode,
			promocodeType: promocodeType as 'all' | 'activated' | 'deactivated',
		});
		setData(data);
		setLoading(false);
	}, [limit, offset, date.startDate, date.endDate, promocode, promocodeType]);

	useEffect(() => {
		getPromoList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [promocodeType, promocode, offset, date.startDate, date.endDate]);

	const fetchAllPromocodes = useCallback(async () => {
		setLoading(true);
		const list = await getAllPromocode();
		const allPromocode = list?.map((p: string) => ({
			label: p,
			value: p,
		}));
		setAllPromocode(allPromocode);
		setLoading(false);
	}, []);

	useEffect(() => {
		fetchAllPromocodes();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onSubmitDateRangeFilter = async (formData: DateRangeFormDataType) => {
		setLoading(true);
		const refinedFormData = {
			...formData,
			startDate: moment(formData.startDate).format('YYYY-MM-DD'),
			endDate: moment(formData.endDate).format('YYYY-MM-DD'),
			limit,
			offset,
		};
		setDate({ startDate: refinedFormData.startDate, endDate: refinedFormData.endDate });
		setPromocode(formData.promocode ?? '');
		setLoading(false);
	};

	const handlePageChange = (e: any) => {
		const offsetCount = (e - 1) * limit;
		setCurrentPage(e);
		setOffset(offsetCount);
	};

	const addPromoCode = async (e: any) => {
		e.preventDefault();

		try {
			let data = {
				promocode: addingPromo.trim() ?? '',
				reduce_price: price ?? '',
				for_package: value ?? '',
				promo_type: promoType ?? '',
				bank_name: bankName ?? '',
			};

			const response = await fetch(`/api/routes/addpromo`, {
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json',
				},
			});

			let activityLogPayload = {
				name: 'addPromoCode',
				action_type: 'create',
				payload: JSON.stringify({ data }),
				api_end_point: '/api/routes/addpromo',
			};
			createActivityLog(activityLogPayload);
			const apidata = await response.json();

			if (apidata?.statusCode === 201) {
				createToast2(apidata?.message);
				getPromoList();
				fetchAllPromocodes();
				closeAddPromo();
				setPromocode('');
				setPrice('');
				setValue('');
				setPromoType('');
				setBankName('');
			}
		} catch (error) {
			console.error(error);
		}
	};

	const handleResetFilter = () => {
		setDate({
			startDate: moment(moment().dayOfYear(1)).format('YYYY-MM-DD'),
			endDate: moment().format('YYYY-MM-DD'),
		});
		reset({
			startDate: new Date(moment(moment().dayOfYear(1)).format('YYYY-MM-DD')),
			endDate: new Date(),
			promocode: null,
		});
		setPromocode('');
	};

	const handleTogglePromocodeActivity = async (element: any) => {
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, update it!',
		}).then(async (result: any) => {
			if (result.isConfirmed) {
				const data = await togglePromocodeActivity(element.id);
				if (data.success) {
					createToast2(data?.message);
					getPromoList();
				} else {
					createToast(data?.message);
				}
			}
		});
	};

	const handleBinMapSubmitForm = async (binMapFormData: BinMapFormData) => {
		const refinedBinFormData = {
			promo_id: mapBinDetails?.id,
			card_type: binMapFormData.cardType,
			bin_number: binMapFormData.binNumber,
			for_package: mapBinDetails?.for_package,
		};
		try {
			const data = await addBinMapping(refinedBinFormData);
			if (data?.status === 200) {
				createToast2(data?.message);
				resetBinMap({
					cardType: '',
					binNumber: 0,
				});
				closeBinMappingModal();
			} else {
				createToast('Could not add bin mapping');
			}
			resetBinMap({
				cardType: null,
				binNumber: 0,
			});
		} catch (err) {
			console.error(err);
		}
	};

	const handleSubmitBinListForm = async (listOfBinsFormData: ListOfBinsFormData) => {
		try {
			const refinedFormData = {
				promo_id: mapBinDetails?.id,
				for_package: mapBinDetails?.for_package,
				status: 1,
				binNumbers: listOfBinsFormData.bins.map(item => item.binNumber),
			};
			const data = await addBinMapping(refinedFormData, false);
			if (data?.status === 200) {
				createToast2(data?.message);
				resetListOfBins({
					bins: [{ binNumber: 0 }],
				});
				closeBinMappingModal();
			} else {
				createToast(data?.message);
			}
		} catch (err) {
			console.error(err);
		}
	};

	const rows = data?.promocodeList?.map((element: any) => {
		return (
			<>
				<Table.Tr key={element.id}>
					<Table.Td>
						<Text>{element.promo_code}</Text>
					</Table.Td>
					<Table.Td>
						<Text>{element.promo_type.charAt(0).toUpperCase() + element.promo_type.slice(1)}</Text>
					</Table.Td>

					<Table.Td>
						<Text>
							{element.for_package === '1'
								? 'Monthly'
								: element.for_package === '2'
									? 'Half Yearly'
									: 'Yearly'}
						</Text>
					</Table.Td>
					<Table.Td>BDT. {element.reduce_price}</Table.Td>
					<Table.Td>{element.promo_count}</Table.Td>
					<Table.Td>
						<Switch
							checked={element.status}
							onChange={() => handleTogglePromocodeActivity(element)}
							style={{ cursor: 'pointer' }}
						/>
					</Table.Td>
					<Table.Td>
						<Flex gap={10}>
							<Button
								onClick={() => {
									setExtraDetails(element);
									openExtraDetailsModal();
								}}
							>
								Details
							</Button>
							{element.promo_type === 'card' ? (
								<Button
									onClick={() => {
										setMapBinDetails(element);
										openBinMappingModal();
									}}
								>
									Map BIN
								</Button>
							) : (
								<></>
							)}
						</Flex>
					</Table.Td>
				</Table.Tr>
			</>
		);
	});

	return (
		<>
			{loading ? (
				<Loader />
			) : (
				<>
					<Flex justify={'space-between'}>
						<Title order={1} style={{ marginBottom: 20 }}>
							Promo Code Details
						</Title>
						<Button onClick={openAddPromo} variant="filled">
							Add Promo
						</Button>
					</Flex>
					<form onSubmit={handleSubmit(onSubmitDateRangeFilter, err => console.error(err))}>
						<Flex direction={'column'} gap={20}>
							<Flex gap={20} direction={{ base: 'column', sm: 'row' }}>
								<div style={{ flexGrow: 1 }}>
									<CustomDatePicker
										label="Start Date"
										name="startDate"
										placeholder="Select a date"
										control={control}
										clearable
										error={(errors.startDate && errors.startDate.message) as string}
									/>
								</div>
								<div style={{ flexGrow: 1 }}>
									<CustomDatePicker
										label="End Date"
										name="endDate"
										placeholder="Select a date"
										control={control}
										clearable
										error={(errors.endDate && errors.endDate.message) as string}
									/>
								</div>
								<div style={{ flexGrow: 1 }}>
									<CustomSelect
										label="Promocode"
										name="promocode"
										control={control}
										placeholder="Select a promocode"
										data={allPromocode}
										error={(errors.promocode && errors.promocode.message) as string}
										clearable
										searchable
									/>
								</div>
							</Flex>
							<Flex gap={20}>
								<Button type="submit" disabled={isSubmitting}>
									Filter
								</Button>
								<Button onClick={handleResetFilter}>Reset</Button>
							</Flex>
						</Flex>
					</form>
					<Tabs value={activeTab} onChange={setActiveTab} mt={20}>
						<Tabs.List>
							<Tabs.Tab
								value="all"
								onClick={() => {
									setPromocodeType('all');
									setCurrentPage(1);
									setOffset(0);
								}}
							>
								All
							</Tabs.Tab>
							<Tabs.Tab
								value="activated"
								onClick={() => {
									setPromocodeType('activated');
									setCurrentPage(1);
									setOffset(0);
								}}
							>
								Activated
							</Tabs.Tab>
							<Tabs.Tab
								value="deactivated"
								onClick={() => {
									setPromocodeType('deactivated');
									setCurrentPage(1);
									setOffset(0);
								}}
							>
								Deactivated
							</Tabs.Tab>
						</Tabs.List>
					</Tabs>
					<Space h="md" />
					<Paper withBorder radius="md" p="md">
						<Table.ScrollContainer minWidth={800}>
							<Table>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Promo Code</Table.Th>
										<Table.Th>Promo Type</Table.Th>
										<Table.Th>Package</Table.Th>
										<Table.Th>Discount Price</Table.Th>
										<Table.Th>Count</Table.Th>
										<Table.Th>Toggle Activity</Table.Th>
										<Table.Th>Action</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>{rows}</Table.Tbody>
							</Table>
						</Table.ScrollContainer>

						<Divider my="sm" />
						<Pagination
							value={currentPage}
							total={getTotalPageNumber(data?.total!)}
							onChange={handlePageChange}
							siblings={1}
						/>
					</Paper>

					<Modal
						opened={addPromoOpened}
						onClose={closeAddPromo}
						title="Add Promo Code"
						centered
						size="md"
						classNames={{
							title: 'mantine-modal-title',
							close: 'mantine-modal-close',
						}}
					>
						<form onSubmit={addPromoCode}>
							<TextInput
								label="Promo Code"
								value={addingPromo}
								py={10}
								onChange={e => setAddingPromo(e.target.value)}
								required
								placeholder="Promo Code"
							/>

							<Select
								label="Package Name"
								required
								py={10}
								data={[
									{ value: '1', label: 'Monthly' },
									{ value: '2', label: 'Half Yearly' },
									{ value: '3', label: 'Yearly' },
								]}
								placeholder="Pick a value"
								value={value}
								onChange={(option: any) => {
									setValue(option);
								}}
							/>

							<Select
								label="Promo Type"
								py={10}
								required
								data={[
									{ value: 'global', label: 'Global' },
									{ value: 'card', label: 'Card' },
								]}
								placeholder="Pick a value"
								value={promoType}
								onChange={(option: any) => {
									setPromoType(option);
								}}
							/>

							{promoType === 'card' && (
								<>
									<TextInput
										label="Bank Name"
										py={10}
										value={bankName}
										onChange={e => setBankName(e.target.value)}
										required
										placeholder="Bank Name"
									/>
								</>
							)}

							<TextInput
								label="Discount Price"
								py={10}
								value={price}
								onChange={e => setPrice(e.target.value)}
								required
								placeholder="Price"
							/>
							<Button type="submit" py={10}>
								Create
							</Button>
						</form>
					</Modal>
					<Modal
						title="Bin Mapping"
						opened={binMappingModalOpened}
						onClose={closeBinMappingModal}
						size={'md'}
						centered
						classNames={{
							title: 'mantine-modal-title',
							close: 'mantine-modal-close',
						}}
					>
						<Paper shadow="xs" p="xl">
							<Switch
								mb={'md'}
								label="Map Bins without Card Type"
								checked={binMapWithoutCardType}
								onChange={() => setBinMapWithoutCardType(prev => !prev)}
							/>
							{!binMapWithoutCardType ? (
								<form
									onSubmit={handleSubmitBinMap(handleBinMapSubmitForm, err => console.error(err))}
								>
									<Flex gap="md" direction={'column'}>
										<CustomSelect
											label="Card Type"
											name="cardType"
											control={controlBinMap}
											placeholder="Pick a value"
											data={[
												{ value: 'platinum', label: 'Platinum' },
												{ value: 'gold', label: 'Gold' },
												{ value: 'classic', label: 'Classic' },
												{ value: 'prepaid', label: 'Prepaid' },
												{ value: 'debit_card', label: 'Debit Card' },
											]}
											clearable
											error={(errorsBinMap.cardType && errorsBinMap.cardType.message) as string}
										/>
										<CustomNumberInput
											label="Bin Number"
											name="binNumber"
											control={controlBinMap}
											placeholder="Bin Number"
											error={(errorsBinMap.binNumber && errorsBinMap.binNumber.message) as string}
										/>
										<Button type="submit">Add</Button>
									</Flex>
								</form>
							) : (
								<form
									onSubmit={handleSubmitListOfBins(handleSubmitBinListForm, err =>
										console.error(err),
									)}
								>
									<>
										{fields.map((field, index) => {
											return (
												<Flex
													key={field.id}
													gap={'sm'}
													mb={'md'}
													align={'start'}
													justify={'space-between'}
												>
													<CustomNumberInput
														label="Bin Number"
														name={`bins.${index}.binNumber`}
														control={controlListOfBins}
														placeholder="Bin Number"
														error={
															(errorsListOfBins?.bins as FieldErrors[] | undefined)?.[index]
																?.binNumber?.message as string
														}
													/>
													<Button mt={25} type="button" onClick={() => remove(index)}>
														Remove
													</Button>
												</Flex>
											);
										})}
									</>
									<Flex justify={'end'} mb={'md'}>
										<Button onClick={() => append({ binNumber: 0 })}>Append</Button>
									</Flex>
									<Button type="submit" fullWidth>
										Submit
									</Button>
								</form>
							)}
						</Paper>
					</Modal>
					<Modal
						title="Details"
						opened={extraDetailsModalOpened}
						onClose={closeExtraDetailsModal}
						size="xl"
						centered
						classNames={{
							title: 'mantine-modal-title',
							close: 'mantine-modal-close',
						}}
					>
						<Table.ScrollContainer minWidth={200}>
							<Table>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Promocode Id</Table.Th>
										<Table.Th>Created At</Table.Th>
										<Table.Th>Updated At</Table.Th>
										<Table.Th>Bank Name</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									<Table.Tr>
										<Table.Td>{extraDetails?.id}</Table.Td>
										<Table.Td>{moment(extraDetails?.created_at).format('Do MMM, YYYY')}</Table.Td>
										<Table.Td>{moment(extraDetails?.updated_at).format('Do MMM, YYYY')}</Table.Td>
										<Table.Td>{extraDetails?.bank_name || 'N/A'}</Table.Td>
									</Table.Tr>
								</Table.Tbody>
							</Table>
						</Table.ScrollContainer>
					</Modal>
				</>
			)}
		</>
	);
}
