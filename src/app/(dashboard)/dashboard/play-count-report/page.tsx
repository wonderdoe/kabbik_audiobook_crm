'use client';

import {
	Box,
	Paper,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import { MuiAreaChart } from '@/components/Charts/MuiAreaChart';
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
export default function PageCountReport() {
	const [loading, setLoading] = useState(true);
	const [allData, setAllData] = useState<any>([]);

	async function lastSevenDaysUserTrack() {
		try {
			const response = await fetch(`/api/routes/play-count-report`);
			const apidata = await response.json();
			setLoading(false);
			setAllData(apidata);
		} catch (error) {}
	}

	const compareKabbikPlayCount = (index: any) => {
		if (index < 7) {
			const currentElement: any = allData[index];
			const previousElement: any = allData[index + 1];

			if (currentElement.kabbik_playcount > previousElement.kabbik_playcount) {
				return (
					<span style={{ color: 'green' }}>
						{currentElement.kabbik_playcount}
						<IconArrowUp />
					</span>
				);
			} else if (currentElement.kabbik_playcount < previousElement.kabbik_playcount) {
				return (
					<span style={{ color: 'red' }}>
						{currentElement.kabbik_playcount}
						<IconArrowDown />
					</span>
				);
			} else {
				return <span>{currentElement.kabbik_playcount}</span>;
			}
		} else {
			return <span>{allData[index].kabbik_playcount}</span>;
		}
	};

	const compareBlPlayCount = (index: any) => {
		if (index < 7) {
			const currentElement: any = allData[index];
			const previousElement: any = allData[index + 1];

			if (currentElement.mybl_playcount > previousElement.mybl_playcount) {
				return (
					<span style={{ color: 'green' }}>
						{currentElement.mybl_playcount}
						<IconArrowUp />
					</span>
				);
			} else if (currentElement.mybl_playcount < previousElement.mybl_playcount) {
				return (
					<span style={{ color: 'red' }}>
						{currentElement.mybl_playcount}
						<IconArrowDown />
					</span>
				);
			} else {
				return <span>{currentElement.mybl_playcount}</span>;
			}
		} else {
			return <span>{allData[index].mybl_playcount}</span>;
		}
	};

	const compareKabbikUniqueListenerCount = (index: any) => {
		if (index < 7) {
			const currentElement: any = allData[index];
			const previousElement: any = allData[index + 1];

			if (currentElement.kabbik_uniquecount > previousElement.kabbik_uniquecount) {
				return (
					<span style={{ color: 'green' }}>
						{currentElement.kabbik_uniquecount}
						<IconArrowUp />
					</span>
				);
			} else if (currentElement.kabbik_uniquecount < previousElement.kabbik_uniquecount) {
				return (
					<span style={{ color: 'red' }}>
						{currentElement.kabbik_uniquecount}
						<IconArrowDown />
					</span>
				);
			} else {
				return <span>{currentElement.kabbik_uniquecount}</span>;
			}
		} else {
			return <span>{allData[index].kabbik_uniquecount}</span>;
		}
	};

	const compareMyBlUniqueListenerCount = (index: any) => {
		if (index < 7) {
			const currentElement: any = allData[index];
			const previousElement: any = allData[index + 1];

			if (currentElement.mybl_uniquecount > previousElement.mybl_uniquecount) {
				return (
					<span style={{ color: 'green' }}>
						{currentElement.mybl_uniquecount}
						<IconArrowUp />
					</span>
				);
			} else if (currentElement.mybl_uniquecount < previousElement.mybl_uniquecount) {
				return (
					<span style={{ color: 'red' }}>
						{currentElement.mybl_uniquecount}
						<IconArrowDown />
					</span>
				);
			} else {
				return <span>{currentElement.mybl_uniquecount}</span>;
			}
		} else {
			return <span>{allData[index].mybl_uniquecount}</span>;
		}
	};

	useEffect(() => {
		lastSevenDaysUserTrack();
	}, []);

	return (
		<PageContainer
			title="Play Count Report"
			items={[{ label: 'Play Count Report', href: '/dashboard/play-count-report' }]}
		>
			{loading ? (
				<Loader />
			) : (
				<>
					<Typography variant="h5" component="h2" mb={'md'}>
						Overview
					</Typography>
					<Paper elevation={1} sx={{ p: 2 }}>
						<MuiAreaChart
							h={300}
							withLegend
							data={allData
								.slice(0, 7)
								.map((v: any) => ({ ...v, date: moment(v.date).format('Do MMM, YYYY') }))}
							dataKey="date"
							series={[
								{ name: 'kabbik_playcount', color: 'indigo.6', label: 'Kabbik Playcount' },
								{ name: 'mybl_playcount', color: 'green.6', label: 'Mybl Playcount' },
								{ name: 'kabbik_uniquecount', color: 'red.6', label: 'Kabbik Uniquecount' },
								{ name: 'mybl_uniquecount', color: 'yellow.6', label: 'Mybl Uniquecount' },
							]}
							curveType="linear"
						/>
					</Paper>
					<Typography variant="h5" component="h2" mb={'md'}>
						Play Count Report
					</Typography>
					<Paper elevation={1} sx={{ p: 2 }}>
						<Table>
							<TableBody>
								<TableRow>
									<TableCell>
										<Typography variant="caption" color="text.secondary">
											Date
										</Typography>
									</TableCell>
									{allData.slice(0, 7).map((element: any) => (
										<TableCell key={element.date}>
											<Typography variant="caption" color="text.secondary">
												{moment(element.date).format('Do MMM, YYYY')}
											</Typography>
										</TableCell>
									))}
								</TableRow>
								<TableRow>
									<TableCell>
										<Box component="img" 
											h={80}
											w={80}
											style={{ objectFit: 'contain' }}
											sx={{ borderRadius: 2 }}
											src={'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780521478.png'}
											alt="https://kabbik-space.sgp1.digitaloceanspaces.com/1713780521478.png"
										/>
									</TableCell>
									{allData.slice(0, 7).map((element: any, index: any) => (
										<TableCell key={element.date}>{compareKabbikPlayCount(index)}</TableCell>
									))}
								</TableRow>
								<TableRow>
									<TableCell>
										<Box component="img" 
											h={80}
											w={80}
											style={{ objectFit: 'contain' }}
											sx={{ borderRadius: 2 }}
											src={'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780481387.png'}
											alt="https://kabbik-space.sgp1.digitaloceanspaces.com/1713780481387.png"
										/>
									</TableCell>
									{allData.slice(0, 7).map((element: any, index: any) => (
										<TableCell key={element.date}>{compareBlPlayCount(index)}</TableCell>
									))}
								</TableRow>
							</TableBody>
						</Table>
					</Paper>
					<Typography variant="h5" component="h2" mb={'md'}>
						Unique Listener Count
					</Typography>
					<Paper elevation={1} sx={{ p: 2 }}>
						<Table>
							<TableBody>
								<TableRow>
									<TableCell>Date</TableCell>
									{allData.slice(0, 7).map((element: any) => (
										<TableCell key={element.date}>
											<Typography variant="caption" color="text.secondary">
												{moment(element.date).format('Do MMM, YYYY')}
											</Typography>
										</TableCell>
									))}
								</TableRow>
								<TableRow>
									<TableCell>
										<Box component="img" 
											h={80}
											w={80}
											style={{ objectFit: 'contain' }}
											sx={{ borderRadius: 2 }}
											src={'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780521478.png'}
											alt="https://kabbik-space.sgp1.digitaloceanspaces.com/1713780521478.png"
										/>
									</TableCell>
									{allData.slice(0, 7).map((element: any, index: any) => (
										<TableCell key={element.date}>
											{compareKabbikUniqueListenerCount(index)}
										</TableCell>
									))}
								</TableRow>
								<TableRow>
									<TableCell>
										<Box component="img" 
											h={80}
											w={80}
											style={{ objectFit: 'contain' }}
											sx={{ borderRadius: 2 }}
											src={'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780481387.png'}
											alt="https://kabbik-space.sgp1.digitaloceanspaces.com/1713780481387.png"
										/>
									</TableCell>
									{allData.slice(0, 7).map((element: any, index: any) => (
										<TableCell key={index}>{compareMyBlUniqueListenerCount(index)}</TableCell>
									))}
								</TableRow>
							</TableBody>
						</Table>
					</Paper>
				</>
			)}
		</PageContainer>
	);
}
