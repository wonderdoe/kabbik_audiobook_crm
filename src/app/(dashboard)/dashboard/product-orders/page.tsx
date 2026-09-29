'use client';
import {
	Badge,
	Button,
	Center,
	Divider,
	Flex,
	Modal,
	Paper,
	Select,
	Space,
	Table,
	Text,
	Title,
} from '@mantine/core';
import { Loader as MantineLoader } from '@mantine/core';
import { Image } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { fetchProductOrders, updateDeliveryStatus } from '@/services/services';
import { createToast, createToast2 } from 'helpers/SweetAlert';
import { useDisclosure } from '@mantine/hooks';

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
			<Table.Tr key={element.id}>
				<Table.Td>{element.user_name}</Table.Td>
				<Table.Td>{element.phone.slice(element.phone.indexOf('0'))}</Table.Td>
				<Table.Td>{element.product_name}</Table.Td>
				<Table.Td>
					<Flex direction={'row'} gap={10} align={'center'}>
						{JSON.parse(element.store_item).map((item: any, index: number) => (
							<Flex key={index} align={'center'} direction={'column'}>
								<Image
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
										<Flex gap={10} justify={'space-evenly'}>
											<span>Size</span> <Badge>{item.selected_size}</Badge>
										</Flex>
									</div>
								) : (
									<></>
								)}
							</Flex>
						))}
					</Flex>
				</Table.Td>
				<Table.Td>
					<Select
						value={element.delivery_status}
						onChange={(evt: any) => handleUpdateDeliveryStatus(evt, element.order_id)}
						data={['ordered', 'shipped', 'delivered']}
						allowDeselect={false}
						leftSection={null}
						checkIconPosition="right"
						style={{ width: '150px' }}
					/>
				</Table.Td>
				<Table.Td>
					<Button
						onClick={() => {
							setDetails(element);
							openDetailsModal();
						}}
					>
						Details
					</Button>
				</Table.Td>
			</Table.Tr>
		);
	});

	return (
		<div>
			<Title order={1}>Product Orders</Title>
			<Space h="md" />
			<Paper withBorder radius="md" p="md">
				{loading ? (
					<Center>
						<MantineLoader size={24} />
					</Center>
				) : (
					<>
						<Table.ScrollContainer minWidth={800}>
							<Table verticalSpacing="xs" horizontalSpacing="xs">
								<Table.Thead>
									<Table.Tr>
										<Table.Th>User Name</Table.Th>
										<Table.Th>Phone</Table.Th>
										<Table.Th>Product Name</Table.Th>
										<Table.Th>Store Item</Table.Th>
										<Table.Th>Delivery Status</Table.Th>
										<Table.Th>Action</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{displayData?.length > 0 ? (
										rows
									) : (
										<Center>
											<Text>No Data Found</Text>
										</Center>
									)}
								</Table.Tbody>
							</Table>
						</Table.ScrollContainer>
						<Divider my="sm" />
					</>
				)}
			</Paper>

			<Modal
				title="Details"
				size={'xl'}
				opened={detailsModalOpened}
				onClose={closeDetailsModal}
				centered
				classNames={{ title: 'mantine-modal-title', close: 'mantine-modal-close' }}
			>
				<Table.ScrollContainer minWidth={200}>
					<Table>
						<Table.Thead>
							<Table.Th>User Id</Table.Th>
							<Table.Th>Order Id</Table.Th>
							<Table.Th>Address</Table.Th>
						</Table.Thead>
						<Table.Tbody>
							<Table.Td>{details?.user_id}</Table.Td>
							<Table.Td>{details?.order_id}</Table.Td>
							<Table.Td>
								{details?.address.charAt(0).toUpperCase() + details?.address.slice(1)}
							</Table.Td>
						</Table.Tbody>
					</Table>
				</Table.ScrollContainer>
			</Modal>
		</div>
	);
}
