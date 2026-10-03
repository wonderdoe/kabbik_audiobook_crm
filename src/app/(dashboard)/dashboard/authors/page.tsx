'use client';
import {
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
} from '@mui/material';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import {
	DirectoryAvatar,
	DirectoryListCard,
	directoryTableSx,
} from '@/components/directory/directoryListUi';
import { StatCard } from '@/components/ui/StatCard';
import { IconPencil, IconPlus, IconQuote, IconUsers } from '@tabler/icons-react';

import { useDisclosure } from '@/hooks/use-disclosure';
import { useIsMobileSm } from '@/hooks/use-is-mobile-sm';
import moment from 'moment';

import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import { createActivityLog } from '@/helper/Commonfunction';

export default function Authors() {
	const isMobileSm = useIsMobileSm();
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
			<TableRow key={element.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
				<TableCell>
					<DirectoryAvatar src={element.imageUrl} name={element.name} />
				</TableCell>
				<TableCell>
					<Typography variant="body2" fontWeight={600}>
						{element.name || 'N/A'}
					</Typography>
				</TableCell>
				<TableCell>
					<Typography variant="body2" color="text.secondary">
						{element.en_name || 'N/A'}
					</Typography>
				</TableCell>
				<TableCell sx={{ maxWidth: 320 }}>
					<Typography
						variant="body2"
						color="text.secondary"
						onClick={() => setShowFullDescription(index === showFullDescription ? undefined : index)}
						sx={{
							cursor: 'pointer',
							display: '-webkit-box',
							WebkitLineClamp: showFullDescription === index ? 'unset' : 3,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
							'&:hover': { color: 'text.primary' },
						}}
					>
						{element.description || 'N/A'}
					</Typography>
				</TableCell>
				<TableCell>
					<Typography variant="body2" color="text.secondary" whiteSpace="nowrap">
						{moment(element.created_at).format('Do MMM YYYY, h:mm a') || 'N/A'}
					</Typography>
				</TableCell>
				<TableCell align="right">
					<Button
						size="small"
						variant="outlined"
						startIcon={<IconPencil size={16} />}
						onClick={() => handleEditId(index)}
					>
						Edit
					</Button>
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
			setLoading(true);
			const response = await fetch(`/api/routes/authors?offset=${offset}&limit=${limit}`);
			const apidata = await response.json();
			setAuthorList(apidata.data);
			setTotalData(apidata.total.count);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
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
			<PageContainer
				title="Author List"
				subtitle="Browse and manage audiobook authors"
				items={[{ label: 'Authors', href: '/dashboard/authors' }]}
				actions={
					<Button onClick={openAuthorModal} variant="contained" startIcon={<IconPlus size={18} />}>
						Add author
					</Button>
				}
			>
				<Stack spacing={2}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6} md={4}>
							<StatCard
								title="Total authors"
								value={totalData}
								color="primary"
								icon={<IconUsers size={22} />}
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={4}>
							<StatCard
								title="On this page"
								value={authorList.length}
								color="secondary"
								icon={<IconQuote size={22} />}
							/>
						</Grid>
					</Grid>

					<DirectoryListCard
						title="All authors"
						totalCount={totalData}
						currentPage={currentPage}
						totalPages={totalPage}
						onPageChange={handlePageChange}
						isEmpty={!loading && authorList.length === 0}
						emptyMessage="No authors yet. Add your first author to get started."
					>
						<Table size="small" sx={directoryTableSx}>
							<TableHead>
								<TableRow>
									<TableCell width={80}>Photo</TableCell>
									<TableCell>Name</TableCell>
									<TableCell>English name</TableCell>
									<TableCell>Description</TableCell>
									<TableCell>Created</TableCell>
									<TableCell align="right">Actions</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>{rows}</TableBody>
						</Table>
					</DirectoryListCard>

					<Dialog open={addAuthorModal} onClose={closeAuthorModal} maxWidth="sm" fullWidth fullScreen={isMobileSm}>
						<DialogTitle>Add author</DialogTitle>
						<DialogContent>
							<Stack component="form" spacing={2} onSubmit={handleAddAuthor} sx={{ pt: 0.5 }}>
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
									multiline
									minRows={3}
									label="Description"
									size="small"
									fullWidth
									onChange={e => setDescription(e.target.value)}
									required
								/>
								<Box>
									<Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.75 }}>
										Photo
									</Typography>
									<input type="file" accept="image/*" onChange={handleAddImage} />
									{addImage ? (
										<Box
											component="img"
											src={addImage}
											alt="Preview"
											sx={{
												mt: 1.5,
												maxHeight: 140,
												maxWidth: '100%',
												borderRadius: 2,
												border: 1,
												borderColor: 'divider',
											}}
										/>
									) : null}
								</Box>
								<DialogActions sx={{ px: 0, pb: 0 }}>
									<Button onClick={closeAuthorModal}>Cancel</Button>
									<Button type="submit" variant="contained">
										Create
									</Button>
								</DialogActions>
							</Stack>
						</DialogContent>
					</Dialog>

					<Dialog open={editAuthorModal} onClose={closeEditModal} maxWidth="sm" fullWidth fullScreen={isMobileSm}>
						<DialogTitle>Edit author</DialogTitle>
						<DialogContent>
							<Stack component="form" spacing={2} onSubmit={handleEditAuthor} sx={{ pt: 0.5 }}>
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
									multiline
									minRows={3}
									label="Description"
									size="small"
									fullWidth
									value={description ? description : ''}
									onChange={e => setDescription(e.target.value)}
									required
								/>
								<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
									<Box sx={{ flex: 1 }}>
										<Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.75 }}>
											Photo
										</Typography>
										<input type="file" accept="image/*" onChange={handleEditImage} />
									</Box>
									{editImage ? (
										<Box
											component="img"
											src={editImage}
											alt="Preview"
											sx={{
												maxHeight: 140,
												maxWidth: 120,
												borderRadius: 2,
												border: 1,
												borderColor: 'divider',
												objectFit: 'cover',
											}}
										/>
									) : null}
								</Stack>
								<DialogActions sx={{ px: 0, pb: 0 }}>
									<Button onClick={closeEditModal}>Cancel</Button>
									<Button type="submit" variant="contained">
										Update
									</Button>
								</DialogActions>
							</Stack>
						</DialogContent>
					</Dialog>
				</Stack>
			</PageContainer>
			)}
		</>
	);
}
