'use client';

import {
	Avatar,
	Box,
	Chip,
	Stack,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tabs,
	Tooltip,
	Typography,
} from '@mui/material';
import { MainCard } from '@/components/mantis/MainCard';
import { DataSelect } from '@/components/Form/DataSelect';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
	acceptPublisherRequest,
	getPublisherList,
	getPublisherRequests,
} from '@/services/services';
import { createToast, createToast2 } from 'helpers/SweetAlert';

function initials(name: string) {
	return name
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map(p => p[0]?.toUpperCase())
		.join('');
}

export const PublisherRequests = () => {
	const [activeTab, setActiveTab] = useState<string>('pending');
	const [requests, setRequests] = useState<any>([]);
	const [publishers, setPublishers] = useState<any>([]);

	const getRequests = useCallback(async () => {
		const data = await getPublisherRequests(activeTab);
		setRequests(data);
	}, [activeTab]);

	useEffect(() => {
		getRequests();
	}, [getRequests]);

	useEffect(() => {
		const fetchPublishers = async () => {
			const list = await getPublisherList();
			setPublishers(list);
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
		<Stack spacing={2}>
			<MainCard
				title="Request access"
				secondary={
					<Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
						<Tab label="Pending" value="pending" />
						<Tab label="Approved" value="approved" />
					</Tabs>
				}
			>
				{requests.length > 0 ? (
					<TableContainer>
						<Table size="small">
							<TableHead>
								<TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
									<TableCell>Contact</TableCell>
									<TableCell>Publisher</TableCell>
									<TableCell>Designation</TableCell>
									<TableCell>Address</TableCell>
									<TableCell>Status</TableCell>
									<TableCell>{activeTab !== 'pending' ? 'Publisher' : 'Assign publisher'}</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{requests.map((item: any) => (
									<TableRow key={item.id} hover>
										<TableCell>
											<Stack direction="row" spacing={1.5} alignItems="center">
												<Tooltip title={item.full_name}>
													<Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
														{initials(item.full_name || '?')}
													</Avatar>
												</Tooltip>
												<Box>
													<Typography variant="body2" fontWeight={600}>{item.full_name}</Typography>
													<Typography variant="caption" color="text.secondary" display="block">
														{item.email}
													</Typography>
													<Typography variant="caption" color="text.secondary">{item.phone}</Typography>
												</Box>
											</Stack>
										</TableCell>
										<TableCell>{item.publisher_name}</TableCell>
										<TableCell>{item.role}</TableCell>
										<TableCell>{item.address || 'N/A'}</TableCell>
										<TableCell>
											<Chip
												size="small"
												variant="outlined"
												color={item.approved ? 'success' : 'warning'}
												label={item.approved ? 'Approved' : 'Pending'}
											/>
										</TableCell>
										<TableCell>
											{activeTab === 'pending' ? (
												<DataSelect
													sx={{ maxWidth: 220 }}
													data={[
														...publishers.map((p: any) => ({
															value: p.id.toString(),
															label: p.full_name,
														})),
														{ value: 'admin', label: 'Admin' },
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
					<Typography textAlign="center" color="text.secondary" py={4}>No data</Typography>
				)}
			</MainCard>
		</Stack>
	);
};
