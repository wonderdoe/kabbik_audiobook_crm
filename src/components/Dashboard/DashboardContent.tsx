'use client';
import { AreaChart } from '@mantine/charts';
import '@mantine/charts/styles.css';
import { Box, Button, Card, Flex, Grid, Group, Select, Table, Text } from '@mantine/core';
import CustomDateTimePicker from '../CustomDateTimePicker/CustomDateTimePicker';
import { CustomDatePicker } from '../Form/CustomDatePicker';
import { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatSeconds, getFirstDayofMonth } from '@/helper/Commonfunction';
import { CircularProgress } from '@mui/material';
import { CustomSelect } from '../Form/CustomSelect';
import { getAllPromocode } from '@/services/services';


const formSchema = z.object({
	startDate: z.date({ required_error: 'Start date must be selected' }),
	endDate: z.date({ required_error: 'End date must be selected' }),
});

type FormData = z.infer<typeof formSchema>;

const Board = ({ title, count }: { title: string; count: number }) => (
	<Card withBorder key={title} p="md" radius="md" style={{ flexGrow: 1 }}>
		<Group>
			<div>
				<Text c="dimmed" tt="uppercase" fw={700} fz="xs">
					{title}
				</Text>
				<Text fw={700} fz="xl">
					{count}
				</Text>
			</div>
		</Group>
	</Card>
);

export function DashboardContent({ dashboardData, recentTotalPayments, topMostUsedPromos }: any) {

	return (
		<>
			<Flex direction={'column'} gap={'md'}>
				<Flex direction={{ base: 'column', xs: 'row' }} h="100%" gap="md" wrap={'wrap'}>
					{console.log(dashboardData,"dkdkkdkdk")}
					{dashboardData?.slice(0, 3).map((item: any) => (
						<Board key={item.title} title={item.title} count={item.count} />
					))}
				</Flex>
				<Flex direction={{ base: 'column', xs: 'row' }} h="100%" gap="md" wrap={'wrap'}>
					{dashboardData?.slice(4).map((item: any) => (
						<Board key={item.title} title={item.title} count={item.count} />
					))}
				</Flex>
				<Flex direction={{ base: 'column', xs: 'row' }} h="100%" gap="md" wrap={'wrap'}>
					{dashboardData?.[3]?.count?.slice(0, 2).map((item: any, index: any) => (
						<Board
							key={item.date}
							title={`${!index ? 'Today' : 'Yesterday'}'s bkash new recurring subscribers`}
							count={item.Count}
						/>
					))}
				</Flex>
				<Card withBorder>
					<Text c="dimmed" tt="uppercase" fw={700} fz="xs" mb={15}>
						Recent Bkash New Recurring Subscribers
					</Text>
					<AreaChart
						h={300}
						data={dashboardData[3].count}
						dataKey="date"
						series={[{ name: 'Count', color: 'indigo.6' }]}
						curveType="linear"
					/>
				</Card>
				<Flex direction={{ base: 'column', xs: 'row' }} gap="md" wrap={'wrap'}>
					{recentTotalPayments?.slice(0, 2).map((item: any, index: number) => (
						<Board
							key={item.date}
							title={`${index ? 'Yesterday' : 'Today'}'s total payment`}
							count={item.Amount}
						/>
					))}
				</Flex>
				<Card withBorder>
					<Text c="dimmed" tt="uppercase" fw={700} fz="xs" mb={15}>
						Recent Total Payment
					</Text>
					<AreaChart
						h={300}
						data={recentTotalPayments}
						dataKey="date"
						series={[{ name: 'Amount', color: 'indigo.6' }]}
						curveType="linear"
						valueFormatter={(value: number) => `${value} Tk`}
					/>
				</Card>
				<Flex direction={{ base: 'column', xs: 'row' }} gap="md" wrap={'wrap'}>
					<Card withBorder style={{ flexGrow: 1 }}>
						<Text c="dimmed" tt="uppercase" fw={700} fz="xs">
							Today&apos;s most used promocodes
						</Text>
						{topMostUsedPromos.today.length ? (
							<Table.ScrollContainer minWidth={100}>
								<Table>
									<Table.Thead>
										<Table.Tr>
											<Table.Th>Promocode</Table.Th>
											<Table.Th>Type</Table.Th>
											<Table.Th>Count</Table.Th>
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{topMostUsedPromos.today.map((item: any, index: number) => (
											<Table.Tr key={index}>
												<Table.Td key={index}>{item.promo_code}</Table.Td>
												<Table.Td key={index}>{item.name}</Table.Td>
												<Table.Td key={index}>{item.promo_count}</Table.Td>
											</Table.Tr>
										))}
									</Table.Tbody>
								</Table>
							</Table.ScrollContainer>
						) : (
							<Text ta={'center'} my={30}>
								No promocode used yet
							</Text>
						)}
					</Card>
					<Card withBorder style={{ flexGrow: 1 }}>
						<Text c="dimmed" tt="uppercase" fw={700} fz="xs">
							Yesterday&apos;s most used promocodes
						</Text>
						{topMostUsedPromos.yesterday.length ? (
							<Table.ScrollContainer minWidth={100}>
								<Table>
									<Table.Thead>
										<Table.Tr>
											<Table.Th>Promocode</Table.Th>
											<Table.Th>Type</Table.Th>
											<Table.Th>Count</Table.Th>
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{topMostUsedPromos.yesterday.map((item: any, index: number) => (
											<Table.Tr key={index}>
												<Table.Td key={index}>{item.promo_code}</Table.Td>
												<Table.Td key={index}>{item.name}</Table.Td>
												<Table.Td key={index}>{item.promo_count}</Table.Td>
											</Table.Tr>
										))}
									</Table.Tbody>
								</Table>
							</Table.ScrollContainer>
						) : (
							<Text ta={'center'} my={30}>
								No promocode used yet
							</Text>
						)}
					</Card>
				</Flex>
				
			</Flex>
			
		</>
	);
}
