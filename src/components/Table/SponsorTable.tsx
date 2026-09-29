'use client';

import { Badge, Paper, Rating, Space, Title, Modal } from '@mantine/core';
import { MantineReactTable, MRT_ColumnDef } from 'mantine-react-table';
import { useEffect, useMemo, useState } from 'react';
import { useCustomTable } from '@/hooks/use-custom-table';
import { useProducts } from '@/services/products';
import { Product } from '@/services/products/types';

export function SponsorTable() {
    const {  isError, isFetching, isLoading } = useProducts();
    const [sponsors,setSponsors]=useState([]);
    const [selectedDetails, setSelectedDetails] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getSponsors=async()=>{
        const response = await fetch(`/api/routes/sponsorship-request`, { cache: 'no-store' })
		const result = await response.json();
        console.log(result)
		setSponsors(result.response);
    }

    useEffect(()=>{
        getSponsors()
    },[]);


    const columns = useMemo<MRT_ColumnDef<Product>[]>(
        () => [
            {
                accessorKey: 'product_name',
                header: 'Product Name',
            },
            {
                accessorKey: 'company_product_details',
                header: 'company details',
                Cell: ({ cell }) => {
                    const text = cell.getValue() as string | null | undefined;
                    const truncated = text && text.length > 50 ? text.substring(0, 50) + '...' : text;
                    return (
                        <span 
                            onClick={() => {
                                setSelectedDetails(text || '');
                                setIsModalOpen(true);
                            }}
                            style={{ cursor: 'pointer', color: '#1971c2', textDecoration: 'underline' }}
                        >
                            {truncated}
                        </span>
                    );
                },
            },
            {
                accessorKey: 'link',
                header: 'Product Link',
                // accessorFn: row => `$${(row.price ?? 0).toFixed(2)}`,
            },
            {
                accessorKey: 'contact_person_name',
                header: 'Contact Person',
            },
            {
                accessorKey: 'contact_person_phone',
                header: 'Phone',
            },
            {
                accessorKey: 'contact_person_email',
                header: 'Email',
            },
            {
                accessorKey: 'created_at',
                header: 'created at',
                Cell: ({ cell }) => {
                    const v = cell.getValue() as string | null | undefined;
                    return v ? new Date(v).toDateString() : '';
                },
            },
            
        ],
        [],
    );

    const table = useCustomTable<Product>({
        columns,
        data: sponsors ?? [],
        rowCount: sponsors?.length ?? 0,
        state: {
            isLoading,
            showAlertBanner: isError,
            showProgressBars: isFetching,
        },
    });

    return (
        <Paper withBorder radius="md" p="md" mt="lg">
            <Title order={5}>Sponsorship Request</Title>
            {/* <Space h="md" /> */}
            <MantineReactTable table={table} />
            
            <Modal
                opened={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Company Details"
                centered
            >
                <p>{selectedDetails}</p>
            </Modal>
        </Paper>
    );
}
