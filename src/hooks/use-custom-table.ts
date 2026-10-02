import {
	type MRT_ColumnDef,
	type MRT_TableOptions,
	useMaterialReactTable,
} from 'material-react-table';

export type { MRT_ColumnDef };

export type CustomTableOptions<TData extends Record<string, unknown> = Record<string, unknown>> =
	Omit<
		MRT_TableOptions<TData>,
		| 'manualPagination'
		| 'enablePagination'
		| 'paginationDisplayMode'
		| 'initialState'
	> & {
		initialState?: MRT_TableOptions<TData>['initialState'];
	};

export const useCustomTable = <TData extends Record<string, unknown> = Record<string, unknown>>(
	tableOptions: CustomTableOptions<TData>,
) => {
	return useMaterialReactTable({
		paginationDisplayMode: 'pages',
		manualFiltering: true,
		positionActionsColumn: 'last',
		muiTablePaperProps: {
			elevation: 0,
			sx: {
				borderRadius: 2,
				border: '1px solid',
				borderColor: 'divider',
				p: 2,
			},
		},
		muiTableProps: {
			sx: { '& td, & th': { textAlign: 'center' } },
		},
		displayColumnDefOptions: {
			'mrt-row-actions': {
				size: 200,
			},
		},
		muiFilterTextFieldProps: {
			variant: 'outlined',
			size: 'small',
			sx: { mt: 1 },
		},
		muiFilterSelectProps: {
			variant: 'outlined',
			size: 'small',
			sx: { mt: 1 },
		},
		enableColumnActions: false,
		enableDensityToggle: false,
		enableFullScreenToggle: false,
		enableHiding: false,
		enablePinning: false,
		initialState: {
			density: 'comfortable',
		},
		columns: [],
		data: [],
		...tableOptions,
	});
};
