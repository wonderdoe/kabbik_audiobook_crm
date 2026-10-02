'use client';

import {
	Badge,
	Box,
	Paper,
	Rating,
	Typography,
} from '@mui/material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { useMemo } from 'react';
import { useCustomTable } from '@/hooks/use-custom-table';
import { useProducts } from '@/services/products';
import { Product } from '@/services/products/types';

export function PaginationTable() {
	const { data, isError, isFetching, isLoading } = useProducts();

	const columns = useMemo<MRT_ColumnDef<Product>[]>(
		() => [
			{
				accessorKey: 'code',
				header: 'Code',
			},
			{
				accessorKey: 'name',
				header: 'Name',
			},
			{
				accessorKey: 'price',
				header: 'Price',
				accessorFn: row => `$${(row.price ?? 0).toFixed(2)}`,
			},
			{
				accessorKey: 'category',
				header: 'Category',
			},
			{
				accessorKey: 'rating',
				header: 'Reviews',
				Cell: ({ cell }) => <Rating defaultValue={cell.getValue<number>()} readOnly />,
			},
			{
				accessorKey: 'inventoryStatus',
				header: 'Status',
				Cell: ({ cell }) => {
					const status = cell.getValue<'INSTOCK' | 'OUTOFSTOCK' | 'LOWSTOCK'>();
					let color: 'red' | 'yellow' | 'green' = 'red';
					if (status === 'INSTOCK') color = 'green';
					else if (status === 'LOWSTOCK') color = 'yellow';
					const muiColor = color === 'green' ? 'success' : color === 'yellow' ? 'warning' : 'error';
					return <Badge color={muiColor}>{status}</Badge>;
				},
				filterVariant: 'select',
				filterSelectOptions: [
					{ label: 'In Stock', value: 'INSTOCK' },
					{ label: 'Out of Stock', value: 'OUTOFSTOCK' },
					{ label: 'Low Stock', value: 'LOWSTOCK' },
				],
			},
		],
		[],
	);

	const table = useCustomTable<Product>({
		columns,
		data: data ?? [],
		rowCount: data?.length ?? 0,
		state: {
			isLoading,
			showAlertBanner: isError,
			showProgressBars: isFetching,
		},
	});

	return (
		<Paper variant="outlined" sx={{ borderRadius: 2, p: 2, mt: 3 }}>
			<Typography variant="subtitle2" component="h5">Pagintion Example</Typography>
			<Box sx={{ height: 16 }} />
			<MaterialReactTable table={table} />
		</Paper>
	);
}
