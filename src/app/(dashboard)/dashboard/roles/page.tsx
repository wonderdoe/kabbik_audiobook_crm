'use client';
import {
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Paper,
	Stack,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';

import { useDisclosure } from '@/hooks/use-disclosure';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';

export default function Roles() {
	const [loading, setLoading] = useState(true);
	const [addRoleOpened, { open: openAddRole, close: closeAddRole }] = useDisclosure(false);
	const [assignOpened, { open: openAssign, close: closeAssign }] = useDisclosure(false);
	const [menuData, setMenuData] = useState<any>([]);

	const rows = menuData.map((element: any) => (
		<TableRow key={element.id}>
			<TableCell>{element.name || 'N/A'}</TableCell>
			<TableCell>{element.email || 'N/A'}</TableCell>
			<TableCell>{element.phone || 'N/A'}</TableCell>
			<TableCell>
				<Button onClick={openAssign} variant="outlined">
					Assign
				</Button>
			</TableCell>
		</TableRow>
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
		<PageContainer title="Role List" items={[{ label: 'Roles', href: '/dashboard/roles' }]}>

<MainCard contentSX={{ p: 0 }}>
				<TableContainer sx={{ minWidth: 100 }}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell component="th">Name</TableCell>
								<TableCell component="th">Email</TableCell>
								<TableCell component="th">Phone Number</TableCell>
								<TableCell component="th">Action</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>{rows}</TableBody>
					</Table>
				</TableContainer>
			</MainCard>

			<Dialog open={addRoleOpened} onClose={closeAddRole} title="">
				<Typography maxWidth="xl" sx={{ width: "100%" }} fontWeight={900} style={{ textAlign: 'center' }}>
					Add Role
				</Typography>
				{menuData.map((item: any) => (
					<Paper key={item.id} elevation={1} sx={{ p: 3 }}>
						<Typography>
							<span style={{ fontWeight: 'bold' }}>Name: </span> {item?.menuName}
						</Typography>
						<Typography>
							<span style={{ fontWeight: 'bold' }}>Details: </span>
							{item?.menuDetails}
						</Typography>
						<Typography>
							<span style={{ fontWeight: 'bold' }}>Created at:</span> {item?.createdAt}
						</Typography>
						<Typography>
							<span style={{ fontWeight: 'bold' }}>Updated at:</span> {item?.updatedAt}
						</Typography>
					</Paper>
				))}
			</Dialog>

			<Dialog open={assignOpened} onClose={closeAssign} title="">
				<Typography maxWidth="xl" sx={{ width: "100%" }} fontWeight={900} style={{ textAlign: 'center' }}>
					Assign Role
				</Typography>
				<Paper elevation={1} sx={{ p: 3 }}>
					<Typography>Assign role content goes here...</Typography>
				</Paper>
			</Dialog>
		</PageContainer>
	);
}
