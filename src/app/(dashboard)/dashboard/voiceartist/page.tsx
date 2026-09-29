"use client"
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import React, {  useMemo  } from 'react'


const data = [
    {
      name: 'John',
      age: 30,
    },
    {
      name: 'Sara',
      age: 25,
    },
  ]

export default function VoiceArtistPage() {

  //   const [rowSelection, setRowSelection] = useState({});

  // useEffect(() => {
  //   //do something when the row selection changes
  // }, [rowSelection]);

    const columns = useMemo(
        () => [
          {
            accessorKey: 'name', 
            header: 'Name',
            mantineTableHeadCellProps: { style: { color: 'green' } },
            // Cell: ({ cell }:any) => <span>{cell.getValue()}</span>, 
          },
          {
            accessorFn: (row:any) => row.age, 
            id: 'age', 
            header: 'Age',
            // Header: () => <i>Age</i>, 
          },
        ],
        [],
      );


      const table = useMantineReactTable({
        columns,
        data,
        enableColumnOrdering: true, //enable some features
        enableRowSelection: true,
        enablePagination: false, //disable a default feature
        // onRowSelectionChange: setRowSelection, //hoist row selection state to your state
        // state: { rowSelection },
      });
  return (
    <div>
        Voice Artist

<MantineReactTable table={table} />
    </div>
  )
}
