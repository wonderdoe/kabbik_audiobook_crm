'use client';

import Loader from '@/components/Loader';
import { createActivityLog } from '@/helper/Commonfunction';
import {
	Button,
	Divider,
	Flex,
	Image,
	Modal,
	Paper,
	Select,
	Switch,
	Table,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

type TargetAudience = 'all' | 'free' | 'premium';

type PromotionBanner = {
	id: number;
	banner_url: string;
	goto_page: string;
	is_active: number;
	payload: { bookId?: string; categoryName?: string } | null;
	target_audience: TargetAudience;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
};

type Category = {
	id: number;
	name: string;
};

const audienceOptions = [
	{ value: 'all', label: 'All' },
	{ value: 'free', label: 'Free' },
	{ value: 'premium', label: 'Premium' },
];

const filterOptions = [{ value: '', label: 'All audiences' }, ...audienceOptions];

const gotoPageOptions = [
	{ value: '/audiobook', label: 'Audiobook' },
	{ value: '/gamezop', label: 'Gamezop' },
	{ value: '/promotion', label: 'Promotion' },
	{ value: '/subscribe', label: 'Subscribe' },
	{ value: '/category', label: 'Category' },
];

const emptyForm = {
	banner_url: '',
	goto_page: '',
	target_audience: 'all' as TargetAudience,
	is_active: true,
	bookId: '',
	categoryName: '',
};

const getGotoPageLabel = (gotoPage: string) =>
	gotoPageOptions.find(option => option.value === gotoPage)?.label || gotoPage;

const formatPayload = (banner: PromotionBanner) => {
	if (!banner.payload) {
		return '-';
	}

	if (banner.goto_page === '/audiobook' && banner.payload.bookId) {
		return `Book ID: ${banner.payload.bookId}`;
	}

	if (banner.goto_page === '/category' && banner.payload.categoryName) {
		return `Category: ${banner.payload.categoryName}`;
	}

	return JSON.stringify(banner.payload);
};

export default function PromotionBannerPage() {
	const [bannerList, setBannerList] = useState<PromotionBanner[]>([]);
	const [categoryList, setCategoryList] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [audienceFilter, setAudienceFilter] = useState('');
	const [form, setForm] = useState(emptyForm);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [originalForm, setOriginalForm] = useState(emptyForm);

	const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

	const filteredBanners = useMemo(() => {
		if (!audienceFilter) {
			return bannerList;
		}
		return bannerList.filter(banner => banner.target_audience === audienceFilter);
	}, [audienceFilter, bannerList]);

	const categoryOptions = useMemo(
		() => categoryList.map(category => ({ value: category.name, label: category.name })),
		[categoryList],
	);

	const getBannerList = async () => {
		try {
			const response = await fetch('/api/routes/promotionbanner');
			const result = await response.json();
			setLoading(false);

			if (!response.ok || !result.success) {
				Swal.fire({
					title: 'Error',
					text: result.message || 'Failed to load promotion banners',
					icon: 'error',
				});
				return;
			}

			setBannerList(result.data || []);
		} catch {
			setLoading(false);
			Swal.fire({
				title: 'Error',
				text: 'Failed to load promotion banners',
				icon: 'error',
			});
		}
	};

	const getCategoryList = async () => {
		try {
			const response = await fetch('/api/routes/audio-category', { cache: 'no-store' });
			const result = await response.json();
			setCategoryList(result || []);
		} catch {
			setCategoryList([]);
		}
	};

	const uploadImage = async (file: File) => {
		const formData = new FormData();
		formData.append('files', file);
		formData.append('size', String(file.size));

		const response = await fetch('https://api.kabbik.com/v3/audiobooks/upload-image-in-stack', {
			method: 'POST',
			body: formData,
		});

		createActivityLog({
			name: 'uploadPromotionBannerImage,promotionbanner/page.tsx',
			action_type: editingId ? 'update' : 'create',
			payload: JSON.stringify({ fileName: file.name }),
			api_end_point: 'https://api.kabbik.com/v3/audiobooks/upload-image-in-stack',
		});

		const result = await response.json();
		if (!result.image_file_url) {
			throw new Error('Image upload failed');
		}

		return result.image_file_url as string;
	};

	const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}

		try {
			const imageUrl = await uploadImage(file);
			setForm(current => ({ ...current, banner_url: imageUrl }));
		} catch {
			Swal.fire({
				title: 'Error',
				text: 'Failed to upload image',
				icon: 'error',
			});
		}
	};

	const resetForm = () => {
		setForm(emptyForm);
		setOriginalForm(emptyForm);
		setEditingId(null);
	};

	const openCreateModal = () => {
		resetForm();
		openModal();
	};

	const openEditModal = (banner: PromotionBanner) => {
		const nextForm = {
			banner_url: banner.banner_url,
			goto_page: banner.goto_page,
			target_audience: banner.target_audience,
			is_active: banner.is_active === 1,
			bookId: banner.payload?.bookId || '',
			categoryName: banner.payload?.categoryName || '',
		};

		setEditingId(banner.id);
		setForm(nextForm);
		setOriginalForm(nextForm);
		openModal();
	};

	const buildPayload = () => {
		if (form.goto_page === '/audiobook') {
			return { bookId: form.bookId.trim() };
		}

		if (form.goto_page === '/category') {
			return { categoryName: form.categoryName.trim() };
		}

		return null;
	};

	const validateForm = () => {
		if (!form.banner_url || !form.goto_page) {
			return 'Banner image and goto page are required';
		}

		if (form.goto_page === '/audiobook' && !form.bookId.trim()) {
			return 'Book ID is required for Audiobook';
		}

		if (form.goto_page === '/category' && !form.categoryName.trim()) {
			return 'Category name is required for Category';
		}

		return null;
	};

	const buildChangedFields = () => {
		const changes: Record<string, unknown> = {};
		const nextPayload = buildPayload();
		const originalPayload = (() => {
			if (originalForm.goto_page === '/audiobook') {
				return originalForm.bookId ? { bookId: originalForm.bookId } : null;
			}
			if (originalForm.goto_page === '/category') {
				return originalForm.categoryName ? { categoryName: originalForm.categoryName } : null;
			}
			return null;
		})();

		if (form.banner_url !== originalForm.banner_url) {
			changes.banner_url = form.banner_url;
		}
		if (form.goto_page !== originalForm.goto_page) {
			changes.goto_page = form.goto_page;
		}
		if (form.target_audience !== originalForm.target_audience) {
			changes.target_audience = form.target_audience;
		}
		if (form.is_active !== originalForm.is_active) {
			changes.is_active = form.is_active ? 1 : 0;
		}
		if (JSON.stringify(nextPayload) !== JSON.stringify(originalPayload)) {
			changes.payload = nextPayload;
		}

		return changes;
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		const validationError = validateForm();
		if (validationError) {
			Swal.fire({
				title: 'Validation',
				text: validationError,
				icon: 'warning',
			});
			return;
		}

		try {
			let response: Response;
			let body: Record<string, unknown>;

			if (editingId) {
				body = buildChangedFields();

				if (Object.keys(body).length === 0) {
					Swal.fire({
						title: 'No changes',
						text: 'No fields were changed',
						icon: 'info',
					});
					return;
				}

				response = await fetch(`/api/routes/promotionbanner/${editingId}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
				});
			} else {
				body = {
					banner_url: form.banner_url,
					goto_page: form.goto_page,
					target_audience: form.target_audience,
					is_active: form.is_active ? 1 : 0,
					payload: buildPayload(),
				};

				response = await fetch('/api/routes/promotionbanner', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
				});
			}

			const result = await response.json();

			createActivityLog({
				name: editingId ? 'updatePromotionBanner' : 'createPromotionBanner',
				action_type: editingId ? 'update' : 'create',
				payload: JSON.stringify(body),
				api_end_point: editingId
					? `/api/routes/promotionbanner/${editingId}`
					: '/api/routes/promotionbanner',
			});

			if (!response.ok || !result.success) {
				Swal.fire({
					title: 'Error',
					text: result.message || 'Failed to save banner',
					icon: 'error',
				});
				return;
			}

			closeModal();
			resetForm();
			getBannerList();

			Swal.fire({
				title: 'Success',
				text: result.message || 'Banner saved',
				icon: 'success',
			});
		} catch (error: any) {
			Swal.fire({
				title: 'Error',
				text: error.message || 'Failed to save banner',
				icon: 'error',
			});
		}
	};

	const handleToggle = async (banner: PromotionBanner) => {
		try {
			const response = await fetch(`/api/routes/promotionbanner/${banner.id}/toggle`, {
				method: 'PATCH',
			});
			const result = await response.json();

			createActivityLog({
				name: 'togglePromotionBanner,promotionbanner/page.tsx',
				action_type: 'update',
				payload: JSON.stringify({ id: banner.id }),
				api_end_point: `/api/routes/promotionbanner/${banner.id}/toggle`,
			});

			if (!response.ok || !result.success) {
				Swal.fire({
					title: 'Error',
					text: result.message || 'Failed to toggle banner',
					icon: 'error',
				});
				return;
			}

			getBannerList();
		} catch {
			Swal.fire({
				title: 'Error',
				text: 'Failed to toggle banner',
				icon: 'error',
			});
		}
	};

	const handleDelete = async (id: number) => {
		const confirm = await Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!',
		});

		if (!confirm.isConfirmed) {
			return;
		}

		try {
			const response = await fetch(`/api/routes/promotionbanner/${id}`, {
				method: 'DELETE',
			});
			const result = await response.json();

			createActivityLog({
				name: 'deletePromotionBanner,promotionbanner/page.tsx',
				action_type: 'delete',
				payload: JSON.stringify({ id }),
				api_end_point: `/api/routes/promotionbanner/${id}`,
			});

			if (!response.ok || !result.success) {
				Swal.fire({
					title: 'Error',
					text: result.message || 'Failed to delete banner',
					icon: 'error',
				});
				return;
			}

			Swal.fire({
				title: 'Deleted!',
				text: result.message || 'Banner deleted',
				icon: 'success',
			});
			getBannerList();
		} catch {
			Swal.fire({
				title: 'Error',
				text: 'Failed to delete banner',
				icon: 'error',
			});
		}
	};

	useEffect(() => {
		getBannerList();
		getCategoryList();
	}, []);

	const rows = filteredBanners.map(banner => (
		<Table.Tr key={banner.id}>
			<Table.Td>{banner.id}</Table.Td>
			<Table.Td>
				<Image
					radius="sm"
					h={120}
					w={200}
					fit="contain"
					src={banner.banner_url}
					alt={banner.banner_url}
				/>
			</Table.Td>
			<Table.Td>{getGotoPageLabel(banner.goto_page)}</Table.Td>
			<Table.Td>{formatPayload(banner)}</Table.Td>
			<Table.Td>{banner.target_audience}</Table.Td>
			<Table.Td>
				<Switch
					checked={banner.is_active === 1}
					onChange={() => handleToggle(banner)}
					size="xs"
				/>
			</Table.Td>
			<Table.Td>{moment(banner.created_at).format('Do MMM YYYY h:mma')}</Table.Td>
			<Table.Td>
				<Flex gap="sm">
					<Button size="xs" onClick={() => openEditModal(banner)}>Edit</Button>
					<Button size="xs" color="red" onClick={() => handleDelete(banner.id)}>
						Delete
					</Button>
				</Flex>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<>
			{loading ? (
				<Loader />
			) : (
				<>
					<Flex justify="space-between" align="center" mb={20}>
						<Title order={1}>Promotion Banner List</Title>
						<Button onClick={openCreateModal} variant="filled">Add Promotion Banner</Button>
					</Flex>

					<Paper withBorder radius="md" p="md" mb="md">
						<Select
							label="Filter by audience"
							data={filterOptions}
							value={audienceFilter}
							onChange={value => setAudienceFilter(value || '')}
							clearable
							style={{ maxWidth: 280 }}
						/>
					</Paper>

					<Paper withBorder radius="md" p="md">
						<Table.ScrollContainer minWidth={1000}>
							<Table>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>ID</Table.Th>
										<Table.Th>Image</Table.Th>
										<Table.Th>Goto Page</Table.Th>
										<Table.Th>Payload</Table.Th>
										<Table.Th>Audience</Table.Th>
										<Table.Th>Active</Table.Th>
										<Table.Th>Created At</Table.Th>
										<Table.Th>Actions</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{rows.length > 0 ? (
										rows
									) : (
										<Table.Tr>
											<Table.Td colSpan={8}>
												<Text ta="center" c="dimmed">No promotion banners found</Text>
											</Table.Td>
										</Table.Tr>
									)}
								</Table.Tbody>
							</Table>
						</Table.ScrollContainer>
						<Divider my="sm" />
					</Paper>

					<Modal
						opened={modalOpened}
						onClose={() => {
							closeModal();
							resetForm();
						}}
						title=""
						centered
						size="lg"
					>
						<Text size="xl" fw={900} style={{ textAlign: 'center' }}>
							{editingId ? 'Edit Promotion Banner' : 'Add Promotion Banner'}
						</Text>
						<Paper shadow="xs" p="xl">
							<form onSubmit={handleSubmit}>
								<Select
									label="Goto Page"
									placeholder="Select destination"
									data={gotoPageOptions}
									value={form.goto_page}
									onChange={value =>
										setForm(current => ({
											...current,
											goto_page: value || '',
											bookId: '',
											categoryName: '',
										}))
									}
									required
									mb="md"
								/>

								{form.goto_page === '/audiobook' && (
									<TextInput
										label="Book ID"
										placeholder="Enter audiobook ID"
										value={form.bookId}
										onChange={e =>
											setForm(current => ({ ...current, bookId: e.target.value }))
										}
										required
										mb="md"
									/>
								)}

								{form.goto_page === '/category' && (
									<Select
										label="Category Name"
										placeholder="Select category"
										data={categoryOptions}
										value={form.categoryName}
										onChange={value =>
											setForm(current => ({ ...current, categoryName: value || '' }))
										}
										searchable
										required
										mb="md"
									/>
								)}

								<Select
									label="Target Audience"
									data={audienceOptions}
									value={form.target_audience}
									onChange={value =>
										setForm(current => ({
											...current,
											target_audience: (value as TargetAudience) || 'all',
										}))
									}
									mb="md"
								/>

								<Flex align="center" gap="sm" mb="md">
									<Text size="sm" fw={500}>Active</Text>
									<Switch
										checked={form.is_active}
										onChange={e =>
											setForm(current => ({
												...current,
												is_active: e.target.checked,
											}))
										}
									/>
								</Flex>

								<Text size="sm" fw={500} mb={6}>Banner Image</Text>
								<input
									type="file"
									accept="image/*"
									onChange={handleImageUpload}
									style={{ marginBottom: 12 }}
								/>
								{form.banner_url && (
									<Image
										src={form.banner_url}
										alt="Banner preview"
										height={200}
										width={200}
										fit="contain"
										mb="md"
									/>
								)}

								<Button type="submit">{editingId ? 'Save Changes' : 'Create Banner'}</Button>
							</form>
						</Paper>
					</Modal>
				</>
			)}
		</>
	);
}
