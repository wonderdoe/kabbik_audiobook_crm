'use client';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
} from '@mui/material';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';

import { DataSelect } from '@/components/Form/DataSelect';
import { useDisclosure } from '@/hooks/use-disclosure';
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
	const [role, setRole] = useState<string | null>(null);
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(true);

	const resetAddUserForm = () => {
		setName('');
		setEmail('');
		setPhoneNumber('');
		setRole(null);
		setPassword('');
		setConfirmPassword('');
	};

	const handleCloseAddUser = () => {
		closeAddUser();
		resetAddUserForm();
	};

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
					handleCloseAddUser();
				}
			} catch (error) {}
		}
	};

	useEffect(() => {
		getData();
	}, []);

	const rows = userData.map((element: any) => (
		<TableRow key={element.id}>
			<TableCell>{element.name || 'N/A'}</TableCell>
			<TableCell>{element.email || 'N/A'}</TableCell>
			<TableCell>{element.phone_no || 'N/A'}</TableCell>
			<TableCell>{element.role_id === 1 ? 'Admin' : 'Moderator'}</TableCell>
			<TableCell>
				<Button
					variant="outlined"
					size="small"
					onClick={() => {
						openDetailsModal();
						setDetails(element);
					}}
				>
					Details
				</Button>
			</TableCell>
		</TableRow>
	));

	return loading ? (
		<Loader />
	) : (
		<PageContainer
			title="Add User"
			items={[{ label: 'Add User', href: '/dashboard/add-user' }]}
			actions={
				<Button variant="contained" onClick={openAddUser}>
					Add User
				</Button>
			}
		>

<MainCard contentSX={{ p: 0 }}>
				<TableContainer sx={{ minWidth: 200 }}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell component="th">Name</TableCell>
								<TableCell component="th">Email</TableCell>
								<TableCell component="th">Phone Number</TableCell>
								<TableCell component="th">Designation</TableCell>
								<TableCell component="th">Action</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>{rows}</TableBody>
					</Table>
				</TableContainer>
				<Divider sx={{ my: 1 }} />
			</MainCard>

			<Dialog open={addUserOpened} onClose={handleCloseAddUser} maxWidth="sm" fullWidth>
				<DialogTitle>Add User</DialogTitle>
				<DialogContent dividers>
					<Box component="form" id="add-user-form" onSubmit={handleAddUser} sx={{ pt: 0.5 }}>
						<Grid container spacing={2}>
							<Grid item xs={12} sm={6}>
								<TextField
									label="Name"
									value={name}
									onChange={e => setName(e.target.value)}
									placeholder="Name"
									fullWidth
									size="small"
									required
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									label="Email"
									type="email"
									value={email}
									onChange={e => setEmail(e.target.value)}
									placeholder="Email"
									fullWidth
									size="small"
									required
									autoComplete="off"
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									label="Phone Number"
									type="tel"
									value={phoneNumber}
									onChange={e => setPhoneNumber(e.target.value)}
									placeholder="Phone Number"
									fullWidth
									size="small"
									required
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<DataSelect
									label="Role"
									data={[
										{ value: '1', label: 'Admin' },
										{ value: '2', label: 'Moderator' },
									]}
									placeholder="Select role"
									value={role}
									required
									onChange={(option: string | null) => {
										setRole(option);
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									type="password"
									value={password}
									onChange={e => setPassword(e.target.value)}
									label="Password"
									placeholder="Password"
									fullWidth
									size="small"
									required
									autoComplete="new-password"
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									type="password"
									value={confirmPassword}
									onChange={e => setConfirmPassword(e.target.value)}
									label="Confirm Password"
									placeholder="Confirm password"
									fullWidth
									size="small"
									required
									autoComplete="new-password"
								/>
							</Grid>
						</Grid>
					</Box>
				</DialogContent>
				<DialogActions sx={{ px: 3, py: 2 }}>
					<Button variant="outlined" color="inherit" onClick={handleCloseAddUser}>
						Cancel
					</Button>
					<Button type="submit" form="add-user-form" variant="contained">
						Create
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={detailsModalOpened} onClose={closeDetailsModal} maxWidth="md" fullWidth>
				<DialogTitle>Details</DialogTitle>
				<DialogContent dividers>
					<TableContainer>
						<Table size="small">
							<TableHead>
								<TableRow>
									<TableCell component="th">Designation Id</TableCell>
									<TableCell component="th">Created at</TableCell>
									<TableCell component="th">Updated at</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								<TableRow>
									<TableCell>{details?.role_id || 'N/A'}</TableCell>
									<TableCell>
										{moment(details?.created_at).format('Do MMM YYYY h:mma') || 'N/A'}
									</TableCell>
									<TableCell>
										{moment(details?.updated_at).format('Do MMM YYYY h:mma') || 'N/A'}
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</TableContainer>
				</DialogContent>
				<DialogActions sx={{ px: 3, py: 2 }}>
					<Button variant="contained" onClick={closeDetailsModal}>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</PageContainer>
	);
}
