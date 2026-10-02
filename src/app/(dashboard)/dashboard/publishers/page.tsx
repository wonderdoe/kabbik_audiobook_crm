'use client';
import {
	Avatar,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Typography,
	alpha,
	useTheme,
} from '@mui/material';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import {
	DirectoryAvatar,
	DirectoryListCard,
	directoryTableSx,
} from '@/components/directory/directoryListUi';
import { StatCard } from '@/components/ui/StatCard';
import { IconBuilding, IconEye, IconPencil, IconPlus, IconUsers } from '@tabler/icons-react';

import { useDisclosure } from '@/hooks/use-disclosure';
import { useIsMobileSm } from '@/hooks/use-is-mobile-sm';
import moment from 'moment';

import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import { formatPhoneNumber } from '@/utils/globalHelpers';
import { createActivityLog } from '@/helper/Commonfunction';

export default function Publisher() {
	const theme = useTheme();
	const isMobileSm = useIsMobileSm();
	const [isOpenedDetailsModal, { open: openDetailsModal, close: closeDetailsModal }] =
		useDisclosure(false);
	const [publisherModal, setPublisherModal] = useState<any>(null);
	const [publisherList, setPublisherList] = useState([]);
	const [offset, setOffset] = useState(0);
	const [limit, setLimit] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalData, setTotalData] = useState(0);
	const [loading, setLoading] = useState(true);
	const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
	const [id, setId]: any = useState();
	const [name, setName] = useState('');
	const [enName, setEnName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [phone, setPhone] = useState('');
	const [address, setAddress] = useState('');
	const [image, setImage]: any = useState();
	const [addPublisherOpened, { open: openAddPublisher, close: closeAddPublisher }] =
		useDisclosure(false);

	async function getData() {
		try {
			setLoading(true);
			const response = await fetch(`/api/routes/publishers?offset=${offset}&limit=${limit}`);
			const apidata = await response.json();
			setPublisherList(apidata.data);
			setTotalData(apidata.total.count);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}

	const handleEdit = async (event: any, index: any) => {
		try {
			openEdit();
			const tempArr: any = publisherList;
			const item = tempArr[index];

			setId(item.id);
			setName(item.full_name);
			setEmail(item.email);
			setEnName(item.en_name);
			setAddress(item.address);
			setImage(item.imageUrl);
		} catch (error) {}
	};
	const totalPage = Math.ceil(totalData / limit);

	const handlePageChange = (e: any) => {
		const offsetCount = (e - 1) * limit;
		setCurrentPage(e);
		setOffset(offsetCount);
	};

	const handleOpenAddPublisher = async (e: any) => {
		e.preventDefault();

		try {
			let data = {
				full_name: name,
				en_name: enName,
				email: email,
				phone: phone,
				address: address,
				password: password,
				imageUrl: image,
			};

			const response = await fetch(`/api/routes/publishers`, {
				method: 'POST',
				body: JSON.stringify(data),
			});

			let activityLogPayload = {
				name: 'handleOpenAddPublisher',
				action_type: 'create',
				payload: JSON.stringify(data),
				api_end_point: `/api/routes/publishers`,
			};
			createActivityLog(activityLogPayload);
			const apidata = await response.json();

			if (apidata.statusCode === 201) {
				getData();
				closeAddPublisher();
			}
		} catch (error) {}
	};

	const handleEditPublisher = async (e: any) => {
		e.preventDefault();

		try {
			let data = {
				full_name: name,
				en_name: enName,
				email: email,
				phone: phone,
				address: address,

				imageUrl: image,
			};

			const response = await fetch(`/api/routes/publishers/${id}`, {
				method: 'POST',
				body: JSON.stringify(data),
			});

			let activityLogPayload = {
				name: 'handleEditPublisher',
				action_type: 'update',
				payload: JSON.stringify({ id, data }),
				api_end_point: `/api/routes/publishers/${id}`,
			};
			createActivityLog(activityLogPayload);

			const apidata = await response.json();

			if (apidata.statusCode === 200) {
				getData();
				closeEdit();
			}
		} catch (error) {}
	};

	const handleImage = async (event: any) => {
		try {
			const formData = new FormData();
			formData.append('files', event.target.files[0]);
			formData.append('size', event.target.files[0].size);

			const response = await fetch('https://api.kabbik.com/v3/audiobooks/upload-image-in-stack', {
				method: 'POST',
				body: formData,
			});

			let activityLogPayload = {
				name: 'handleImage',
				action_type: 'create',
				payload: JSON.stringify({ fileName: event.target?.files?.[0]?.name }),
				api_end_point: 'https://api.kabbik.com/v3/audiobooks/upload-image-in-stack',
			};

			createActivityLog(activityLogPayload);

			const res = await response.json();

			setImage(res.image_file_url);
		} catch (error) {
			return;
		}
	};

	useEffect(() => {
		getData();
	}, [offset]);

	const rows = publisherList.map((element: any, index: any) => {
		const phones =
			element.phone
				?.split(',')
				.map((phone: string) => formatPhoneNumber(phone))
				.join(', ') || 'N/A';

		return (
			<TableRow key={element.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
				<TableCell>
					<DirectoryAvatar src={element.imageUrl} name={element.full_name} />
				</TableCell>
				<TableCell>
					<Typography variant="body2" fontWeight={600}>
						{element.full_name || 'N/A'}
					</Typography>
					{element.en_name ? (
						<Typography variant="caption" color="text.secondary" display="block">
							{element.en_name}
						</Typography>
					) : null}
				</TableCell>
				<TableCell>
					<Typography variant="body2">{phones}</Typography>
				</TableCell>
				<TableCell sx={{ maxWidth: 280 }}>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{
							display: '-webkit-box',
							WebkitLineClamp: 2,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
						}}
					>
						{element.address || 'N/A'}
					</Typography>
				</TableCell>
				<TableCell align="right">
					<Stack direction="row" spacing={0.75} justifyContent="flex-end" flexWrap="wrap">
						<Button
							size="small"
							variant="outlined"
							startIcon={<IconPencil size={16} />}
							onClick={event => handleEdit(event, index)}
						>
							Edit
						</Button>
						<Button
							size="small"
							variant="text"
							startIcon={<IconEye size={16} />}
							onClick={() => {
								setPublisherModal(element);
								openDetailsModal();
							}}
						>
							Details
						</Button>
					</Stack>
				</TableCell>
			</TableRow>
		);
	});

	return (
		<>
			{loading ? (
				<Loader />
			) : (
				<PageContainer
				title="Publisher List"
				subtitle="Manage publisher accounts and contact details"
				items={[{ label: 'Publishers', href: '/dashboard/publishers' }]}
				actions={
					<Button onClick={openAddPublisher} variant="contained" startIcon={<IconPlus size={18} />}>
						Add publisher
					</Button>
				}
			>
				<Stack spacing={2}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6} md={4}>
							<StatCard
								title="Total publishers"
								value={totalData.toLocaleString()}
								color="primary"
								icon={<IconBuilding size={22} />}
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={4}>
							<StatCard
								title="On this page"
								value={publisherList.length}
								color="info"
								icon={<IconUsers size={22} />}
							/>
						</Grid>
					</Grid>

					<DirectoryListCard
						title="All publishers"
						totalCount={totalData}
						currentPage={currentPage}
						totalPages={totalPage}
						onPageChange={handlePageChange}
						isEmpty={!loading && publisherList.length === 0}
						emptyMessage="No publishers yet. Add your first publisher to get started."
					>
						<Table size="small" sx={directoryTableSx}>
							<TableHead>
								<TableRow>
									<TableCell width={80}>Photo</TableCell>
									<TableCell>Name</TableCell>
									<TableCell>Phone</TableCell>
									<TableCell>Address</TableCell>
									<TableCell align="right">Actions</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>{rows}</TableBody>
						</Table>
					</DirectoryListCard>

						<Dialog open={addPublisherOpened} onClose={closeAddPublisher} maxWidth="sm" fullWidth fullScreen={isMobileSm}>
							<DialogTitle>Add publisher</DialogTitle>
							<DialogContent>
								<Stack component="form" spacing={2} onSubmit={handleOpenAddPublisher} sx={{ pt: 0.5 }}>
									<TextField
										label="Name"
										size="small"
										fullWidth
										onChange={e => setName(e.target.value)}
										required
									/>
									<TextField
										label="English name"
										size="small"
										fullWidth
										onChange={e => setEnName(e.target.value)}
										required
									/>
									<TextField
										label="Email"
										type="email"
										size="small"
										fullWidth
										onChange={e => setEmail(e.target.value)}
										required
									/>
									<TextField
										label="Password"
										type="password"
										size="small"
										fullWidth
										onChange={e => setPassword(e.target.value)}
										required
									/>
									<TextField
										label="Phone"
										size="small"
										fullWidth
										onChange={e => setPhone(e.target.value)}
										required
									/>
									<TextField
										label="Address"
										size="small"
										fullWidth
										onChange={e => setAddress(e.target.value)}
										required
									/>
									<Box>
										<Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.75 }}>
											Photo
										</Typography>
										<input type="file" accept="image/*" onChange={handleImage} />
										{image ? (
											<Box
												component="img"
												src={image}
												alt="Preview"
												sx={{
													mt: 1.5,
													width: 120,
													height: 120,
													objectFit: 'cover',
													borderRadius: 2,
													border: 1,
													borderColor: 'divider',
												}}
											/>
										) : null}
									</Box>
									<DialogActions sx={{ px: 0, pb: 0 }}>
										<Button onClick={closeAddPublisher}>Cancel</Button>
										<Button type="submit" variant="contained">
											Create
										</Button>
									</DialogActions>
								</Stack>
							</DialogContent>
						</Dialog>

						<Dialog open={editOpened} onClose={closeEdit} maxWidth="sm" fullWidth fullScreen={isMobileSm}>
							<DialogTitle>Edit publisher</DialogTitle>
							<DialogContent>
								<Stack component="form" spacing={2} onSubmit={handleEditPublisher} sx={{ pt: 0.5 }}>
									<TextField
										label="Name"
										size="small"
										fullWidth
										value={name ? name : ''}
										onChange={e => setName(e.target.value)}
										required
									/>
									<TextField
										label="English name"
										size="small"
										fullWidth
										value={enName ? enName : ''}
										onChange={e => setEnName(e.target.value)}
										required
									/>
									<TextField
										label="Email"
										size="small"
										fullWidth
										value={email ? email : ''}
										type="email"
										onChange={e => setEmail(e.target.value)}
										required
									/>
									<TextField
										label="Address"
										size="small"
										fullWidth
										value={address ? address : ''}
										onChange={e => setAddress(e.target.value)}
										required
									/>
									<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
										<Box sx={{ flex: 1 }}>
											<Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.75 }}>
												Photo
											</Typography>
											<input type="file" accept="image/*" onChange={handleImage} />
										</Box>
										{image ? (
											<Avatar
												variant="rounded"
												src={image}
												alt={name || 'Publisher'}
												sx={{ width: 72, height: 72, border: 1, borderColor: 'divider' }}
											/>
										) : null}
									</Stack>
									<DialogActions sx={{ px: 0, pb: 0 }}>
										<Button onClick={closeEdit}>Cancel</Button>
										<Button type="submit" variant="contained">
											Update
										</Button>
									</DialogActions>
								</Stack>
							</DialogContent>
						</Dialog>
						<Dialog open={isOpenedDetailsModal} onClose={closeDetailsModal} maxWidth="md" fullWidth fullScreen={isMobileSm}>
							<DialogTitle>Publisher details</DialogTitle>
							<DialogContent>
								<Stack spacing={2} sx={{ pt: 0.5 }}>
									<Stack direction="row" spacing={2} alignItems="center">
										<DirectoryAvatar src={publisherModal?.imageUrl} name={publisherModal?.full_name} />
										<Box>
											<Typography variant="h6" fontWeight={700}>
												{publisherModal?.full_name || 'N/A'}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												{publisherModal?.en_name || '—'}
											</Typography>
										</Box>
									</Stack>
									<Box
										sx={{
											display: 'grid',
											gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
											gap: 2,
											p: 2,
											borderRadius: 2,
											bgcolor: alpha(theme.palette.primary.main, 0.04),
											border: 1,
											borderColor: 'divider',
										}}
									>
										<Box>
											<Typography variant="overline" color="text.secondary">
												ID
											</Typography>
											<Typography variant="body2" fontWeight={600}>
												{publisherModal?.id ?? '—'}
											</Typography>
										</Box>
										<Box>
											<Typography variant="overline" color="text.secondary">
												Email
											</Typography>
											<Typography variant="body2" fontWeight={600}>
												{publisherModal?.email || 'N/A'}
											</Typography>
										</Box>
										<Box sx={{ gridColumn: { sm: '1 / -1' } }}>
											<Typography variant="overline" color="text.secondary">
												Created
											</Typography>
											<Typography variant="body2" fontWeight={600}>
												{publisherModal?.created_at
													? moment(publisherModal.created_at).format('Do MMM YYYY, h:mm a')
													: 'N/A'}
											</Typography>
										</Box>
									</Box>
								</Stack>
							</DialogContent>
							<DialogActions>
								<Button onClick={closeDetailsModal}>Close</Button>
							</DialogActions>
						</Dialog>
				</Stack>
				</PageContainer>
			)}
		</>
	);
}
