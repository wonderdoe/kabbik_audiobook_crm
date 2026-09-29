'use client';

import { Badge, Box, Card, Grid, Group, Image, Paper, Text, Title } from '@mantine/core';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import TreeDiagram from '@/components/Tree/Tree';
import styles from './styles.module.css'
import { getUserReportFormat } from '@/helper/Commonfunction';
import { set } from 'js-cookie';

type Item = {
	title: string;
	count: number;
	image: string;
};

const CustomGridDisplay = ({ list }: { list: Item[] }) => {
	return (
		
		<Grid gutter={20}>
			{list.map((item: Item) => (
				<Grid.Col key={item.title} span={{ base: 6, md: 4, lg: 2 }}>
					<Card
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							flexDirection: 'column',
							height: 180,
							flexBasis: '150px',
						}}
						radius="md"
					>
						<Group>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									flexDirection: 'column',
								}}
							>
								{item.image !== '' && (
									<Box w={60}>
										<Image
											h={60}
											w={60}
											style={{ objectFit: 'contain' }}
											radius="md"
											src={item.image}
											alt={item.image}
										/>
									</Box>
								)}
								<Text style={{ textAlign: 'center', margin: 10 }} c="dimmed" tt="uppercase" fz="xs">
									{item.title}
								</Text>
								<Badge color="pink">{item.count !== undefined ? item.count : 'N/A'}</Badge>
							</div>
						</Group>
					</Card>
				</Grid.Col>
			))}
		</Grid>
	);
};

export default function UserReport() {
	const [userCountData, setUserCountData] = useState<any>([]);
	const [subsData, setSubsData] = useState<any>([]);
	const [playCount, setPlayCount] = useState([]);
	const [loading, setLoading] = useState(true);
	const [blSubsData, setBlSubsData] = useState<any>([]);
	const [rentData,setRentData]=useState<any>([]);
	const [activeRentCount,setActiveRentCount]=useState<any>([]);
	const [uniqueTotalRentUserCount,setUniqueTotalRentUserCount]=useState<any>([]);
	const [activeRentUserCount,setActiveRentUserCount]=useState<any>([]);
	const [ShowTotalRentUniqUserCount,setShowTotalRentUniqUserCount]=useState<boolean>(false);
	const [ShowActiveRentUniqUserCount,setShowActiveRentUniqUserCount]=useState<boolean>(false);

	
	const CommonGetDataFunc = async (
		url:string,
		setData: React.Dispatch<React.SetStateAction<any[]>>,
		thenFunc?: (data: any) => void
	) => {
		try {
			const response = await fetch(url);
			const apidata = await response.json();
			
			thenFunc ? thenFunc(apidata.result):setData(getUserReportFormat(apidata.result));
		}catch (error) {
			console.error('Error fetching user count data:', error);
		}
	}


	const getData = useCallback(async () => {
		try {
			const getPlayCount = await fetch('/api/routes/play-count', { cache: 'no-store' });
			const playCountResponse = await getPlayCount.json();
			setPlayCount(playCountResponse);
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	}, []);

	useEffect(() => {
		CommonGetDataFunc(
			`/api/routes/user-count?date=${moment().format('YYYY-MM-DD')}`,
			setUserCountData
		);
		
		CommonGetDataFunc(
			`/api/routes/blSubscriberCount?date=${moment().format('YYYY-MM-DD')}`,
			setBlSubsData
		);
		CommonGetDataFunc(
			`/api/routes/rentCount?date=${moment().format('YYYY-MM-DD')}`,
			setRentData,
			(data)=>{
				setRentData(data)
			}
		);
		
		CommonGetDataFunc(
			`/api/routes/rentCount?isActive=true`,
			setActiveRentCount,
			(data)=>{
				setActiveRentCount(data)
			}
		);
		
		getData();
		CommonGetDataFunc(
			`/api/routes/subscribed-user?date=${moment().format('YYYY-MM-DD')}`,
			setSubsData,
			(data) => {
				setLoading(false);
				setSubsData(getUserReportFormat(data))
			}
		);
		CommonGetDataFunc(
			`/api/routes/rentCount?isUnique=true`,
			setUniqueTotalRentUserCount,
			(data)=>{
				setUniqueTotalRentUserCount(data)
			}
		);
		CommonGetDataFunc(
			`/api/routes/rentCount?isActive=true&isUnique=true`,
			setActiveRentUserCount,
			(data)=>{
				setActiveRentUserCount(data)
			}
		);
	}, []);

	return (
		<>
		{/* {loading?'':(
			
		)} */}
			{loading ? (
				<Loader />
			) : (
				
				<>
				
					<Title order={1} mb={16}>
						User Report
					</Title>
					<Paper shadow="xs" p="xl" style={{ padding: 25, marginBottom: '20px' }}>
						<Text size="xl" fw={900}>
							Total Lifetime Subscribers
						</Text>
						<TreeDiagram
							headingChildren={
								<div  className={styles.totalUsers}>
									<h2>LifeTime Subscribers</h2>
									<p>{userCountData.reduce((a:number,c:any)=>a+Number(c?.recurring)+Number(c?.is_onetime),0)}</p>
								</div>
							}
							childNodes={userCountData.map((item: any) => (
								<Card key={item.title}
									style={{
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										flexDirection: 'column',
										height: 190,
										flexBasis: '190px',
										padding:'6px'
									}}
									radius="md"
								>
									
								<Group>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											flexDirection: 'column',
										}}
									>
										{item.image !== '' && (
											<Box w={60}>
												<Image
													h={60}
													w={60}
													style={{ objectFit: 'contain',maxHeight: '60px',maxWidth: '60px' }}
													radius="md"
													src={item.image}
													alt={item.image}
												/>
											</Box>
										)}
										<Text style={{ textAlign: 'center', margin: '5px  0' }} c="dimmed" tt="uppercase" fz="xs">
											{item.title}
										</Text>
										<Badge color="pink">{item.count !== undefined ? Number(item.recurring)+Number(item.is_onetime) : 'N/A'}</Badge>
										<Text style={{ textAlign: 'center', margin: '5px  0' }} c="dimmed" tt="uppercase" fz="xs">
											RECURRING <br/>
											({item.recurring})
										</Text>
										<Text style={{ textAlign: 'center', margin: ' 5px 0' }} c="dimmed" tt="uppercase" fz="xs">
											ONE TIME <br/>
											({item.is_onetime})
										</Text>
									</div>
								</Group>
									
								</Card>
								// <span key={item.title} >
								// 	<div >{item.title}</div>
								// 	<div >({item.count})</div>
								// </span>
							))}
							
						/>
						{/* <CustomGridDisplay list={subsData} /> */}
					</Paper>
					<Paper shadow="xs" p="xl" style={{ padding: 25, marginBottom: '20px' }}>
						<Text size="xl" fw={900}>
							Active Subscribed Users
						</Text>
						
						<TreeDiagram
							headingChildren={
								<div  className={styles.totalUsers}>
									<h2>Subscribed Users</h2>
									<p>{subsData.reduce((a:number,c:any)=>a+Number(c?.recurring)+Number(c?.is_onetime),0)}</p>
								</div>
							}
							childNodes={subsData.map((item: any) => (
								<Card key={item.title}
									style={{
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										flexDirection: 'column',
										height: 190,
										flexBasis: '190px',
										padding:'6px'
									}}
									radius="md"
								>
									
								<Group>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											flexDirection: 'column',
										}}
									>
										{item.image !== '' && (
											<Box w={60}>
												<Image
													h={60}
													w={60}
													style={{ objectFit: 'contain',maxHeight: '60px',maxWidth: '60px' }}
													radius="md"
													src={item.image}
													alt={item.image}
												/>
											</Box>
										)}
										<Text style={{ textAlign: 'center', margin: '5px 0' }} c="dimmed" tt="uppercase" fz="xs">
											{item.title}
										</Text>
										<Badge color="pink">{item.count !== undefined ? Number(item.recurring)+Number(item.is_onetime) : 'N/A'}</Badge>
										<Text style={{ textAlign: 'center', margin: '5px 0' }} c="dimmed" tt="uppercase" fz="xs">
											RECURRING <br/>
											({item.recurring})
										</Text>
										<Text style={{ textAlign: 'center', margin: ' 5px 0' }} c="dimmed" tt="uppercase" fz="xs">
											ONE TIME <br/>
											({item.is_onetime})
										</Text>
									</div>
								</Group>
									
								</Card>
								// <span key={item.title} >
								// 	<div >{item.title}</div>
								// 	<div >({item.count})</div>
								// </span>
							))}
							
						/>
						{/* <CustomGridDisplay list={subsData} /> */}
					</Paper>
					<Paper shadow="xs" p="xl" style={{ padding: 25, marginBottom: '20px' }}>
						<div className={styles.showUniqueRentCount}>
							<Text size="xl" fw={900}>
								Total Rent Count
							</Text>
							<button 
								onClick={()=>setShowTotalRentUniqUserCount(!ShowTotalRentUniqUserCount)}
								className={styles.unique_rent_button}
							>
								{ShowTotalRentUniqUserCount? "See Total Count":"Unique User Count"}
							</button>
						</div>
						<TreeDiagram
							headingChildren={
								<div  className={styles.totalUsers}>
									<h2>Total rent</h2>
									<p>{(ShowTotalRentUniqUserCount? uniqueTotalRentUserCount  : rentData)?.reduce((a:number,c:any)=>a+Number(c.count),0)}</p>
								</div>
							}
							childNodes={(ShowTotalRentUniqUserCount? uniqueTotalRentUserCount : rentData)?.map((item: any) => (
								<Card key={item.title}
									style={{
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										flexDirection: 'column',
										height: 150,
										flexBasis: '150px',
										padding:'15px'
									}}
									radius="md"
								>
									
								<Group>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											flexDirection: 'column',
										}}
									>
										{item.image !== '' && (
											<Box w={80}>
												<Image
													h={80}
													w={80}
													style={{ objectFit: 'contain',maxHeight: '80px',maxWidth: '80px' }}
													radius="md"
													src={item.image}
													alt={item.image}
												/>
											</Box>
										)}
										<Text style={{ textAlign: 'center', margin: ' 5px 0' }} c="dimmed" tt="uppercase" fz="xs">
											{item.title}
										</Text>
										<Badge color="pink">{item.count !== undefined ? item.count : 'N/A'}</Badge>
										
									</div>
								</Group>
									
								</Card>
								// <span key={item.title} >
								// 	<div >{item.title}</div>
								// 	<div >({item.count})</div>
								// </span>
							))}
							
						/>
						{/* <CustomGridDisplay list={subsData} /> */}
					</Paper>
					<Paper shadow="xs" p="xl" style={{ padding: 25, marginBottom: '20px' }}>
						<div className={styles.showUniqueRentCount}>
							<Text size="xl" fw={900}>
								Active Rent Count
							</Text>
							<button 
								onClick={()=>setShowActiveRentUniqUserCount(!ShowActiveRentUniqUserCount)}
								className={styles.unique_rent_button}
							>
								{ShowActiveRentUniqUserCount?"See Total Count":"Unique User Count"}
							</button>
						</div>
						<TreeDiagram
							headingChildren={
								<div  className={styles.totalUsers}>
									<h2>Active rent</h2>
									<p>{(ShowActiveRentUniqUserCount? activeRentUserCount : activeRentCount)?.reduce((a:number,c:any)=>a+Number(c.count),0)}</p>
								</div>
							}
							childNodes={(ShowActiveRentUniqUserCount? activeRentUserCount : activeRentCount)?.map((item: any) => (
								<Card key={item.title}
									style={{
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										flexDirection: 'column',
										height: 150,
										flexBasis: '150px',
										padding:'15px'
									}}
									radius="md"
								>
									
								<Group>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											flexDirection: 'column',
										}}
									>
										{item.image !== '' && (
											<Box w={80}>
												<Image
													h={80}
													w={80}
													style={{ objectFit: 'contain',maxHeight: '80px',maxWidth: '80px' }}
													radius="md"
													src={item.image}
													alt={item.image}
												/>
											</Box>
										)}
										<Text style={{ textAlign: 'center', margin: ' 5px 0' }} c="dimmed" tt="uppercase" fz="xs">
											{item.title}
										</Text>
										<Badge color="pink">{item.count !== undefined ? item.count : 'N/A'}</Badge>
										
									</div>
								</Group>
									
								</Card>
								// <span key={item.title} >
								// 	<div >{item.title}</div>
								// 	<div >({item.count})</div>
								// </span>
							))}
							
						/>
						{/* <CustomGridDisplay list={subsData} /> */}
					</Paper>
					<Paper shadow="xs" p="xl" style={{ padding: 25, marginBottom: '20px' }}>
						<Text size="xl" fw={900}>
							Active Subscriber From Banglalink App
						</Text>
						<TreeDiagram
							headingChildren={
								<div  className={styles.totalUsers}>
									<h2>Banglalink Subscribed Users</h2>
									<p>{blSubsData.reduce((a:number,c:any)=>a+Number(c?.recurring)+Number(c?.is_onetime),0)}</p>
								</div>
							}
							childNodes={blSubsData.map((item: any) => (
								<Card key={item.title}
									style={{
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										flexDirection: 'column',
										height: 190,
										flexBasis: '190px',
										padding:'6px'
									}}
									radius="md"
								>
									
								<Group>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											flexDirection: 'column',
										}}
									>
										{item.image !== '' && (
											<Box w={60}>
												<Image
													h={60}
													w={60}
													style={{ objectFit: 'contain',maxHeight: '60px',maxWidth: '60px' }}
													radius="md"
													src={item.image}
													alt={item.image}
												/>
											</Box>
										)}
										<Text style={{ textAlign: 'center', margin: ' 5px 0' }} c="dimmed" tt="uppercase" fz="xs">
											{item.title}
										</Text>
										<Badge color="pink">{item.count !== undefined ? Number(item.recurring)+Number(item.is_onetime) : 'N/A'}</Badge>
										<Text style={{ textAlign: 'center', margin: '5px 0' }} c="dimmed" tt="uppercase" fz="xs">
											RECURRING <br/>
											({item.recurring})
										</Text>
										<Text style={{ textAlign: 'center', margin: '5px 0' }} c="dimmed" tt="uppercase" fz="xs">
											ONE TIME <br/>
											({item.is_onetime})
										</Text>
									</div>
								</Group>
									
								</Card>
								// <span key={item.title} >
								// 	<div >{item.title}</div>
								// 	<div >({item.count})</div>
								// </span>
							))}
							
						/>
						{/* <CustomGridDisplay list={subsData} /> */}
					</Paper>
					<Paper shadow="xs" p="xl" style={{ padding: 25 }}>
						<Text size="xl" fw={900}>
							Total Play Count
						</Text>
						<CustomGridDisplay list={playCount} />
					</Paper>
				</>
			)}
		</>
	);
}
