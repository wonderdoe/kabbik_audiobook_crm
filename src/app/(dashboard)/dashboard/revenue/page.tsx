'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
	Badge,
	Box,
	Button,
	Card,
	Flex,
	Grid,
	Group,
	Image,
	Modal,
	Paper,
	Text,
	Title,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CustomDatePicker } from '@/components/Form/CustomDatePicker';
import Loader from '@/components/Loader';
import { checkgetPermission } from '@/helper/Commonfunction';
// import arrowTree from '/public/images/arrowTree.png'

const CustomDisplay = ({
	list,
	handleCallback,
	imageUrl,
	modalOpened,
	closeModal,
	cardTitle,
	modalTitle,
	nestedList,
}: any) => {
	
	const getDatafromList=(list:any)=>{
		let data = [];
		
		data=[
			["Bkash",{
				onetime:list.find((item:any)=>item[0]==="Bkash-onetime0")?.[1]??0,
				recurring:list.find((item:any)=>item[0]==="Bkash-recurring0")?.[1]??0,
				rent:list.find((item:any)=>item[0]?.toLowerCase()==="bkash-onetime1")?.[1]??0,
			}],
			["Nagad",{
				onetime:list.find((item:any)=>item[0]==="NAGAD-onetime0")?.[1]??0,
				recurring:list.find((item:any)=>item[0]==="NAGAD-recurring0")?.[1]??0,
				rent:list.find((item:any)=>item[0]?.toLowerCase()==="nagad-onetime1")?.[1]??0,
			}],
			["Upay",{
				onetime:list.find((item:any)=>item[0]==="UPAY-onetime0")?.[1]??0,
				recurring:list.find((item:any)=>item[0]==="UPAY-recurring0")?.[1]??0,
				rent:list.find((item:any)=>item[0]?.toLowerCase()==="upay-onetime1")?.[1]??0,
			}],
			["Robi",{
				onetime:list.find((item:any)=>item[0]==="ROBI-onetime0")?.[1]??0,
				recurring:list.find((item:any)=>item[0]==="ROBI-recurring0")?.[1]??0,
				rent:list.find((item:any)=>item[0]?.toLowerCase()==="robi-onetime1")?.[1]??0,
			}],
			["GP",{
				onetime:list.find((item:any)=>item[0]==="GP-onetime0")?.[1]??0,
				recurring:list.find((item:any)=>item[0]==="GP-recurring0")?.[1]??0,
				rent:list.find((item:any)=>item[0]?.toLowerCase()==="gp-onetime1")?.[1]??0,
			}],
			["BL",{
				onetime:list.find((item:any)=>item[0]==="BL-onetime0")?.[1]??0,
				recurring:list.find((item:any)=>item[0]==="BL-recurring0")?.[1]??0,
				rent:list.find((item:any)=>item[0]?.toLowerCase()==="BL-onetime1")?.[1]??0,
			}],
			["ApplePay",{
				onetime:list.find((item:any)=>item[0]==="APP_STORE-onetime0")?.[1]??0,
				recurring:list.find((item:any)=>item[0]==="APP_STORE-recurring0")?.[1]??0,
				rent:list.find((item:any)=>item[0]?.toLowerCase()==="app_store-onetime1")?.[1]??0,
			}],
			["GooglePay",{
				onetime:list.find((item:any)=>item[0]==="PLAY_STORE-onetime0")?.[1]??0,
				recurring:list.find((item:any)=>item[0]==="PLAY_STORE-recurring0")?.[1]??0,
				rent:list.find((item:any)=>item[0]?.toLowerCase()==="play_store-onetime1")?.[1]??0,
			}],
			["Stripe",{
				onetime:list.find((item:any)=>item[0]==="STRIPE-onetime0")?.[1]??0,
				recurring:list.find((item:any)=>item[0]==="STRIPE-recurring0")?.[1]??0,
				rent:list.find((item:any)=>item[0]?.toLowerCase()==="stripe-onetime1")?.[1]??0,
			}],
			
			['Aamarpay',{
				onetime:list.find((item:any)=>item[0]==="AAMARPAY-onetime0")?.[1]??0,
				recurring:list.find((item:any)=>item[0]==="AAMARPAY-recurring0")?.[1]??0,
				rent:list.find((item:any)=>item[0]?.toLowerCase()==="aamarpay-onetime1")?.[1]??0,
			}]
		]

		
		return data;
	}
	return (
		<>
			<Paper shadow="xs" p="xl" style={{ padding: 25, marginBottom: '20px' }}>
				<Flex align="center" mb="xl">
					<Image
						h={80}
						w={80}
						style={{ objectFit: 'contain', background: 'fff' }}
						radius="md"
						src={imageUrl}
						alt={imageUrl}
					/>
					<Text className=" text-orange-600" size="xl" fw={900}>
						{cardTitle}
					</Text>
				</Flex>
				{list.length ? (
					<Flex direction="row" gap="xl" wrap="wrap">
						{list.map((item: any) => (
							<Box
								key={item[0]}
								style={{
									padding: '10px 15px',
									background: '#16A34A1A',
									borderRadius: '10px',
									cursor: 'pointer',
								}}
								onClick={() => handleCallback(item[1])}
							>
								<Text size="xs" ta="center">
									{moment(item[0]).format(`Do MMM 'YY`)}
								</Text>
								<Text c="#16A34A" fw="bolder" ta="center">
									{Object.values(item[1] as object).reduce(
										(acc: number, val: number) => acc + val,
										0,
									)}
								</Text>
							</Box>
						))}
					</Flex>
				) : (
					<Text ta={'center'}>No payments</Text>
				)}
			</Paper>
			<Modal
				overlayProps={{
					backgroundOpacity: 0.1,
					blur: 0,
				}}
				opened={modalOpened}
				onClose={closeModal}
				centered
				size={'xl'}
			>
				<Text size="xl" fw={900} style={{ fontWeight: 'bold', textAlign: 'center',margin:"0px 0 15px" }}>
					{modalTitle}
				</Text>
				<Paper shadow="xs" p="xxl">
					<Flex align="center" gap="md" wrap="wrap" justify="center">
						{getDatafromList(nestedList).map((item: any) => (
							<Card key={item.payment_type} display="flex" style={{ alignItems: 'center',padding:"8px",width:'220px' }}>
								<Text style={{ textAlign: 'center', margin: 10 }} c="dimmed" tt="uppercase" fz="xs">
									{item[0]}
								</Text>
								<Badge color="pink" fz="xs" style={{zIndex:10}}>
									{(item[1].onetime??0) + (item[1].recurring??0) + (item[1].rent??0)}
								</Badge>
								<figure style={{maxWidth:"155px",margin:"-5px 0px 20px 0px",alignItems:"center"}}>
									<Image src={"/images/arrowTree.png"} alt='arrow'/>
								</figure>
								<div style={{display:"flex","justifyContent":"space-between",marginTop:"-20px"}}>
									<div className=''>
										<Text style={{ textAlign: 'center',margin:"0 0px" }} c="dimmed" tt="uppercase" fz="xs">
											One time<br/>
											({item[1].onetime??0})
										</Text>
											
									</div>
									<div>
										<Text style={{ textAlign: 'center', margin: "0 12px" }} c="dimmed" tt="uppercase" fz="xs">
											Recurring <br/>
											({item[1].recurring??0})
										</Text>
										
									</div>
									<div>
										<Text style={{ textAlign: 'center', margin: "0 0px" }} c="dimmed" tt="uppercase" fz="xs">
											Rent <br/>
											({item[1].rent??0})
										</Text>
										
									</div>
								</div>
							</Card>
						))}
					</Flex>
				</Paper>
			</Modal>
		</>
	);
};

const formSchema = z.object({
	startDate: z.date({ required_error: 'Start date must be selected' }),
	endDate: z.date({ required_error: 'End date must be selected' }),
});

type FormData = z.infer<typeof formSchema>;

export default function Revenue() {
	const [data, setData] = useState({ kabbik: [], mybl: [], course: [] });
	const [individual, setIndividual] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [updatedAt, setUpdatedAt] = useState<string | null>(null);
	const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
	const [detailsOpenedMyBl, { open: openDetailsMyBl, close: closeDetailsMyBl }] =
		useDisclosure(false);
	const [detailsOpenedCourse, { open: openDetailsCourse, close: closeDetailsCourse }] =
		useDisclosure(false);
	const [date, setDate] = useState({
		startDate: moment().subtract(6, 'days').format('YYYY-MM-DD'),
		endDate: moment().format('YYYY-MM-DD'),
	});
	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			startDate: new Date(moment().subtract(6, 'days').format('YYYY-MM-DD')),
			endDate: new Date(),
		},
	});

	const getData = useCallback(async (refresh = false) => {
		try {
			setIsLoading(true);
			const refreshParam = refresh ? '&refresh=1' : '';
			const response = await fetch(
				`/api/routes/revenue?startDate=${date.startDate}&endDate=${date.endDate}${refreshParam}`,
				{ cache: 'no-store' },
			);
			if (!response.ok) {
				throw new Error('Failed to fetch data');
			}
			const apidata = await response.json();
			setUpdatedAt(apidata.updatedAt ?? null);
			setData({
				kabbik: Object.entries(apidata.kabbik ?? {}) as [],
				mybl: Object.entries(apidata.mybl ?? {}) as [],
				course: Object.entries(apidata.course ?? {}) as [],
			});
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			setIsLoading(false);
		}
	}, [date]);

	const handleRefresh = async () => {
		if (!checkgetPermission('see_subscription_revenue_report')) return;
		setRefreshing(true);
		try {
			await getData(true);
		} finally {
			setRefreshing(false);
		}
	};

	const updatedLabel = updatedAt ? `Updated ${moment(updatedAt).fromNow()}` : null;

	useEffect(() => {
		getData();
	}, [getData]);

	const handleDetailsPayment = (individualData: any) => {
		openDetails();
		setIndividual(
			Object.entries({
				// onetime: 0,
				// recurring: 0,
				// robi: 0,
				// nagad: 0,
				// upay: 0,
				// aamarpay: 0,
				// stripe: 0,
				// googlepay: 0,
				// applepay: 0,
				...individualData,
			}) as [],
		);
	};

	const handleMyBlDetailsPayment = (individualData: any) => {
		openDetailsMyBl();
		setIndividual(
			Object.entries({
				onetime: 0,
				recurring: 0,
				nagad: 0,
				upay: 0,
				aamarpay: 0,
				...individualData,
			}) as [],
		);
	};

	const handleCourseDetailsPayment = (individualData: any) => {
		openDetailsCourse();
		setIndividual(
			Object.entries({
				bkash: 0,
				nagad: 0,
				upay: 0,
				aamarpay: 0,
				...individualData,
			}) as [],
		);
	};

	const handleSubmit = async (formData: FormData) => {
		setDate({
			startDate: moment(formData.startDate).format('YYYY-MM-DD'),
			endDate: moment(formData.endDate).format('YYYY-MM-DD'),
		});
	};

	return (
		<>
			<Group justify="space-between" mb="md" align="flex-end">
				<Title order={1}>Subscription Revenue Report</Title>
				<Group gap="sm">
					{updatedLabel ? (
						<Text size="sm" c="dimmed">
							{updatedLabel}
						</Text>
					) : null}
					{checkgetPermission('see_subscription_revenue_report') ? (
						<Button
							variant="light"
							size="xs"
							leftSection={<IconRefresh size={14} />}
							loading={refreshing}
							onClick={handleRefresh}
						>
							Refresh
						</Button>
					) : null}
				</Group>
			</Group>
			<Card withBorder p="md" radius="md" mb="md">
				<form
					onSubmit={form.handleSubmit(handleSubmit, err => console.error(err))}
					style={{ marginBottom: '20px' }}
				>
					<Grid align="end">
						<Grid.Col span={{ base: 12, xs: 5 }}>
							<CustomDatePicker
								name="startDate"
								label="Start Date"
								control={form.control}
								placeholder={'Pick a date'}
								error={
									(form.formState.errors.startDate &&
										form.formState.errors.startDate.message) as string
								}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, xs: 5 }}>
							<CustomDatePicker
								name="endDate"
								label="End Date"
								control={form.control}
								placeholder={'Pick a date'}
								error={
									(form.formState.errors.endDate && form.formState.errors.endDate.message) as string
								}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, xs: 2 }}>
							<Button fullWidth type="submit" variant="filled">
								Submit
							</Button>
						</Grid.Col>
					</Grid>
				</form>
			</Card>
			{isLoading ? (
				<Loader />
			) : (
				<>
					<CustomDisplay
						list={data.kabbik}
						handleCallback={handleDetailsPayment}
						imageUrl={'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780521478.png'}
						modalOpened={detailsOpened}
						closeModal={closeDetails}
						cardTitle="Kabbik Revenue Report"
						modalTitle="Kabbik Payment Details"
						nestedList={individual}
					/>
					<CustomDisplay
						list={data.mybl}
						handleCallback={handleMyBlDetailsPayment}
						imageUrl={'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780481387.png'}
						modalOpened={detailsOpenedMyBl}
						closeModal={closeDetailsMyBl}
						cardTitle="Mybl Revenue Report"
						modalTitle="Mybl Payment Details"
						nestedList={individual}
					/>
					<CustomDisplay
						list={data.course}
						handleCallback={handleCourseDetailsPayment}
						imageUrl={'https://kabbik-space.sgp1.digitaloceanspaces.com/course.png'}
						modalOpened={detailsOpenedCourse}
						closeModal={closeDetailsCourse}
						cardTitle="Course Revenue Report"
						modalTitle="Course Payment Details"
						nestedList={individual}
					/>
				</>
			)}
		</>
	);
}
