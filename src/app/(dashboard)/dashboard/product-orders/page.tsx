'use client';

import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import { DataSelect } from '@/components/Form/DataSelect';
import { DetailGrid } from '@/components/ui/DetailGrid';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { fetchProductOrders, updateDeliveryStatus } from '@/services/services';
import { createToast, createToast2 } from 'helpers/SweetAlert';
import { useDisclosure } from '@/hooks/use-disclosure';

const deliveryChipColor: Record<string, 'default' | 'info' | 'success'> = {
	ordered: 'default',
	shipped: 'info',
	delivered: 'success',
};

export default function ProductOrders() {
	const [loading, setLoading] = useState(true);
	const [displayData, setDisplayData] = useState<any>([]);
	const [details, setDetails] = useState<any>(null);
	const [statusFilter, setStatusFilter] = useState<string>('');
	const [search, setSearch] = useState('');

	const [detailsModalOpened, { open: openDetailsModal, close: closeDetailsModal }] = useDisclosure(false);

	const initFetchProductOrders = useCallback(async () => {
		const fechedProductOrders = await fetchProductOrders();
		if (Array.isArray(fechedProductOrders)) setDisplayData(fechedProductOrders);
		else createToast('Please try again later');
		setLoading(false);
	}, []);

	useEffect(() => {
		initFetchProductOrders();
	}, [initFetchProductOrders]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return displayData.filter((element: any) => {
			if (statusFilter && element.delivery_status !== statusFilter) return false;
			if (!q) return true;
			return (
				String(element.user_name ?? '').toLowerCase().includes(q) ||
				String(element.product_name ?? '').toLowerCase().includes(q) ||
				String(element.phone ?? '').includes(q)
			);
		});
	}, [displayData, search, statusFilter]);

	const handleUpdateDeliveryStatus = async (newDeliveryStatus: string, productId: string) => {
		const swalResult = await Swal.fire({
			title: 'Are you sure?',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, Update it!',
		});
		if (swalResult.isConfirmed) {
			const result = await updateDeliveryStatus({ newDeliveryStatus, productId });
			if (result.status === 200) {
				createToast2(result.message);
				initFetchProductOrders();
			} else {
				createToast(result.message);
			}
		}
	};

	return (
		<PageContainer title="Product Orders" items={[{ label: 'Product Orders', href: '/dashboard/product-orders' }]}>
			<Stack spacing={2}>
				<MainCard title="Filters">
					<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
						<TextField
							size="small"
							label="Search"
							placeholder="User, product, or phone"
							value={search}
							onChange={e => setSearch(e.target.value)}
							fullWidth
						/>
						<FormControl size="small" sx={{ minWidth: 160 }}>
							<InputLabel>Delivery status</InputLabel>
							<Select
								label="Delivery status"
								value={statusFilter}
								onChange={e => setStatusFilter(e.target.value)}
							>
								<MenuItem value="">All</MenuItem>
								<MenuItem value="ordered">Ordered</MenuItem>
								<MenuItem value="shipped">Shipped</MenuItem>
								<MenuItem value="delivered">Delivered</MenuItem>
							</Select>
						</FormControl>
					</Stack>
				</MainCard>

				<MainCard contentSX={{ p: 0 }}>
					{loading ? (
						<Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 6 }}>
							<CircularProgress size={24} />
						</Box>
					) : (
						<TableContainer sx={{ minWidth: 800 }}>
							<Table size="small">
								<TableHead>
									<TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
										<TableCell>User Name</TableCell>
										<TableCell>Phone</TableCell>
										<TableCell>Product Name</TableCell>
										<TableCell>Store Item</TableCell>
										<TableCell>Delivery Status</TableCell>
										<TableCell>Action</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{filtered.length === 0 ? (
										<TableRow>
											<TableCell colSpan={6}>
												<Typography textAlign="center" color="text.secondary" py={4}>
													No data found
												</Typography>
											</TableCell>
										</TableRow>
									) : (
										filtered.map((element: any) => (
											<TableRow key={element.id} hover>
												<TableCell>{element.user_name}</TableCell>
												<TableCell>{element.phone.slice(element.phone.indexOf('0'))}</TableCell>
												<TableCell>{element.product_name}</TableCell>
												<TableCell>
													<Stack direction="row" flexWrap="wrap" spacing={1}>
														{JSON.parse(element.store_item).map((item: any, index: number) => (
															<Box
																key={index}
																component="img"
																src={item.image_url}
																alt=""
																sx={{ height: 50, objectFit: 'contain', borderRadius: 1 }}
															/>
														))}
													</Stack>
												</TableCell>
												<TableCell>
													<Stack spacing={1}>
														<Chip
															size="small"
															variant="outlined"
															color={deliveryChipColor[element.delivery_status] ?? 'default'}
															label={element.delivery_status}
														/>
														<DataSelect
															value={element.delivery_status}
															onChange={(evt: any) => handleUpdateDeliveryStatus(evt, element.order_id)}
															data={['ordered', 'shipped', 'delivered']}
															allowDeselect={false}
															startIcon={null}
															style={{ width: '150px' }}
														/>
													</Stack>
												</TableCell>
												<TableCell>
													<Button
														size="small"
														variant="outlined"
														onClick={() => {
															setDetails(element);
															openDetailsModal();
														}}
													>
														Details
													</Button>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</TableContainer>
					)}
				</MainCard>
			</Stack>

			<Dialog open={detailsModalOpened} onClose={closeDetailsModal} maxWidth="md" fullWidth>
				<DialogTitle>Order details</DialogTitle>
				<DialogContent>
					<DetailGrid
						fields={[
							{ label: 'User Id', value: details?.user_id },
							{ label: 'Order Id', value: details?.order_id },
							{
								label: 'Address',
								value: details?.address
									? details.address.charAt(0).toUpperCase() + details.address.slice(1)
									: '—',
							},
						]}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={closeDetailsModal}>Close</Button>
				</DialogActions>
			</Dialog>
		</PageContainer>
	);
}
