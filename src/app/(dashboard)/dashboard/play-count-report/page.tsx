'use client';

import { AreaChart } from '@mantine/charts';
import { Image, Paper, Table, Text, Title } from '@mantine/core';
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import '@mantine/charts/styles.css';

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
					<Title order={2} mb={'md'}>
						Play Count Report
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
									{allData.slice(0, 7).map((element: any) => (
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
											alt="https://kabbik-space.sgp1.digitaloceanspaces.com/1713780521478.png"
										/>
									</Table.Td>
									{allData.slice(0, 7).map((element: any, index: any) => (
										<Table.Td key={element.date}>{compareKabbikPlayCount(index)}</Table.Td>
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
											alt="https://kabbik-space.sgp1.digitaloceanspaces.com/1713780481387.png"
										/>
									</Table.Td>
									{allData.slice(0, 7).map((element: any, index: any) => (
										<Table.Td key={element.date}>{compareBlPlayCount(index)}</Table.Td>
									))}
								</Table.Tr>
							</Table.Tbody>
						</Table>
					</Paper>
					<Title order={2} mb={'md'}>
						Unique Listener Count
					</Title>
					<Paper shadow="xs" p="md" mb="md">
						<Table>
							<Table.Tbody>
								<Table.Tr>
									<Table.Td>Date</Table.Td>
									{allData.slice(0, 7).map((element: any) => (
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
											alt="https://kabbik-space.sgp1.digitaloceanspaces.com/1713780521478.png"
										/>
									</Table.Td>
									{allData.slice(0, 7).map((element: any, index: any) => (
										<Table.Td key={element.date}>
											{compareKabbikUniqueListenerCount(index)}
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
											src={'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780481387.png'}
											alt="https://kabbik-space.sgp1.digitaloceanspaces.com/1713780481387.png"
										/>
									</Table.Td>
									{allData.slice(0, 7).map((element: any, index: any) => (
										<Table.Td key={index}>{compareMyBlUniqueListenerCount(index)}</Table.Td>
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
