'use client';
import {
	Box,
	Card,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tabs,
	Typography,
} from '@mui/material';
import { DataSelect } from '@/components/Form/DataSelect';
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
			<Typography variant="h4" component="h1">Request Access</Typography>
			<Box sx={{ height: 16 }} />
			<Tabs value={activeTab}>
				<Box>
					<Tab value="pending" onClick={() => setActiveTab('pending')}>
						Pending
					</Tab>
					<Tab value="approved" onClick={() => setActiveTab('approved')}>
						Approved
					</Tab>
				</Box>
			</Tabs>
			<Box sx={{ height: 16 }} />
			<Card variant="outlined">
				{requests.length > 0 ? (
					<TableContainer sx={{ minWidth: 200 }}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell component="th">Full Name</TableCell>
									<TableCell component="th">Email</TableCell>
									<TableCell component="th">Phone</TableCell>
									<TableCell component="th">Publisher Name</TableCell>
									<TableCell component="th">Designation</TableCell>
									<TableCell component="th">Address</TableCell>
									<TableCell component="th">Approved</TableCell>
									<TableCell component="th">{activeTab !== 'pending' ? 'Publisher' : 'Assign Publisher'}</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{requests.map((item: any) => (
									<TableRow key={item.id}>
										<TableCell>{item.full_name}</TableCell>
										<TableCell>{item.email}</TableCell>
										<TableCell>{item.phone}</TableCell>
										<TableCell>{item.publisher_name}</TableCell>
										<TableCell>{item.role}</TableCell>
										<TableCell>{item.address || 'N/A'}</TableCell>
										<TableCell>{item.approved ? <IconCheck /> : <IconX />}</TableCell>
										<TableCell>
											{activeTab === 'pending' ? (
												<DataSelect
													sx={{ maxWidth: 200 }}
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
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				) : (
					<Typography textAlign={'center'}>No data</Typography>
				)}
			</Card>
		</>
	);
};
