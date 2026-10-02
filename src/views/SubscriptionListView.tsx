'use client';

// import styles from '../../../styles/subscription.module.css';
import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	Pagination,
	Paper,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import { useDisclosure } from '@/hooks/use-disclosure';
import { IconSearch } from '@tabler/icons-react';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';

export default function SubscriptionListView({ data }: any) {
	const [detailsModalOpened, { open: openDetailsModal, close: closeDetailsModal }] =
		useDisclosure(false);

	const icon = <IconSearch size={30} strokeWidth={1} color={'black'} />;
	const rows = data?.map((element: any) => (
		<TableRow key={element.id}>
			<TableCell>{element.user_name}</TableCell>
			<TableCell>{element.user_email}</TableCell>
			<TableCell>{element.phone_no}</TableCell>

			<TableCell>
				<Button onClick={openDetailsModal} variant="outlined">
					Details
				</Button>
			</TableCell>
		</TableRow>
	));

	return (
		<PageContainer title="Subscription" items={[{ label: 'Subscription', href: '/dashboard/subscription' }]}>
			<MainCard contentSX={{ p: 0 }}>
				<TextField
					endIcon={<Button variant="text">{icon}</Button>}
					placeholder="Search by name, email or number..."
				/>
				<Box sx={{ height: 16 }} />
				<Table>
					<TableHead>
						<TableRow>
							<TableCell component="th">Name</TableCell>
							<TableCell component="th">Email</TableCell>
							<TableCell component="th">Phone Number</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>{rows}</TableBody>
				</Table>
				<Divider sx={{ my: 1 }} />
				<Pagination count={20} defaultValue={10} />
			</MainCard>
			<Dialog open={detailsModalOpened} onClose={closeDetailsModal}>
				<Typography maxWidth="xl" sx={{ width: "100%" }} fontWeight={900} style={{ textAlign: 'center' }}>
					Subscription Details
				</Typography>
				<Paper elevation={1} sx={{ p: 3 }}>
					<Typography>Subscription Details content goes here...</Typography>
				</Paper>
			</Dialog>
		</PageContainer>
	);
}
