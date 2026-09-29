'use client';
import { AreaChart } from '@mantine/charts';
import { Image, Paper, Table, Text, Title } from '@mantine/core';
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import '@mantine/charts/styles.css';

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
		<div>
			{loading ? (
				<Loader />
			) : (
				<>
					<Title order={2} mb={'md'}>
						Overview
					</Title>
					<Paper shadow="xs" p="md" mb="md">
						<AreaChart
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
					<Title order={2} mb={'md'}>
						Sign Up Report
					</Title>
					<Paper shadow="xs" p="md" mb="md">
						<Table>
							<Table.Tbody>
								<Table.Tr>
									<Table.Td>
										<Text size="xs" color="dimmed">
											Date
										</Text>
									</Table.Td>
									{trackUser.slice(0, 7).map((element: any) => (
										<Table.Td key={element.date}>
											<Text size="xs" color="dimmed">
												{moment(element.date).format('Do MMM, YYYY')}
											</Text>
										</Table.Td>
									))}
								</Table.Tr>
								<Table.Tr>
									<Table.Td>
										<Image
											h={80}
											w={80}
											style={{ objectFit: 'contain' }}
											radius="md"
											src={'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780521478.png'}
											alt="Kabbik"
										/>
									</Table.Td>
									{trackUser.slice(0, 7).map((element: any, index: any) => (
										<Table.Td key={element.date}>{compareCount(index)}</Table.Td>
									))}
								</Table.Tr>
								<Table.Tr>
									<Table.Td>
										<Image
											h={80}
											w={80}
											style={{ objectFit: 'contain' }}
											radius="md"
											src={'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780481387.png'}
											alt="Banglalink"
										/>
									</Table.Td>
									{trackUser.slice(0, 7).map((element: any, index: any) => (
										<Table.Td key={element.date}>{compareMyBlCount(index)}</Table.Td>
									))}
								</Table.Tr>
								<Table.Tr>
									<Table.Td>
										<Image
											h={80}
											w={80}
											style={{ objectFit: 'contain' }}
											radius="md"
											src={'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780502718.png'}
											alt="Toffee"
										/>
									</Table.Td>
									{trackUser.slice(0, 7).map((element: any, index: any) => (
										<Table.Td key={element.date}>{compareToffeCount(index)}</Table.Td>
									))}
								</Table.Tr>
							</Table.Tbody>
						</Table>
					</Paper>
				</>
			)}
		</div>
	);
}
