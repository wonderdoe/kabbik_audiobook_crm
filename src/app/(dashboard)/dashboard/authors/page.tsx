'use client';
import {
	Avatar,
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	InputLabel,
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
import { createActivityLog } from '@/helper/Commonfunction';

export default function Authors() {
	const [authorList, setAuthorList] = useState([]);
	const [offset, setOffset] = useState(0);
	const [limit, setLimit] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalData, setTotalData] = useState(0);
	const [loading, setLoading] = useState(true);
	const [addImage, setAddImage]: any = useState('');
	const [editImage, setEditImage]: any = useState('');
	const [name, setName] = useState('');
	const [enName, setEnName] = useState('');
	const [description, setDescription] = useState('');
	const [id, setId]: any = useState();
	const [showFullDescription, setShowFullDescription] = useState<number>();
	const [addAuthorModal, { open: openAuthorModal, close: closeAuthorModal }] = useDisclosure(false);
	const [editAuthorModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);

	const rows = authorList.map((element: any, index: any) => {
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
				<TableCell>{element.name || 'N/A'}</TableCell>
				<TableCell>{element.en_name || 'N/A'}</TableCell>
				<TableCell>
					<div
						className={`${showFullDescription === index ? '' : 'three-line-ellipsis'}`}
						style={{ width: '200px' }}
						onClick={() =>
							setShowFullDescription(index === showFullDescription ? undefined : index)
						}
					>
						{element.description || 'N/A'}
					</div>
				</TableCell>
				<TableCell>{moment(element.created_at).format('Do MMM YYYY h:mma') || 'N/A'}</TableCell>
				<TableCell>
					<Button onClick={() => handleEditId(index)}>Edit</Button>
				</TableCell>
			</TableRow>
		);
	});

	const handleEditId = (index: any) => {
		try {
			openEditModal();
			const tempArr = authorList;
			const item = tempArr[index] as any;

			setId(item.id);
			setName(item.name);
			setEnName(item.en_name);
			setDescription(item.description);
			setEditImage(item.imageUrl);
		} catch (error) {}
	};

	async function getData() {
		try {
			const response = await fetch(`/api/routes/authors?offset=${offset}&limit=${limit}`);
			const apidata = await response.json();
			setLoading(false);
			setAuthorList(apidata.data);
			setTotalData(apidata.total.count);
		} catch (error) {}
	}

	const totalPage = Math.ceil(totalData / limit);

	const handlePageChange = (e: any) => {
		const offsetCount = (e - 1) * limit;
		setCurrentPage(e);
		setOffset(offsetCount);
	};

	const handleAddImage = async (event: any) => {
		try {
			const formData = new FormData();
			formData.append('files', event.target.files[0]);
			formData.append('size', event.target.files[0].size);

			const response = await fetch('https://api.kabbik.com/v3/audiobooks/upload-image-in-stack', {
				method: 'POST',
				body: formData,
			});
			let activityLogPayload = {
				name: 'handleAddImage,authors/page.tsx',
				action_type: 'create',
				payload: JSON.stringify({ fileName: event.target.files[0]?.name }),
				api_end_point: 'https://api.kabbik.com/v3/audiobooks/upload-image-in-stack',
			};
			createActivityLog(activityLogPayload);

			const res = await response.json();

			setAddImage(res.image_file_url);
		} catch (error) {
			return;
		}
	};

	const handleEditImage = async (event: any) => {
		try {
			const formData = new FormData();
			formData.append('files', event.target.files[0]);
			formData.append('size', event.target.files[0].size);

			const response = await fetch('https://api.kabbik.com/v3/audiobooks/upload-image-in-stack', {
				method: 'POST',
				body: formData,
			});
			let activityLogPayload = {
				name: 'handleEditImage,authors/page.tsx',
				action_type: 'update',
				payload: JSON.stringify({ fileName: event.target.files[0]?.name }),
				api_end_point: 'https://api.kabbik.com/v3/audiobooks/upload-image-in-stack',
			};
			createActivityLog(activityLogPayload);

			const res = await response.json();

			setEditImage(res.image_file_url);
		} catch (error) {
			return;
		}
	};

	const handleAddAuthor = async (event: any) => {
		event.preventDefault();

		try {
			let data = {
				name: name,
				description: description,
				en_name: enName,
				imageUrl: addImage,
			};

			const response = await fetch(`/api/routes/authors`, {
				method: 'POST',
				body: JSON.stringify(data),
			});
			let activityLogPayload = {
				name: 'handleAddAuthor,authors/page.tsx',
				action_type: 'create',
				payload: JSON.stringify(data),
				api_end_point: `/api/routes/authors`,
			};
			createActivityLog(activityLogPayload);
			const apidata = await response.json();

			if (apidata.statusCode === 201) {
				getData();
				closeAuthorModal();
			}
		} catch (error) {}
	};

	const handleEditAuthor = async (event: any) => {
		event.preventDefault();
		try {
			let data = {
				name: name,
				description: description,
				en_name: enName,
				imageUrl: editImage,
			};

			const response = await fetch(`/api/routes/authors/${id}`, {
				method: 'POST',
				body: JSON.stringify(data),
			});

			let activityLogPayload = {
				name: 'handleEditAuthor,authors/page.tsx',
				action_type: 'update',
				payload: JSON.stringify(data),
				api_end_point: `/api/routes/authors/${id}`,
			};
			createActivityLog(activityLogPayload);

			const apidata = await response.json();

			if (apidata.statusCode === 201) {
				closeEditModal();
				getData();
			}
		} catch (error) {}
	};
	useEffect(() => {
		getData();
	}, [offset]);

	return (
		<>
			{loading ? (
				<Loader />
			) : (
			<PageContainer title="Author List" items={[{ label: 'Authors', href: '/dashboard/authors' }]}
				actions={
					<Button onClick={openAuthorModal} variant="contained">
							Add Author
						</Button>
				}>

<MainCard contentSX={{ p: 0 }}>
						<TableContainer sx={{ minWidth: 100 }}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell component="th">Image</TableCell>
										<TableCell component="th">Name</TableCell>
										<TableCell component="th">En Name</TableCell>
										<TableCell component="th">Description</TableCell>
										<TableCell component="th">Created At</TableCell>
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

					<Dialog
						open={addAuthorModal}
						onClose={closeAuthorModal}
						
						maxWidth="lg" sx={{ width: "100%" }}
					>
<DialogTitle>Add Author</DialogTitle>
<DialogContent>
						<form onSubmit={handleAddAuthor} action="">
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
							<TextField multiline minRows={3}
								label="Description"
								onChange={e => setDescription(e.target.value)}
								required
								placeholder="Description"
							/>

							<FormControl><InputLabel>Image</InputLabel>
								<Stack direction="row" flexWrap="wrap"
									mih={50}
									gap="md"
									justifyContent="flex-start"
									alignItems="flex-start"
									direction="column"
									wrap="wrap"
								>
									<input type="file" onChange={handleAddImage} />

									{addImage && (
										<Box component="img" 
											style={{ paddingBottom: 10 }}
											src={addImage}
											height={150}
											width={'auto'}
											alt={addImage}
											radius={'md'}
										/>
									)}
								</Stack>
							</FormControl>
							<Button type="submit">
								Create
							</Button>
						</form>
					</DialogContent>
</Dialog>

					<Dialog
						open={editAuthorModal}
						onClose={closeEditModal}
						
						maxWidth="lg" sx={{ width: "100%" }}
					>
<DialogTitle>Edit Author</DialogTitle>
<DialogContent>
						<form onSubmit={handleEditAuthor} action="">
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
							<TextField multiline minRows={3}
								label="Description"
								value={description ? description : ''}
								onChange={e => setDescription(e.target.value)}
								required
								placeholder="Description"
							/>

							<FormControl><InputLabel>Image</InputLabel>
								<Stack direction="row" flexWrap="wrap" justify={'space-between'}>
									<Stack direction="row" flexWrap="wrap" direction={'column'} justify={'space-between'}>
										<input type="file" onChange={handleEditImage} />
										<Button type="submit">
											Update
										</Button>
									</Stack>
									{editImage && (
										<Box component="img" 
											style={{ paddingBottom: 10 }}
											src={editImage}
											height={150}
											width={'auto'}
											alt={editImage}
											radius={'md'}
										/>
									)}
								</Stack>
							</FormControl>
						</form>
					</DialogContent>
</Dialog>
			</PageContainer>
			)}
		</>
	);
}
