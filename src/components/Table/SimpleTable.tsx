'use client';



import {
	Box,
	Paper,
	Typography,
} from '@mui/material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';

import { useMemo } from 'react';

import { useCustomTable } from '@/hooks/use-custom-table';



type Person = {

	name: {

		firstName: string;

		lastName: string;

	};

	address: string;

	city: string;

	state: string;

};



const data: Person[] = [

	{

		name: { firstName: 'Zachary', lastName: 'Davis' },

		address: '261 Battle Ford',

		city: 'Columbus',

		state: 'Ohio',

	},

	{

		name: { firstName: 'Robert', lastName: 'Smith' },

		address: '566 Brakus Inlet',

		city: 'Westerville',

		state: 'West Virginia',

	},

	{

		name: { firstName: 'Kevin', lastName: 'Yan' },

		address: '7777 Kuhic Knoll',

		city: 'South Linda',

		state: 'West Virginia',

	},

	{

		name: { firstName: 'John', lastName: 'Upton' },

		address: '722 Emie Stream',

		city: 'Huntington',

		state: 'Washington',

	},

	{

		name: { firstName: 'Nathan', lastName: 'Harris' },

		address: '1 Kuhic Knoll',

		city: 'Ohiowa',

		state: 'Nebraska',

	},

];



export const SimpleTable = () => {

	const columns = useMemo<MRT_ColumnDef<Person>[]>(

		() => [

			{ accessorKey: 'name.firstName', header: 'First Name' },

			{ accessorKey: 'name.lastName', header: 'Last Name' },

			{ accessorKey: 'address', header: 'Address' },

			{ accessorKey: 'city', header: 'City' },

			{ accessorKey: 'state', header: 'State' },

		],

		[],

	);



	const table = useCustomTable({ columns, data });



	return (

		<Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>

			<Typography variant="subtitle2" component="h5">Simple</Typography>

			<Box sx={{ height: 16 }} />

			<MaterialReactTable table={table} />

		</Paper>

	);

};


