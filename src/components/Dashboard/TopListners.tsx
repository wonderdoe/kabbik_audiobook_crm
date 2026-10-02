'use client'
import {
	Box,
	Button,
	Card,
	CircularProgress,
	Grid,
	Select,
	Stack,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import { DataSelect } from '@/components/Form/DataSelect';
import React, { useEffect, useState } from 'react'
import CustomDateTimePicker from '../CustomDateTimePicker/CustomDateTimePicker';
import { CustomDatePicker } from '../Form/CustomDatePicker';
import { formatSeconds, getFirstDayofMonth } from '@/helper/Commonfunction';
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
                const response = await fetch(`/api/routes/top-listners?startDate=${startDate}&endDate=${endDate}&limit=${10}${value?'&promo_code='+value:''}`);
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
					
			<Card variant="outlined" style={{ flexGrow: 1 }}>
				<form
					onSubmit={form.handleSubmit(handleSubmit, (err:any) => console.error(err))}
					style={{ marginBottom: '20px' }}
				>
					<Grid align="end">
						<Grid item xs={12} sm={5} >
							<DataSelect
								label="Select promo code"
								placeholder="Pick one"
								data={allPromocode}
								value={value}
								onChange={setValue}
								searchable
								clearable
							/>
						</Grid>
						<Grid item xs={12} sm={5} >
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
						</Grid>
						<Grid item xs={12} sm={5} >
							<CustomDatePicker
								name="endDate"
								label="End Date"
								control={form.control}
								placeholder={'Pick a date'}
								error={
									(form.formState.errors.endDate && form.formState.errors.endDate.message) as string
								}
							/>
						</Grid>
						<Grid item xs={12} sm={2} >
							<Button disabled={isLoading} sx={{ width: "100%" }} type="submit" variant="contained">
								{isLoading?<CircularProgress size={20} sx={{ color: 'gray',marginRight:'5px' }} />:''}
								Submit
							</Button>
						</Grid>
					</Grid>
				</form>
				<Typography color="text.secondary" textTransform="uppercase" fontWeight={700} fontSize="xs">
					Top listners
				</Typography>
				{topListners.length ? (
					<TableContainer sx={{ minWidth: 100 }}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell component="th">User Id</TableCell>
									<TableCell component="th">Name</TableCell>
									<TableCell component="th">Promo Code</TableCell>
									<TableCell component="th">Phone</TableCell>
									<TableCell component="th">Email</TableCell>
									<TableCell component="th">Listening Time</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{topListners.map((item: any, index: number) => (
									<TableRow key={index}>
										<TableCell>{item.user_id}</TableCell>
										<TableCell>{item.full_name}</TableCell>
										<TableCell>{item.promo_code}</TableCell>
										<TableCell>{item.phone_no ?? item.payer ?? ''}</TableCell>
										<TableCell>{item.user_email}</TableCell>
										<TableCell>{formatSeconds(item.total_streaming_time)}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				) : (
					<Typography textAlign={'center'} my={30}>
						No data found
					</Typography>
				)}
			</Card>
		</Box>
    </div>
  )
}

export default TopListners