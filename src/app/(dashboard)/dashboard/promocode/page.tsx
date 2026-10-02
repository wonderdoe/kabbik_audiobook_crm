'use client';

import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	FormControlLabel,
	Grid,
	IconButton,
	MenuItem,
	Pagination,
	Paper,
	Select,
	Stack,
	Switch,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tabs,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import { DataSelect } from '@/components/Form/DataSelect';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDisclosure } from '@/hooks/use-disclosure';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { FieldErrors, useFieldArray, useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { z } from 'zod';
import { CustomDatePicker } from '@/components/Form/CustomDatePicker';
import { CustomNumberInput } from '@/components/Form/CustomNumberInput';
import { CustomSelect } from '@/components/Form/CustomSelect';
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

const PACKAGE_LABEL: Record<string, string> = { '1': 'Monthly', '2': 'Half Yearly', '3': 'Yearly' };
const PROMO_TYPE_COLOR: Record<string, 'default' | 'primary' | 'secondary'> = {
	global: 'primary',
	card: 'secondary',
};

export default function PromoCode() {
	const [activeTab, setActiveTab] = useState<string>('all');
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
	const [price, setPrice] = useState<any>();
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
		defaultValues: { cardType: null, binNumber: 0 },
	});
	const {
		control: controlListOfBins,
		formState: { errors: errorsListOfBins },
		handleSubmit: handleSubmitListOfBins,
		reset: resetListOfBins,
	} = useForm<ListOfBinsFormData>({
		resolver: zodResolver(listOfBinsFormSchema),
		defaultValues: { bins: [{ binNumber: 0 }] },
	});
	const { fields, append, remove } = useFieldArray({ name: 'bins', control: controlListOfBins });

	const getPromoList = useCallback(async () => {
		setLoading(true);
		const data = await getGroupwiseFilteredPromoCount({
			limit,
			offset,
			startDate: date.startDate,
			endDate: date.endDate,
			promocode,
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
		// Guard: API may return error object or null instead of array
		const safeList = Array.isArray(list) ? list : [];
		setAllPromocode(safeList.map((p: string) => ({ label: p, value: p })));
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

	const handlePageChange = (_: any, p: number) => {
		setCurrentPage(p);
		setOffset((p - 1) * limit);
	};

	const addPromoCode = async (e: any) => {
		e.preventDefault();
		try {
			const payload = {
				promocode: addingPromo.trim() ?? '',
				reduce_price: price ?? '',
				for_package: value ?? '',
				promo_type: promoType ?? '',
				bank_name: bankName ?? '',
			};
			const response = await fetch(`/api/routes/addpromo`, {
				method: 'POST',
				body: JSON.stringify(payload),
				headers: { 'Content-Type': 'application/json' },
			});
			createActivityLog({
				name: 'addPromoCode',
				action_type: 'create',
				payload: JSON.stringify({ data: payload }),
				api_end_point: '/api/routes/addpromo',
			});
			const apidata = await response.json();
			if (apidata?.statusCode === 201) {
				createToast2(apidata?.message);
				getPromoList();
				fetchAllPromocodes();
				closeAddPromo();
				setAddingPromo('');
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
				closeBinMappingModal();
			} else {
				createToast('Could not add bin mapping');
			}
			resetBinMap({ cardType: null, binNumber: 0 });
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
				resetListOfBins({ bins: [{ binNumber: 0 }] });
				closeBinMappingModal();
			} else {
				createToast(data?.message);
			}
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<PageContainer title="Promo Code Details" items={[{ label: 'Promocode', href: '/dashboard/promocode' }]}>
			<Stack spacing={3}>
				{/* Header */}
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Typography variant="h5" fontWeight={600}>
						Promo Codes
					</Typography>
					<Button onClick={openAddPromo} variant="contained" size="medium">
						+ Add Promo
					</Button>
				</Stack>

				{/* Filter Card */}
				<Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
					<Typography variant="subtitle2" color="text.secondary" mb={2}>
						Filter
					</Typography>
					<form onSubmit={handleSubmit(onSubmitDateRangeFilter, err => console.error(err))}>
						<Grid container spacing={2} alignItems="flex-end">
							<Grid item xs={12} sm={4}>
								<CustomDatePicker
									label="Start Date"
									name="startDate"
									placeholder="Select a date"
									control={control}
									clearable
									error={(errors.startDate && errors.startDate.message) as string}
								/>
							</Grid>
							<Grid item xs={12} sm={4}>
								<CustomDatePicker
									label="End Date"
									name="endDate"
									placeholder="Select a date"
									control={control}
									clearable
									error={(errors.endDate && errors.endDate.message) as string}
								/>
							</Grid>
							<Grid item xs={12} sm={4}>
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
							</Grid>
							<Grid item xs={12}>
								<Stack direction="row" spacing={1}>
									<Button type="submit" variant="contained" disabled={isSubmitting}>
										Apply Filter
									</Button>
									<Button variant="outlined" onClick={handleResetFilter}>
										Reset
									</Button>
								</Stack>
							</Grid>
						</Grid>
					</form>
				</Paper>

				{/* Tabs + Table */}
				<Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
					<Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
						<Tabs
							value={activeTab}
							onChange={(_, v) => {
								setActiveTab(v);
								setPromocodeType(v);
								setCurrentPage(1);
								setOffset(0);
							}}
						>
							<Tab label="All" value="all" />
							<Tab label="Activated" value="activated" />
							<Tab label="Deactivated" value="deactivated" />
						</Tabs>
					</Box>

					{loading ? (
						<Stack alignItems="center" sx={{ py: 8 }}>
							<CircularProgress />
						</Stack>
					) : (
						<>
							<TableContainer>
								<Table>
									<TableHead>
										<TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
											<TableCell>Promo Code</TableCell>
											<TableCell>Promo Type</TableCell>
											<TableCell>Package</TableCell>
											<TableCell>Discount Price</TableCell>
											<TableCell align="center">Count</TableCell>
											<TableCell align="center">Active</TableCell>
											<TableCell align="center">Actions</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{data?.promocodeList?.length === 0 && (
											<TableRow>
												<TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
													No promo codes found.
												</TableCell>
											</TableRow>
										)}
										{data?.promocodeList?.map((element: any) => (
											<TableRow key={element.id} hover>
												<TableCell>
													<Typography variant="body2" fontWeight={500} fontFamily="monospace">
														{element.promo_code}
													</Typography>
												</TableCell>
												<TableCell>
													<Chip
														label={element.promo_type.charAt(0).toUpperCase() + element.promo_type.slice(1)}
														color={PROMO_TYPE_COLOR[element.promo_type] ?? 'default'}
														size="small"
														variant="outlined"
													/>
												</TableCell>
												<TableCell>
													<Typography variant="body2">
														{PACKAGE_LABEL[element.for_package] ?? element.for_package}
													</Typography>
												</TableCell>
												<TableCell>
													<Typography variant="body2" fontWeight={500}>
														BDT {element.reduce_price}
													</Typography>
												</TableCell>
												<TableCell align="center">
													<Chip label={element.promo_count} size="small" />
												</TableCell>
												<TableCell align="center">
													<Switch
														checked={element.status}
														onChange={() => handleTogglePromocodeActivity(element)}
														size="small"
													/>
												</TableCell>
												<TableCell align="center">
													<Stack direction="row" spacing={1} justifyContent="center">
														<Button
															size="small"
															variant="outlined"
															onClick={() => {
																setExtraDetails(element);
																openExtraDetailsModal();
															}}
														>
															Details
														</Button>
														{element.promo_type === 'card' && (
															<Button
																size="small"
																variant="outlined"
																color="secondary"
																onClick={() => {
																	setMapBinDetails(element);
																	openBinMappingModal();
																}}
															>
																Map BIN
															</Button>
														)}
													</Stack>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>

							<Divider />
							<Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
								<Pagination
									page={currentPage}
									count={getTotalPageNumber(data?.total!)}
									onChange={handlePageChange}
									shape="rounded"
									color="primary"
								/>
							</Box>
						</>
					)}
				</Paper>
			</Stack>

			{/* Add Promo Dialog */}
			<Dialog open={addPromoOpened} onClose={closeAddPromo} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ fontWeight: 600 }}>Add Promo Code</DialogTitle>
				<DialogContent>
					<form onSubmit={addPromoCode}>
						<Stack spacing={2} sx={{ mt: 1 }}>
							<TextField
								label="Promo Code"
								value={addingPromo}
								onChange={e => setAddingPromo(e.target.value)}
								required
								fullWidth
								size="small"
								placeholder="e.g. SUMMER25"
							/>
							<DataSelect
								label="Package Name"
								required
								data={[
									{ value: '1', label: 'Monthly' },
									{ value: '2', label: 'Half Yearly' },
									{ value: '3', label: 'Yearly' },
								]}
								placeholder="Pick a package"
								value={value}
								onChange={(option: any) => setValue(option)}
							/>
							<DataSelect
								label="Promo Type"
								required
								data={[
									{ value: 'global', label: 'Global' },
									{ value: 'card', label: 'Card' },
								]}
								placeholder="Pick a type"
								value={promoType}
								onChange={(option: any) => setPromoType(option)}
							/>
							{promoType === 'card' && (
								<TextField
									label="Bank Name"
									value={bankName}
									onChange={e => setBankName(e.target.value)}
									required
									fullWidth
									size="small"
									placeholder="Bank Name"
								/>
							)}
							<TextField
								label="Discount Price"
								value={price}
								onChange={e => setPrice(e.target.value)}
								required
								fullWidth
								size="small"
								placeholder="e.g. 100"
								type="number"
							/>
							<Button type="submit" variant="contained" fullWidth>
								Create Promo Code
							</Button>
						</Stack>
					</form>
				</DialogContent>
			</Dialog>

			{/* BIN Mapping Dialog */}
			<Dialog open={binMappingModalOpened} onClose={closeBinMappingModal} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ fontWeight: 600 }}>BIN Mapping</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 1 }}>
						<FormControlLabel
							control={
								<Switch
									checked={binMapWithoutCardType}
									onChange={() => setBinMapWithoutCardType(prev => !prev)}
								/>
							}
							label="Map without card type"
						/>
						{!binMapWithoutCardType ? (
							<form onSubmit={handleSubmitBinMap(handleBinMapSubmitForm, err => console.error(err))}>
								<Stack spacing={2}>
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
										label="BIN Number"
										name="binNumber"
										control={controlBinMap}
										placeholder="6-digit BIN number"
										error={(errorsBinMap.binNumber && errorsBinMap.binNumber.message) as string}
									/>
									<Button type="submit" variant="contained" fullWidth>
										Add BIN
									</Button>
								</Stack>
							</form>
						) : (
							<form onSubmit={handleSubmitListOfBins(handleSubmitBinListForm, err => console.error(err))}>
								<Stack spacing={2}>
									{fields.map((field, index) => (
										<Stack key={field.id} direction="row" spacing={1} alignItems="flex-start">
											<Box flex={1}>
												<CustomNumberInput
													label="BIN Number"
													name={`bins.${index}.binNumber`}
													control={controlListOfBins}
													placeholder="6-digit BIN"
													error={
														(errorsListOfBins?.bins as FieldErrors[] | undefined)?.[index]
															?.binNumber?.message as string
													}
												/>
											</Box>
											<Button
												variant="outlined"
												color="error"
												onClick={() => remove(index)}
												sx={{ mt: '22px' }}
											>
												Remove
											</Button>
										</Stack>
									))}
									<Button variant="outlined" onClick={() => append({ binNumber: 0 })}>
										+ Add BIN
									</Button>
									<Button type="submit" variant="contained" fullWidth>
										Submit All
									</Button>
								</Stack>
							</form>
						)}
					</Stack>
				</DialogContent>
			</Dialog>

			{/* Extra Details Dialog */}
			<Dialog open={extraDetailsModalOpened} onClose={closeExtraDetailsModal} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ fontWeight: 600 }}>Promo Details</DialogTitle>
				<DialogContent>
					<TableContainer sx={{ mt: 1 }}>
						<Table size="small">
							<TableHead>
								<TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
									<TableCell>Promocode ID</TableCell>
									<TableCell>Created At</TableCell>
									<TableCell>Updated At</TableCell>
									<TableCell>Bank Name</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								<TableRow>
									<TableCell>{extraDetails?.id}</TableCell>
									<TableCell>{moment(extraDetails?.created_at).format('Do MMM, YYYY')}</TableCell>
									<TableCell>{moment(extraDetails?.updated_at).format('Do MMM, YYYY')}</TableCell>
									<TableCell>{extraDetails?.bank_name || 'N/A'}</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</TableContainer>
				</DialogContent>
			</Dialog>
		</PageContainer>
	);
}
