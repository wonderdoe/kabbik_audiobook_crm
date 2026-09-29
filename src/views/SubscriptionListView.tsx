'use client';

import {
	Button,
	Divider,
	Modal,
	Pagination,
	Paper,
	Space,
	Table,
	Text,
	TextInput,
	Title,
	UnstyledButton,
} from '@mantine/core';

// import styles from '../../../styles/subscription.module.css';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';

export default function SubscriptionListView({ data }: any) {
	const [detailsModalOpened, { open: openDetailsModal, close: closeDetailsModal }] =
		useDisclosure(false);

	const icon = <IconSearch size={30} strokeWidth={1} color={'black'} />;
	const rows = data?.map((element: any) => (
		<Table.Tr key={element.id}>
			<Table.Td>{element.user_name}</Table.Td>
			<Table.Td>{element.user_email}</Table.Td>
			<Table.Td>{element.phone_no}</Table.Td>

			<Table.Td>
				<Button onClick={openDetailsModal} variant="outline">
					Details
				</Button>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<div>
			<Title order={1} style={{ marginBottom: 20 }}>
				Subscription
			</Title>
			<Paper withBorder radius="md" p="md">
				<TextInput
					mt="md"
					rightSection={<UnstyledButton>{icon}</UnstyledButton>}
					placeholder="Search by name, email or number..."
				/>
				<Space h="md" />
				<Table>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Name</Table.Th>
							<Table.Th>Email</Table.Th>
							<Table.Th>Phone Number</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rows}</Table.Tbody>
				</Table>
				<Divider my="sm" />
				<Pagination total={20} siblings={1} defaultValue={10} />
			</Paper>
			<Modal opened={detailsModalOpened} onClose={closeDetailsModal} centered>
				<Text size="xl" fw={900} style={{ textAlign: 'center' }}>
					Subscription Details
				</Text>
				<Paper shadow="xs" p="xl">
					<Text>Subscription Details content goes here...</Text>
				</Paper>
			</Modal>
		</div>
	);
}
