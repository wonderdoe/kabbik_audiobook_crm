'use client';
import {
	Avatar,
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	Pagination,
	Paper,
	Stack,
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
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';

import { useDisclosure } from '@/hooks/use-disclosure';
import moment from 'moment';

import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import { formatPhoneNumber } from '@/utils/globalHelpers';
import { createActivityLog } from '@/helper/Commonfunction';

export default function Publisher() {
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
		return (
			<TableRow key={element.id}>
				<TableCell>
					<Avatar
						style={{ objectFit: 'contain' }}
						src={element.imageUrl}
						alt={element.imageUrl}
						radius={'xs'}
						size={'100px'}
					/>
					<Avatar
						style={{ objectFit: 'contain' }}
						src={element.imageUrl}
						alt={element.imageUrl}
						radius={'xs'}
					/>
				</TableCell>
				<TableCell>{element.full_name || 'N/A'}</TableCell>
				<TableCell>
					{element.phone
						.split(',')
						.map((phone: string) => formatPhoneNumber(phone))
						.join(', ') || 'N/A'}
				</TableCell>
				<TableCell style={{ width: '300px' }}>{element.address || 'N/A'}</TableCell>
				<TableCell>
					<Stack direction="row" flexWrap="wrap" spacing={10}>
						<Button onClick={event => handleEdit(event, index)}>Edit</Button>
						<Button
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
			<PageContainer title="Publisher List" items={[{ label: 'Publishers', href: '/dashboard/publishers' }]}
				actions={
					<Button onClick={openAddPublisher} variant="contained">
							Add Publisher
						</Button>
				}>

<MainCard contentSX={{ p: 0 }}>
						<TableContainer sx={{ minWidth: 100 }}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell component="th">Image</TableCell>
										<TableCell component="th">Name</TableCell>
										<TableCell component="th">Phone</TableCell>
										<TableCell component="th">Address</TableCell>
										<TableCell component="th">Action</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>{rows}</TableBody>
							</Table>
						</TableContainer>
						<Divider sx={{ my: 1 }} />
						<Pagination page={currentPage}
							onChange={handlePageChange}
							count={totalPage}
						/>
					</MainCard>

						<Dialog open={addPublisherOpened} onClose={closeAddPublisher} title="">
							<Typography maxWidth="xl" sx={{ width: "100%" }} fontWeight={900} style={{ textAlign: 'center' }}>
								Add Publisher
							</Typography>
							<Paper elevation={1} sx={{ p: 3 }}>
								<form onSubmit={handleOpenAddPublisher} action="">
									<TextField
										label="Name"
										onChange={e => setName(e.target.value)}
										required
										placeholder="Name"
									/>
									<TextField
										label="En Name"
										onChange={e => setEnName(e.target.value)}
										required
										placeholder="En Name"
									/>
									<TextField
										label="Email"
										type="email"
										onChange={e => setEmail(e.target.value)}
										required
										placeholder="Email"
									/>
									<TextField
										label="Password"
										type="password"
										onChange={e => setPassword(e.target.value)}
										required
										placeholder="Password"
									/>
									<TextField
										label="Phone"
										onChange={e => setPhone(e.target.value)}
										required
										placeholder="Phone"
									/>

									<TextField
										label="Address"
										onChange={e => setAddress(e.target.value)}
										required
										placeholder="Address"
									/>
									<label htmlFor="Image">Image</label>
									<input type="file" onChange={handleImage} />
									{image && <Box component="img" src={image} height={200} width={200} alt="Uploaded" />}
									<Button type="submit">
										Create
									</Button>
								</form>
							</Paper>
						</Dialog>

						<Dialog
							open={editOpened}
							onClose={closeEdit}
							variant="h6"
						>
<DialogTitle>Edit Publisher</DialogTitle>
<DialogContent>
							<Paper elevation={1} sx={{ p: 1 }}>
								<form onSubmit={handleEditPublisher} action="">
									<TextField
										label="Name"
										value={name ? name : ''}
										onChange={e => setName(e.target.value)}
										required
										placeholder="Name"
									/>
									<TextField
										label="En Name"
										value={enName ? enName : ''}
										onChange={e => setEnName(e.target.value)}
										required
										placeholder="En Name"
									/>
									<TextField
										label="Email"
										value={email ? email : ''}
										type="email"
										onChange={e => setEmail(e.target.value)}
										required
										placeholder="Email"
									/>

									<TextField
										label="Address"
										value={address ? address : ''}
										onChange={e => setAddress(e.target.value)}
										required
										placeholder="Address"
									/>
									<Stack direction="row" flexWrap="wrap" direction={{ base: 'column', xs: 'row' }} justify={'space-between'}>
										<Stack direction="row" flexWrap="wrap" direction={'column'} spacing={10}>
											<Stack direction="row" flexWrap="wrap" direction={'column'}>
												<label htmlFor="Image">Image</label>
												<input type="file" onChange={handleImage} />
											</Stack>
											<div>
												<Button type="submit">
													Update
												</Button>
											</div>
										</Stack>
										<div>{image && <Avatar src={image} alt={image} size={'70px'} />}</div>
									</Stack>
								</form>
							</Paper>
						</DialogContent>
</Dialog>
						<Dialog
							
							open={isOpenedDetailsModal}
							onClose={closeDetailsModal}
							maxWidth="lg" sx={{ width: "100%" }}
						>
<DialogTitle>Publisher Details</DialogTitle>
<DialogContent>
							<TableContainer sx={{ minWidth: 100 }}>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell component="th">Id</TableCell>
											<TableCell component="th">English Name</TableCell>
											<TableCell component="th">Email</TableCell>
											<TableCell component="th">Created At</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										<TableRow>
											<TableCell>{publisherModal?.id}</TableCell>
											<TableCell>{publisherModal?.en_name || 'N/A'}</TableCell>
											<TableCell>{publisherModal?.email || 'N/A'}</TableCell>
											<TableCell>
												{moment(publisherModal?.created_at).format('Do MMM YYYY h:mma') || 'N/A'}
											</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</TableContainer>
						</DialogContent>
</Dialog>
			</PageContainer>
			)}
		</>
	);
}
