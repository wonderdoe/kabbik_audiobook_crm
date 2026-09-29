'use client';
import { Card, Select, Space, Table, Tabs, Text, Title } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
	acceptPublisherRequest,
	getPublisherList,
	getPublisherRequests,
} from '@/services/services';
import { createToast, createToast2 } from 'helpers/SweetAlert';

export const PublisherRequests = () => {
	const [activeTab, setActiveTab] = useState<string>('pending');
	const [requests, setRequests] = useState<any>([]);
	const [publishers, setPublishers] = useState<any>([]);

	const getRequests = useCallback(async () => {
		const requests = await getPublisherRequests(activeTab);
		setRequests(requests);
	}, [activeTab]);

	useEffect(() => {
		getRequests();
	}, [getRequests]);

	useEffect(() => {
		const fetchPublishers = async () => {
			const publishers = await getPublisherList();
			setPublishers(publishers);
		};
		fetchPublishers();
	}, []);

	const handleChangePublisher = async (publisherId: string, item: any) => {
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, update it!',
		}).then(async result => {
			if (result.isConfirmed) {
				const payload = {
					id: item.id,
					full_name: item.full_name,
					email: item.email,
					phone: item.phone,
					address: item.address,
					pass_hash: item.pass_hash,
					publisherId,
					publisherName: item.publisher_name,
					designation: item.role,
				};
				const data = await acceptPublisherRequest(payload);
				if (data.success) {
					createToast2(data.message);
					await getRequests();
				} else {
					createToast(data.message);
				}
			}
		});
	};

	return (
		<>
			<Title order={1}>Request Access</Title>
			<Space h="md" />
			<Tabs value={activeTab}>
				<Tabs.List>
					<Tabs.Tab value="pending" onClick={() => setActiveTab('pending')}>
						Pending
					</Tabs.Tab>
					<Tabs.Tab value="approved" onClick={() => setActiveTab('approved')}>
						Approved
					</Tabs.Tab>
				</Tabs.List>
			</Tabs>
			<Space h="md" />
			<Card withBorder>
				{requests.length > 0 ? (
					<Table.ScrollContainer minWidth={200}>
						<Table>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Full Name</Table.Th>
									<Table.Th>Email</Table.Th>
									<Table.Th>Phone</Table.Th>
									<Table.Th>Publisher Name</Table.Th>
									<Table.Th>Designation</Table.Th>
									<Table.Th>Address</Table.Th>
									<Table.Th>Approved</Table.Th>
									<Table.Th>{activeTab !== 'pending' ? 'Publisher' : 'Assign Publisher'}</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{requests.map((item: any) => (
									<Table.Tr key={item.id}>
										<Table.Td>{item.full_name}</Table.Td>
										<Table.Td>{item.email}</Table.Td>
										<Table.Td>{item.phone}</Table.Td>
										<Table.Td>{item.publisher_name}</Table.Td>
										<Table.Td>{item.role}</Table.Td>
										<Table.Td>{item.address || 'N/A'}</Table.Td>
										<Table.Td>{item.approved ? <IconCheck /> : <IconX />}</Table.Td>
										<Table.Td>
											{activeTab === 'pending' ? (
												<Select
													maw={200}
													data={[
														...publishers.map((item: any) => ({
															value: item.id.toString(),
															label: item.full_name,
														})),
														{
															value: 'admin',
															label: 'Admin',
														},
													]}
													onChange={e => handleChangePublisher(e!, item)}
												/>
											) : (
												item.publisher_name ?? 'Admin'
											)}
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</Table.ScrollContainer>
				) : (
					<Text ta={'center'}>No data</Text>
				)}
			</Card>
		</>
	);
};
