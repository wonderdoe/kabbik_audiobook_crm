'use client';

import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import { MaterialReactTable } from 'material-react-table';
import { useMemo } from 'react';
import { useCustomTable } from '@/hooks/use-custom-table';

const data = [
	{
		name: 'John',
		age: 30,
	},
	{
		name: 'Sara',
		age: 25,
	},
];

export default function VoiceArtistPage() {
	const columns = useMemo(
		() => [
			{
				accessorKey: 'name',
				header: 'Name',
				muiTableHeadCellProps: { sx: { color: 'green' } },
			},
			{
				accessorFn: (row: { age: number }) => row.age,
				id: 'age',
				header: 'Age',
			},
		],
		[],
	);

	const table = useCustomTable({
		columns,
		data,
		enableColumnOrdering: true,
		enableRowSelection: true,
		enablePagination: false,
	});

	return (
		<PageContainer
			title="Voice Artist"
			items={[{ label: 'Voice Artist', href: '/dashboard/voiceartist' }]}
		>
			<MainCard>
				<MaterialReactTable table={table} />
			</MainCard>
		</PageContainer>
	);
}
