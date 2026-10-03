'use client';

import {
	Box,
	Button,
	Chip,
	Dialog,
	DialogContent,
	DialogTitle,
	FormControl,
	Grid,
	IconButton,
	InputAdornment,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Typography,
	type SelectChangeEvent,
} from '@mui/material';
import {
	DirectoryListCard,
	directoryTableSx,
} from '@/components/directory/directoryListUi';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import { TableThumbnail } from '@/components/mantis/TableThumbnail';
import { DetailGrid } from '@/components/ui/DetailGrid';
import { StatCard } from '@/components/ui/StatCard';
import Loader from '@/components/Loader';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useIsMobileSm } from '@/hooks/use-is-mobile-sm';
import { fetchProductOrders, updateDeliveryStatus } from '@/services/services';
import { formatPhoneNumber } from '@/utils/globalHelpers';
import { createToast, createToast2 } from 'helpers/SweetAlert';
import {
	IconEye,
	IconPackage,
	IconSearch,
	IconTruck,
	IconTruckDelivery,
	IconX,
} from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

type DeliveryStatus = 'ordered' | 'shipped' | 'delivered';

type StoreItem = { image_url?: string; name?: string };

export type ProductOrderRow = {
	id: number;
	user_id: number;
	user_name: string;
	phone: string;
	product_name: string;
	order_id: string;
	store_item: string;
	delivery_status: DeliveryStatus;
	address: string;
};

const PAGE_SIZE = 20;

const deliveryChipColor: Record<DeliveryStatus, 'default' | 'info' | 'success'> = {
	ordered: 'default',
	shipped: 'info',
	delivered: 'success',
};

const deliveryLabel: Record<DeliveryStatus, string> = {
	ordered: 'Ordered',
	shipped: 'Shipped',
	delivered: 'Delivered',
};

function parseStoreItems(raw: unknown): StoreItem[] {
	if (!raw) return [];
	if (Array.isArray(raw)) return raw as StoreItem[];
	try {
		const parsed = JSON.parse(String(raw));
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function formatPhone(phone: string | undefined | null) {
	if (!phone) return '—';
	const local = phone.includes('0') ? phone.slice(phone.indexOf('0')) : phone;
	return formatPhoneNumber(local) || local;
}

export default function ProductOrders() {
	const isMobileSm = useIsMobileSm();
	const [loading, setLoading] = useState(true);
	const [orders, setOrders] = useState<ProductOrderRow[]>([]);
	const [details, setDetails] = useState<ProductOrderRow | null>(null);
	const [statusFilter, setStatusFilter] = useState<DeliveryStatus | ''>('');
	const [searchInput, setSearchInput] = useState('');
	const [searchKey, setSearchKey] = useState('');
	const [currentPage, setCurrentPage] = useState(1);

	const [detailsModalOpened, { open: openDetailsModal, close: closeDetailsModal }] =
		useDisclosure(false);

	const loadOrders = useCallback(async () => {
		setLoading(true);
		try {
			const fetched = await fetchProductOrders();
			if (Array.isArray(fetched)) setOrders(fetched as ProductOrderRow[]);
			else createToast('Please try again later');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadOrders();
	}, [loadOrders]);

	const statusCounts = useMemo(() => {
		const counts = { ordered: 0, shipped: 0, delivered: 0 };
		for (const row of orders) {
			if (row.delivery_status in counts) counts[row.delivery_status as DeliveryStatus] += 1;
		}
		return counts;
	}, [orders]);

	const filtered = useMemo(() => {
		const q = searchKey.trim().toLowerCase();
		return orders.filter(row => {
			if (statusFilter && row.delivery_status !== statusFilter) return false;
			if (!q) return true;
			return (
				String(row.user_name ?? '').toLowerCase().includes(q) ||
				String(row.product_name ?? '').toLowerCase().includes(q) ||
				String(row.phone ?? '').includes(q) ||
				String(row.order_id ?? '').toLowerCase().includes(q)
			);
		});
	}, [orders, searchKey, statusFilter]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const pageRows = useMemo(() => {
		const start = (currentPage - 1) * PAGE_SIZE;
		return filtered.slice(start, start + PAGE_SIZE);
	}, [filtered, currentPage]);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchKey, statusFilter]);

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSearchKey(searchInput.trim());
	};

	const clearSearch = () => {
		setSearchInput('');
		setSearchKey('');
	};

	const handleUpdateDeliveryStatus = async (newDeliveryStatus: string, productId: string) => {
		const swalResult = await Swal.fire({
			title: 'Update delivery status?',
			text: `Mark this order as “${deliveryLabel[newDeliveryStatus as DeliveryStatus] ?? newDeliveryStatus}”.`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, update',
		});
		if (!swalResult.isConfirmed) return;

		const result = await updateDeliveryStatus({ newDeliveryStatus, productId });
		if (result.status === 200) {
			createToast2(result.message);
			void loadOrders();
		} else {
			createToast(result.message);
		}
	};

	const onStatusSelect = (orderId: string) => (e: SelectChangeEvent<string>) => {
		const next = e.target.value;
		if (!next) return;
		void handleUpdateDeliveryStatus(next, orderId);
	};

	const openDetails = (row: ProductOrderRow) => {
		setDetails(row);
		openDetailsModal();
	};

	const detailStoreItems = parseStoreItems(details?.store_item);

	return (
		<PageContainer
			title="Product Orders"
			subtitle="Successful store redemptions and fulfillment status"
			items={[{ label: 'Product Orders', href: '/dashboard/product-orders' }]}
		>
			<Stack spacing={2} sx={{ minWidth: 0, width: '100%' }}>
				<Grid container spacing={2}>
					<Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
						<StatCard
							title="Total orders"
							value={orders.length}
							color="primary"
							icon={<IconPackage size={22} />}
							loading={loading}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
						<StatCard
							title="Ordered"
							value={statusCounts.ordered}
							color="warning"
							icon={<IconPackage size={22} />}
							loading={loading}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
						<StatCard
							title="Shipped"
							value={statusCounts.shipped}
							color="info"
							icon={<IconTruck size={22} />}
							loading={loading}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
						<StatCard
							title="Delivered"
							value={statusCounts.delivered}
							color="success"
							icon={<IconTruckDelivery size={22} />}
							loading={loading}
						/>
					</Grid>
				</Grid>

				<MainCard title="Search & filter">
					<Stack
						component="form"
						onSubmit={handleSearchSubmit}
						direction={{ xs: 'column', md: 'row' }}
						spacing={1.5}
						alignItems={{ xs: 'stretch', md: 'center' }}
						sx={{ width: '100%' }}
					>
						<TextField
							size="small"
							label="Search"
							placeholder="User, product, phone, or order id…"
							value={searchInput}
							onChange={e => setSearchInput(e.target.value)}
							sx={{ flex: 1, minWidth: 0 }}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<IconSearch size={18} style={{ opacity: 0.55 }} />
									</InputAdornment>
								),
							}}
						/>
						<FormControl
							size="small"
							sx={{
								flexShrink: 0,
								width: { xs: '100%', md: 200 },
							}}
						>
							<InputLabel>Delivery status</InputLabel>
							<Select
								label="Delivery status"
								value={statusFilter}
								onChange={e => setStatusFilter(e.target.value as DeliveryStatus | '')}
							>
								<MenuItem value="">All statuses</MenuItem>
								<MenuItem value="ordered">Ordered</MenuItem>
								<MenuItem value="shipped">Shipped</MenuItem>
								<MenuItem value="delivered">Delivered</MenuItem>
							</Select>
						</FormControl>
						<Stack
							direction="row"
							spacing={1}
							sx={{
								flexShrink: 0,
								width: { xs: '100%', md: 'auto' },
							}}
						>
							<Button
								type="submit"
								variant="contained"
								size="small"
								sx={{ flex: { xs: 1, md: 'none' }, whiteSpace: 'nowrap' }}
							>
								Search
							</Button>
							{searchKey ? (
								<Button
									type="button"
									variant="outlined"
									size="small"
									color="inherit"
									onClick={clearSearch}
									sx={{ flex: { xs: 1, md: 'none' }, whiteSpace: 'nowrap' }}
								>
									Clear
								</Button>
							) : null}
						</Stack>
					</Stack>
				</MainCard>

				{loading ? (
					<Loader />
				) : (
					<DirectoryListCard
						title="Orders"
						subtitle={
							searchKey || statusFilter
								? `${filtered.length.toLocaleString()} matching`
								: undefined
						}
						totalCount={filtered.length}
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
						isEmpty={filtered.length === 0}
						emptyMessage={
							searchKey || statusFilter
								? 'No orders match your filters.'
								: 'No product orders yet.'
						}
					>
						<Table size="small" sx={directoryTableSx}>
							<TableHead>
								<TableRow>
									<TableCell>Customer</TableCell>
									<TableCell>Product</TableCell>
									<TableCell>Items</TableCell>
									<TableCell width={120}>Status</TableCell>
									<TableCell align="right" sx={{ width: 240, minWidth: 240 }}>
										Actions
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{pageRows.map(row => {
									const items = parseStoreItems(row.store_item);
									return (
										<TableRow key={row.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
											<TableCell>
												<Typography variant="body2" fontWeight={600}>
													{row.user_name || '—'}
												</Typography>
												<Typography variant="caption" color="text.secondary" display="block">
													{formatPhone(row.phone)}
												</Typography>
											</TableCell>
											<TableCell>
												<Typography variant="body2" fontWeight={500}>
													{row.product_name || '—'}
												</Typography>
												<Typography variant="caption" color="text.secondary" display="block">
													Order {row.order_id}
												</Typography>
											</TableCell>
											<TableCell>
												<Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
													{items.length === 0 ? (
														<Typography variant="caption" color="text.secondary">—</Typography>
													) : (
														items.map((item, index) => (
															<TableThumbnail
																key={index}
																src={item.image_url}
																alt={item.name ?? 'Store item'}
																objectFit="contain"
																displaySize="sm"
															/>
														))
													)}
												</Stack>
											</TableCell>
											<TableCell>
												<Chip
													size="small"
													variant="outlined"
													color={deliveryChipColor[row.delivery_status] ?? 'default'}
													label={deliveryLabel[row.delivery_status] ?? row.delivery_status}
												/>
											</TableCell>
											<TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
												<Stack
													direction="row"
													spacing={1}
													justifyContent="flex-end"
													alignItems="center"
												>
													<FormControl size="small" sx={{ minWidth: 120 }}>
														<Select
															value={row.delivery_status}
															onChange={onStatusSelect(row.order_id)}
															displayEmpty
															sx={{ fontSize: '0.8125rem' }}
														>
															<MenuItem value="ordered">Ordered</MenuItem>
															<MenuItem value="shipped">Shipped</MenuItem>
															<MenuItem value="delivered">Delivered</MenuItem>
														</Select>
													</FormControl>
													<Button
														size="small"
														variant="text"
														startIcon={<IconEye size={16} />}
														onClick={() => openDetails(row)}
													>
														Details
													</Button>
												</Stack>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</DirectoryListCard>
				)}
			</Stack>

			<Dialog
				open={detailsModalOpened}
				onClose={closeDetailsModal}
				maxWidth="md"
				fullWidth
				fullScreen={isMobileSm}
				scroll="paper"
			>
				<DialogTitle sx={{ pr: 6 }}>
					Order details
					<Typography variant="body2" color="text.secondary" fontWeight={400}>
						{details?.user_name ?? 'Customer'} · {details?.product_name ?? 'Product'}
					</Typography>
				</DialogTitle>
				<IconButton
					onClick={closeDetailsModal}
					sx={{ position: 'absolute', right: 12, top: 12 }}
					aria-label="Close"
				>
					<IconX size={20} />
				</IconButton>
				<DialogContent dividers>
					<Stack spacing={3}>
						<DetailGrid
							fields={[
								{ label: 'User ID', value: details?.user_id },
								{ label: 'Order ID', value: details?.order_id },
								{
									label: 'Delivery status',
									value: details?.delivery_status
										? deliveryLabel[details.delivery_status]
										: '—',
								},
								{
									label: 'Address',
									value: details?.address
										? details.address.charAt(0).toUpperCase() + details.address.slice(1)
										: '—',
								},
							]}
						/>
						{detailStoreItems.length > 0 ? (
							<Box>
								<Typography variant="subtitle2" gutterBottom>
									Store items
								</Typography>
								<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
									{detailStoreItems.map((item, index) => (
										<TableThumbnail
											key={index}
											src={item.image_url}
											alt={item.name ?? 'Store item'}
											objectFit="contain"
											displaySize="md"
										/>
									))}
								</Stack>
							</Box>
						) : null}
					</Stack>
				</DialogContent>
			</Dialog>
		</PageContainer>
	);
}
