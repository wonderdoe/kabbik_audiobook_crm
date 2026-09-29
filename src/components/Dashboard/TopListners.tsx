'use client'
import React, { useEffect, useState } from 'react'
import { Box, Button, Card, Flex, Grid, Group, Select, Table, Text } from '@mantine/core';
import CustomDateTimePicker from '../CustomDateTimePicker/CustomDateTimePicker';
import { CustomDatePicker } from '../Form/CustomDatePicker';
import { formatSeconds, getFirstDayofMonth } from '@/helper/Commonfunction';
import { CircularProgress } from '@mui/material';
import moment from 'moment';
import { getAllPromocode } from '@/services/services';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';


const formSchema = z.object({
    startDate: z.date({ required_error: 'Start date must be selected' }),
    endDate: z.date({ required_error: 'End date must be selected' }),
});

type FormData = z.infer<typeof formSchema>;


const TopListners = () => {
    const [data, setData] = useState([]);
        const [value, setValue] = useState<string | null>(null);
        const [loading,setLoading]=useState<boolean>(false);
        const [allPromocode,setAllPromocode]=useState([]);
    
        const [isLoading, setIsLoading] = useState(false);
    
    
        const getPromocodes=async()=>{
            setLoading(true);
            const list = await getAllPromocode();
            const allPromocode = list?.map((p: string) => ({
                label: p,
                value: p,
            }));
            setAllPromocode(allPromocode);
            setLoading(false);
        }
        useEffect( () => {
            getPromocodes()
        }, []);
    
        const [date, setDate] = useState({
            startDate:  moment().startOf('month').format('YYYY-MM-DD'),
            endDate: moment().format('YYYY-MM-DD'),
        });
        const [topListners,setTopListners]=useState([]);
    
        const form = useForm<FormData>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                startDate: getFirstDayofMonth(new Date()),
                endDate: new Date(),
            },
        });
    
        const getTopListners=async(startDate:string,endDate:string)=>{
            setIsLoading(true)
             try {
                const response = await fetch(`api/routes/top-listners?startDate=${startDate}&endDate=${endDate}&limit=${10}${value?'&promo_code='+value:''}`);
                if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
                }
    
                const data = await response.json();
                setTopListners(data)
                return data;
            } catch (error) {
                console.error('Error fetching user data:');
                return null;
            }finally{
                setIsLoading(false)
            }
        }
    
        const handleSubmit = async (formData: FormData) => {
            let startDate=moment(formData.startDate)?.format('YYYY-MM-DD');
            let endDate=moment(formData.endDate)?.format('YYYY-MM-DD');
            setDate({
                startDate:startDate ,
                endDate:endDate ,
            });
            getTopListners(startDate,endDate)
        };
    
        useEffect(()=>{
            getTopListners(date.startDate,date.endDate)
        },[])
    
  return (
    <div>
        <Box>
					
			<Card withBorder style={{ flexGrow: 1 }}>
				<form
					onSubmit={form.handleSubmit(handleSubmit, (err:any) => console.error(err))}
					style={{ marginBottom: '20px' }}
				>
					<Grid align="end">
						<Grid.Col span={{ base: 12, xs: 5 }}>
							<Select
								label="Select promo code"
								placeholder="Pick one"
								data={allPromocode}
								value={value}
								onChange={setValue}
								searchable
								clearable
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, xs: 5 }}>
							<CustomDatePicker
								name="startDate"
								label="Start Date"
								defaultValue={getFirstDayofMonth(new Date())}
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
							<Button disabled={isLoading} fullWidth type="submit" variant="filled">
								{isLoading?<CircularProgress size={20} sx={{ color: 'gray',marginRight:'5px' }} />:''}
								Submit
							</Button>
						</Grid.Col>
					</Grid>
				</form>
				<Text c="dimmed" tt="uppercase" fw={700} fz="xs">
					Top listners
				</Text>
				{topListners.length ? (
					<Table.ScrollContainer minWidth={100}>
						<Table>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>User Id</Table.Th>
									<Table.Th>Name</Table.Th>
									<Table.Th>Promo Code</Table.Th>
									<Table.Th>Phone</Table.Th>
									<Table.Th>Email</Table.Th>
									<Table.Th>Listening Time</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{topListners.map((item: any, index: number) => (
									<Table.Tr key={index}>
										<Table.Td>{item.user_id}</Table.Td>
										<Table.Td>{item.full_name}</Table.Td>
										<Table.Td>{item.promo_code}</Table.Td>
										<Table.Td>{item.phone_no ?? item.payer ?? ''}</Table.Td>
										<Table.Td>{item.user_email}</Table.Td>
										<Table.Td>{formatSeconds(item.total_streaming_time)}</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</Table.ScrollContainer>
				) : (
					<Text ta={'center'} my={30}>
						No data found
					</Text>
				)}
			</Card>
		</Box>
    </div>
  )
}

export default TopListners