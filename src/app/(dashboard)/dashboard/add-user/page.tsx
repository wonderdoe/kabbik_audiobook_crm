'use client';

import {
	Button,
	Divider,
	Flex,
	Modal,
	Paper,
	PasswordInput,
	Select,
	Table,
	TextInput,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { createToast, createToast2 } from 'helpers/SweetAlert';
import Loader from '@/components/Loader';
import { createActivityLog } from '@/helper/Commonfunction';

export default function Roles() {
	const [addUserOpened, { open: openAddUser, close: closeAddUser }] = useDisclosure(false);
	const [details, setDetails] = useState<any>(null);
	const [detailsModalOpened, { open: openDetailsModal, close: closeDetailsModal }] =
		useDisclosure(false);

	const [userData, setUserData]: any = useState([]);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [role, setRole] = useState();
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(true);

	async function getData() {
		try {
			setLoading(true);
			const response = await fetch('/api/routes/user');
			const apidata = await response.json();
			setUserData(apidata);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}
	const handleAddUser = async (e: any) => {
		e.preventDefault();
		if (!name || name === '') {
			createToast('Name is Required');
		} else if (!email || email === '') {
			createToast('Email is Required');
		} else if (!phoneNumber || phoneNumber === '') {
			createToast('Phone Number is Required');
		} else if (!role || role === '') {
			createToast('Select Role');
		} else if (!password || password === '') {
			createToast('Password is Required');
		} else if (!confirmPassword || confirmPassword === '') {
			createToast('Re-type Password');
		} else if (password !== confirmPassword) {
			createToast("Password Didn't Match");
		} else {
			try {
				let data:any = {
					name: name,
					email: email,
					password: password,
					phone_no: phoneNumber,
					role_id: role,
				};

				const response = await fetch('/api/routes/register', {
					method: 'POST',
					body: JSON.stringify(data),
				});
				delete data.password; // Remove password from the payload for security
				let activityLogPayload = {
					name: 'Create User',
					action_type: 'create',
					payload:JSON.stringify({ data }),
					api_end_point: `/api/routes/register`,
				}
				createActivityLog(activityLogPayload);
				const apidata = await response.json();

				if (apidata.status === 201) {
					createToast2('User Added Successfully');
					getData();
					closeAddUser();
				}
			} catch (error) {}
		}
	};

	useEffect(() => {
		getData();
	}, []);

	const rows = userData.map((element: any) => (
		<Table.Tr key={element.id}>
			<Table.Td>{element.name || 'N/A'}</Table.Td>
			<Table.Td>{element.email || 'N/A'}</Table.Td>
			<Table.Td>{element.phone_no || 'N/A'}</Table.Td>
			<Table.Td>{element.role_id === 1 ? 'Admin' : 'Moderator'}</Table.Td>
			<Table.Td>
				<Button
					onClick={() => {
						openDetailsModal();
						setDetails(element);
					}}
				>
					Details
				</Button>
			</Table.Td>
		</Table.Tr>
	));

	return loading ? (
		<Loader />
	) : (
		<>
			<Flex justify={'space-between'}>
				<Title order={1} style={{ marginBottom: 20 }}>
					Admin List
				</Title>
				<Button onClick={openAddUser} variant="filled">
					Add User
				</Button>
			</Flex>
			<Paper withBorder radius="md" p="md">
				<Table.ScrollContainer minWidth={200}>
					<Table>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Name</Table.Th>
								<Table.Th>Email</Table.Th>
								<Table.Th>Phone Number</Table.Th>
								<Table.Th>Designation</Table.Th>
								<Table.Th>Action</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>{rows}</Table.Tbody>
					</Table>
				</Table.ScrollContainer>
				<Divider my="sm" />
			</Paper>

			<Modal
				opened={addUserOpened}
				onClose={closeAddUser}
				title="Add User"
				centered
				classNames={{
					title: 'mantine-modal-title',
					close: 'mantine-modal-close',
				}}
				size={'lg'}
			>
				<Paper shadow="xs" p="xl">
					<form onSubmit={handleAddUser}>
						<TextInput
							py={10}
							label="Name"
							type="text"
							onChange={e => setName(e.target.value)}
							placeholder="Name"
						/>
						<TextInput
							py={10}
							label="Email"
							type="email"
							onChange={e => setEmail(e.target.value)}
							placeholder="Email"
						/>
						<TextInput
							py={10}
							label="Phone Number"
							type="test"
							onChange={e => setPhoneNumber(e.target.value)}
							placeholder="Phone Number"
						/>
						<Select
							py={10}
							label="Role"
							data={[
								{ value: '1', label: 'Admin' },
								{ value: '2', label: 'Moderator' },
							]}
							placeholder="Select Value"
							value={role}
							onChange={(option: any) => {
								setRole(option);
							}}
						/>
						<PasswordInput
							onChange={e => setPassword(e.target.value)}
							label="Password"
							placeholder="Password"
							py={10}
							type="password"
						/>
						<PasswordInput
							placeholder="Password"
							label="Confirm Password"
							onChange={e => setConfirmPassword(e.target.value)}
							py={10}
							type="password"
						/>
						<Button type="submit">Create</Button>
					</form>
				</Paper>
			</Modal>
			<Modal
				title="Details"
				opened={detailsModalOpened}
				onClose={closeDetailsModal}
				classNames={{
					title: 'mantine-modal-title',
					close: 'mantine-modal-close',
				}}
				size={'lg'}
				centered
			>
				<Table.ScrollContainer minWidth={100}>
					<Table>
						<Table.Thead>
							<Table.Th>Designation Id</Table.Th>
							<Table.Th>Created at</Table.Th>
							<Table.Th>Updated at</Table.Th>
						</Table.Thead>
						<Table.Tbody>
							<Table.Tr>
								<Table.Td>{details?.role_id || 'N/A'}</Table.Td>
								<Table.Td>
									{moment(details?.created_at).format('Do MMM YYYY h:mma') || 'N/A'}
								</Table.Td>
								<Table.Td>
									{moment(details?.updated_at).format('Do MMM YYYY h:mma') || 'N/A'}
								</Table.Td>
							</Table.Tr>
						</Table.Tbody>
					</Table>
				</Table.ScrollContainer>
			</Modal>
		</>
	);
}
