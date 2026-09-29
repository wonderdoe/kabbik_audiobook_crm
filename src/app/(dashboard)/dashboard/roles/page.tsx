'use client';

import { Button, Flex, Modal, Paper, Table, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';

export default function Roles() {
	const [loading, setLoading] = useState(true);
	const [addRoleOpened, { open: openAddRole, close: closeAddRole }] = useDisclosure(false);
	const [assignOpened, { open: openAssign, close: closeAssign }] = useDisclosure(false);
	const [menuData, setMenuData] = useState<any>([]);

	const rows = menuData.map((element: any) => (
		<Table.Tr key={element.id}>
			<Table.Td>{element.name || 'N/A'}</Table.Td>
			<Table.Td>{element.email || 'N/A'}</Table.Td>
			<Table.Td>{element.phone || 'N/A'}</Table.Td>
			<Table.Td>
				<Button onClick={openAssign} variant="outline">
					Assign
				</Button>
			</Table.Td>
		</Table.Tr>
	));

	async function getData() {
		try {
			setLoading(true);
			const response = await fetch('/api/routes/rolelist');
			const apidata = await response.json();
			setMenuData(apidata);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		getData();
	}, []);

	return loading ? (
		<Loader />
	) : (
		<>
			<Flex justify={'space-between'}>
				<Title order={1} style={{ marginBottom: 20 }}>
					Role List
				</Title>
				{/* <Button onClick={openAddRole} variant="filled">
				Add Role
			</Button> */}
			</Flex>
			<Paper withBorder radius="md" p="md">
				<Table.ScrollContainer minWidth={100}>
					<Table>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Name</Table.Th>
								<Table.Th>Email</Table.Th>
								<Table.Th>Phone Number</Table.Th>
								<Table.Th>Action</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>{rows}</Table.Tbody>
					</Table>
				</Table.ScrollContainer>
			</Paper>

			<Modal opened={addRoleOpened} onClose={closeAddRole} title="" centered>
				<Text size="xl" fw={900} style={{ textAlign: 'center' }}>
					Add Role
				</Text>
				{menuData.map((item: any) => (
					<Paper key={item.id} shadow="xs" p="xl">
						<Text>
							<span style={{ fontWeight: 'bold' }}>Name: </span> {item?.menuName}
						</Text>
						<Text>
							<span style={{ fontWeight: 'bold' }}>Details: </span>
							{item?.menuDetails}
						</Text>
						<Text>
							<span style={{ fontWeight: 'bold' }}>Created at:</span> {item?.createdAt}
						</Text>
						<Text>
							<span style={{ fontWeight: 'bold' }}>Updated at:</span> {item?.updatedAt}
						</Text>
					</Paper>
				))}
			</Modal>

			<Modal opened={assignOpened} onClose={closeAssign} title="" centered>
				<Text size="xl" fw={900} style={{ textAlign: 'center' }}>
					Assign Role
				</Text>
				<Paper shadow="xs" p="xl">
					<Text>Assign role content goes here...</Text>
				</Paper>
			</Modal>
		</>
	);
}
