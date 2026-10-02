'use client';
import {
	Badge,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Stack,
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
import { DataSelect } from '@/components/Form/DataSelect';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { fetchProductOrders, updateDeliveryStatus } from '@/services/services';
import { createToast, createToast2 } from 'helpers/SweetAlert';
import { useDisclosure } from '@/hooks/use-disclosure';
export default function ProductOrders() {
	const [loading, setLoading] = useState(true);
	const [displayData, setDisplayData] = useState<any>([]);
	const [details, setDetails] = useState<any>(null);

	const [detailsModalOpened, { open: openDetailsModal, close: closeDetailsModal }] =
		useDisclosure(false);

	const initFetchProductOrders = useCallback(async () => {
		const fechedProductOrders = await fetchProductOrders();
		if (Array.isArray(fechedProductOrders)) setDisplayData(fechedProductOrders);
		else {
			createToast('Please try again later');
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		initFetchProductOrders();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
			const result = await updateDeliveryStatus({
				newDeliveryStatus,
				productId,
			});
			if (result.status === 200) {
				createToast2(result.message);
				initFetchProductOrders();
			} else {
				createToast(result.message);
			}
		}
	};

	const rows = displayData?.map((element: any) => {
		return (
			<TableRow key={element.id}>
				<TableCell>{element.user_name}</TableCell>
				<TableCell>{element.phone.slice(element.phone.indexOf('0'))}</TableCell>
				<TableCell>{element.product_name}</TableCell>
				<TableCell>
					<Stack direction="row" flexWrap="wrap" direction={'row'} spacing={10} align={'center'}>
						{JSON.parse(element.store_item).map((item: any, index: number) => (
							<Stack direction="row" flexWrap="wrap" key={index} align={'center'} direction={'column'}>
								<Box component="img" 
									key={index}
									fit="contain"
									height={50}
									src={item.image_url}
									alt={item.image_url}
								/>
								{item.selected_size ? (
									<div
										style={{
											width: '90px',
											border: '1px solid #55555533',
											padding: '5px',
											borderRadius: '7px',
										}}
									>
</div>
								) : (
									<></>
								)}
							</Stack>
						))}
					</Stack>
				</TableCell>
				<TableCell>
					<DataSelect
						value={element.delivery_status}
						onChange={(evt: any) => handleUpdateDeliveryStatus(evt, element.order_id)}
						data={['ordered', 'shipped', 'delivered']}
						allowDeselect={false}
						startIcon={null}
						style={{ width: '150px' }}
					/>
				</TableCell>
				<TableCell>
					<Button
						onClick={() => {
							setDetails(element);
							openDetailsModal();
						}}
					>
						Details
					</Button>
				</TableCell>
			</TableRow>
		);
	});

	return (
		<PageContainer title="Product Orders" items={[{ label: 'Product Orders', href: '/dashboard/product-orders' }]}>
			<MainCard contentSX={{ p: 0 }}>
				{loading ? (
					<Box display="flex" justifyContent="center" alignItems="center">
						<CircularProgress size={24} />
					</Box>
				) : (
					<>
						<TableContainer sx={{ minWidth: 800 }}>
							<Table verticalSpacing="xs" horizontalSpacing="xs">
								<TableHead>
									<TableRow>
										<TableCell component="th">User Name</TableCell>
										<TableCell component="th">Phone</TableCell>
										<TableCell component="th">Product Name</TableCell>
										<TableCell component="th">Store Item</TableCell>
										<TableCell component="th">Delivery Status</TableCell>
										<TableCell component="th">Action</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{displayData?.length > 0 ? (
										rows
									) : (
										<Box display="flex" justifyContent="center" alignItems="center">
											<Typography>No Data Found</Typography>
										</Box>
									)}
								</TableBody>
							</Table>
						</TableContainer>
						<Divider sx={{ my: 1 }} />
					</>
				)}
			</MainCard>

			<Dialog
				
				maxWidth="xl" sx={{ width: "100%" }}
				open={detailsModalOpened}
				onClose={closeDetailsModal}
			>
<DialogTitle>Details</DialogTitle>
<DialogContent>
				<TableContainer sx={{ minWidth: 200 }}>
					<Table>
						<TableHead>
							<TableCell component="th">User Id</TableCell>
							<TableCell component="th">Order Id</TableCell>
							<TableCell component="th">Address</TableCell>
						</TableHead>
						<TableBody>
							<TableCell>{details?.user_id}</TableCell>
							<TableCell>{details?.order_id}</TableCell>
							<TableCell>
								{details?.address.charAt(0).toUpperCase() + details?.address.slice(1)}
							</TableCell>
						</TableBody>
					</Table>
				</TableContainer>
			</DialogContent>
</Dialog>
		</PageContainer>
	);
}
