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
export default function SignUpReport() {
	const [loading, setLoading] = useState(true);
	const [trackUser, setTrackUser] = useState<any>([]);
	async function lastSevenDaysUserTrack() {
		try {
			const response = await fetch(`/api/routes/last-seven-days-sign-up`, {
				cache: 'no-store',
				method: 'POST',
			});
			
			const apidata = await response.json();
			setLoading(false);

			setTrackUser(apidata);
		} catch (error) {}
	}

	const compareCount = (index: number) => {
		if (index < 7) {
			const currentElement: any = trackUser[index];
			const previousElement: any = trackUser[index + 1];

			if (currentElement.kabbikCount > previousElement.kabbikCount) {
				return (
					<span style={{ color: 'green' }}>
						{currentElement.kabbikCount}
						<IconArrowUp />
					</span>
				);
			} else if (currentElement.kabbikCount < previousElement.kabbikCount) {
				return (
					<span style={{ color: 'red' }}>
						{currentElement.kabbikCount}
						<IconArrowDown />
					</span>
				);
			} else {
				return <span>{currentElement.kabbikCount}</span>;
			}
		} else {
			return <span>{trackUser[index].kabbikCount}</span>;
		}
	};

	const compareMyBlCount = (index: number) => {
		if (index < 7) {
			const currentElement: any = trackUser[index];
			const previousElement: any = trackUser[index + 1];

			if (currentElement.myBLCount > previousElement.myBLCount) {
				return (
					<span style={{ color: 'green' }}>
						{currentElement.myBLCount}
						<IconArrowUp />
					</span>
				);
			} else if (currentElement.myBLCount < previousElement.myBLCount) {
				return (
					<span style={{ color: 'red' }}>
						{currentElement.myBLCount}
						<IconArrowDown />
					</span>
				);
			} else {
				return <span>{currentElement.myBLCount}</span>;
			}
		} else {
			return <span>{trackUser[index].myBLCount}</span>;
		}
	};

	const compareToffeCount = (index: number) => {
		if (index < 7) {
			const currentElement: any = trackUser[index];
			const previousElement: any = trackUser[index + 1];

			if (currentElement.toffeeCount > previousElement.toffeeCount) {
				return (
					<span style={{ color: 'green' }}>
						{currentElement.toffeeCount}
						<IconArrowUp />
					</span>
				);
			} else if (currentElement.toffeeCount < previousElement.toffeeCount) {
				return (
					<span style={{ color: 'red' }}>
						{currentElement.toffeeCount}
						<IconArrowDown />
					</span>
				);
			} else {
				return <span>{currentElement.toffeeCount}</span>;
			}
		} else {
			return <span>{trackUser[index].toffeeCount}</span>;
		}
	};

	useEffect(() => {
		lastSevenDaysUserTrack();
	}, []);
	return (
		<PageContainer
			title="Sign Up Report"
			items={[{ label: 'Sign Up Report', href: '/dashboard/sign-up-report' }]}
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
							data={trackUser
								.slice(0, 7)
								.map((v: any) => ({ ...v, date: moment(v.date).format('Do MMM, YYYY') }))}
							dataKey="date"
							series={[
								{ name: 'kabbikCount', color: 'indigo.6', label: 'Kabbik Count' },
								{ name: 'myBLCount', color: 'green.6', label: 'Mybl Count' },
								{ name: 'toffeeCount', color: 'red.6', label: 'Toffee Count' },
							]}
							curveType="linear"
						/>
					</Paper>
					<Typography variant="h5" component="h2" mb={'md'}>
						Sign Up Report
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
									{trackUser.slice(0, 7).map((element: any) => (
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
											alt="Kabbik"
										/>
									</TableCell>
									{trackUser.slice(0, 7).map((element: any, index: any) => (
										<TableCell key={element.date}>{compareCount(index)}</TableCell>
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
											alt="Banglalink"
										/>
									</TableCell>
									{trackUser.slice(0, 7).map((element: any, index: any) => (
										<TableCell key={element.date}>{compareMyBlCount(index)}</TableCell>
									))}
								</TableRow>
								<TableRow>
									<TableCell>
										<Box component="img" 
											h={80}
											w={80}
											style={{ objectFit: 'contain' }}
											sx={{ borderRadius: 2 }}
											src={'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780502718.png'}
											alt="Toffee"
										/>
									</TableCell>
									{trackUser.slice(0, 7).map((element: any, index: any) => (
										<TableCell key={element.date}>{compareToffeCount(index)}</TableCell>
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
