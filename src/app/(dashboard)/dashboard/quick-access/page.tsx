'use client';

import Loader from '@/components/Loader';
import { createActivityLog } from '@/helper/Commonfunction';
import {
	QUICK_ACCESS_AUDIENCE_OPTIONS,
	QUICK_ACCESS_GOTO_CUSTOM,
	QUICK_ACCESS_GOTO_PRESETS,
	type QuickAccessAudience,
} from '@/constants/quickAccess';
import {
	ActionIcon,
	Badge,
	Button,
	Flex,
	Group,
	Modal,
	Pagination,
	Radio,
	Select,
	Stack,
	Switch,
	Table,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowDown, IconArrowUp, IconPencil, IconTrash } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

type QuickAccessRow = {
	id: number;
	enName: string;
	bnName: string;
	gotoPage: string;
	audience: QuickAccessAudience;
	isActive: boolean;
	sortOrder: number;
};

type FormState = {
	enName: string;
	bnName: string;
	gotoPreset: string;
	customGotoPage: string;
	audience: QuickAccessAudience;
	isActive: boolean;
	sortOrder: string;
};

const emptyForm: FormState = {
	enName: '',
	bnName: '',
	gotoPreset: QUICK_ACCESS_GOTO_PRESETS[0].value,
	customGotoPage: '',
	audience: 'all',
	isActive: true,
	sortOrder: '0',
};

const audienceBadgeColor: Record<QuickAccessAudience, string> = {
	all: 'blue',
	free: 'gray',
	premium: 'yellow',
};

function presetForGotoPage(gotoPage: string): { gotoPreset: string; customGotoPage: string } {
	const match = QUICK_ACCESS_GOTO_PRESETS.find(p => p.value === gotoPage);
	if (match) return { gotoPreset: match.value, customGotoPage: '' };
	return { gotoPreset: QUICK_ACCESS_GOTO_CUSTOM, customGotoPage: gotoPage };
}

function resolveGotoPage(form: FormState): string {
	if (form.gotoPreset === QUICK_ACCESS_GOTO_CUSTOM) {
		return form.customGotoPage.trim();
	}
	return form.gotoPreset;
}

const gotoSelectOptions = [
	...QUICK_ACCESS_GOTO_PRESETS.map(p => ({ value: p.value, label: p.label })),
	{ value: QUICK_ACCESS_GOTO_CUSTOM, label: 'Custom' },
];

export default function QuickAccessPage() {
	const [rows, setRows] = useState<QuickAccessRow[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [limit] = useState(25);
	const [loading, setLoading] = useState(true);
	const [audienceFilter, setAudienceFilter] = useState<string | null>('');
	const [activeFilter, setActiveFilter] = useState<string | null>('');
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [form, setForm] = useState<FormState>(emptyForm);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [editingId, setEditingId] = useState<number | null>(null);
	const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(search), 400);
		return () => clearTimeout(t);
	}, [search]);

	const filtersActive = Boolean(
		(audienceFilter && audienceFilter !== '') ||
			(activeFilter && activeFilter !== '') ||
			debouncedSearch.trim(),
	);

	const loadList = useCallback(async () => {
		setLoading(true);
		try {
			const p = new URLSearchParams();
			p.set('page', String(page));
			p.set('limit', String(limit));
			if (audienceFilter) p.set('audience', audienceFilter);
			if (activeFilter === 'true') p.set('isActive', 'true');
			if (activeFilter === 'false') p.set('isActive', 'false');
			if (debouncedSearch.trim()) p.set('search', debouncedSearch.trim());

			const response = await fetch(`/api/routes/quick-access?${p.toString()}`);
			const result = await response.json();
			if (!response.ok || !result.success) {
				throw new Error(result.message || 'Failed to load');
			}
			setRows(result.data ?? []);
			setTotal(result.total ?? 0);
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Failed to load quick access items';
			notifications.show({ title: 'Error', message, color: 'red' });
		} finally {
			setLoading(false);
		}
	}, [page, limit, audienceFilter, activeFilter, debouncedSearch]);

	useEffect(() => {
		loadList();
	}, [loadList]);

	const totalPages = Math.max(1, Math.ceil(total / limit));

	const resetForm = () => {
		setForm(emptyForm);
		setFieldErrors({});
		setEditingId(null);
	};

	const openCreate = () => {
		resetForm();
		openModal();
	};

	const openEdit = (row: QuickAccessRow) => {
		const preset = presetForGotoPage(row.gotoPage);
		setForm({
			enName: row.enName,
			bnName: row.bnName,
			gotoPreset: preset.gotoPreset,
			customGotoPage: preset.customGotoPage,
			audience: row.audience,
			isActive: row.isActive,
			sortOrder: String(row.sortOrder),
		});
		setFieldErrors({});
		setEditingId(row.id);
		openModal();
	};

	const clientValidate = (): Record<string, string> => {
		const errors: Record<string, string> = {};
		if (!form.enName.trim()) errors.enName = 'English name is required';
		if (!form.bnName.trim()) errors.bnName = 'Bangla name is required';
		const gotoPage = resolveGotoPage(form);
		if (!gotoPage) errors.gotoPage = 'Go to page is required';
		else if (!gotoPage.startsWith('/')) errors.gotoPage = 'Go to page must start with /';
		return errors;
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const clientErrors = clientValidate();
		if (Object.keys(clientErrors).length > 0) {
			setFieldErrors(clientErrors);
			return;
		}

		const gotoPage = resolveGotoPage(form);
		const payload = {
			enName: form.enName.trim(),
			bnName: form.bnName.trim(),
			gotoPage,
			audience: form.audience,
			isActive: form.isActive,
			sortOrder: parseInt(form.sortOrder, 10) || 0,
		};

		try {
			const url = editingId
				? `/api/routes/quick-access/${editingId}`
				: '/api/routes/quick-access';
			const method = editingId ? 'PUT' : 'POST';
			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const result = await response.json();

			createActivityLog({
				name: editingId ? 'updateQuickAccess' : 'createQuickAccess',
				action_type: editingId ? 'update' : 'create',
				payload: JSON.stringify(payload),
				api_end_point: url,
			});

			if (!response.ok || !result.success) {
				if (result.errors) setFieldErrors(result.errors);
				notifications.show({
					title: 'Error',
					message: result.message || 'Save failed',
					color: 'red',
				});
				return;
			}

			notifications.show({
				title: 'Success',
				message: result.message || 'Saved',
				color: 'green',
			});
			closeModal();
			resetForm();
			loadList();
		} catch {
			notifications.show({ title: 'Error', message: 'Save failed', color: 'red' });
		}
	};

	const handleToggle = async (row: QuickAccessRow) => {
		try {
			const response = await fetch(`/api/routes/quick-access/${row.id}/toggle`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isActive: !row.isActive }),
			});
			const result = await response.json();
			if (!response.ok || !result.success) {
				notifications.show({
					title: 'Error',
					message: result.message || 'Toggle failed',
					color: 'red',
				});
				return;
			}
			loadList();
		} catch {
			notifications.show({ title: 'Error', message: 'Toggle failed', color: 'red' });
		}
	};

	const handleDelete = async (id: number) => {
		const confirm = await Swal.fire({
			title: 'Delete this shortcut?',
			text: 'This cannot be undone. Consider deactivating instead.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Delete',
		});
		if (!confirm.isConfirmed) return;

		try {
			const response = await fetch(`/api/routes/quick-access/${id}`, { method: 'DELETE' });
			const result = await response.json();
			if (!response.ok || !result.success) {
				notifications.show({
					title: 'Error',
					message: result.message || 'Delete failed',
					color: 'red',
				});
				return;
			}
			notifications.show({ title: 'Deleted', message: result.message, color: 'green' });
			loadList();
		} catch {
			notifications.show({ title: 'Error', message: 'Delete failed', color: 'red' });
		}
	};

	const reorderVisible = !filtersActive && rows.length > 0;

	const moveRow = async (index: number, direction: 'up' | 'down') => {
		const swapIndex = direction === 'up' ? index - 1 : index + 1;
		if (swapIndex < 0 || swapIndex >= rows.length) return;

		const next = [...rows];
		const a = next[index];
		const b = next[swapIndex];
		const items = [
			{ id: a.id, sortOrder: b.sortOrder },
			{ id: b.id, sortOrder: a.sortOrder },
		];

		try {
			const response = await fetch('/api/routes/quick-access/reorder', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ items }),
			});
			const result = await response.json();
			if (!response.ok || !result.success) {
				notifications.show({
					title: 'Error',
					message: result.message || 'Reorder failed',
					color: 'red',
				});
				return;
			}
			loadList();
		} catch {
			notifications.show({ title: 'Error', message: 'Reorder failed', color: 'red' });
		}
	};

	const audienceLabel = useMemo(
		() => (value: QuickAccessAudience) =>
			QUICK_ACCESS_AUDIENCE_OPTIONS.find(o => o.value === value)?.label ?? value,
		[],
	);

	if (loading && rows.length === 0 && total === 0) {
		return <Loader />;
	}

	return (
		<Stack gap="md">
			<Flex justify="space-between" align="center" wrap="wrap" gap="sm">
				<Title order={2}>Quick Access</Title>
				<Button onClick={openCreate}>Add Quick Access</Button>
			</Flex>

			<Group grow align="flex-end">
				<Select
					label="Audience"
					placeholder="All audiences"
					clearable
					data={[
						{ value: '', label: 'All audiences' },
						...QUICK_ACCESS_AUDIENCE_OPTIONS.map(o => ({ value: o.value, label: o.label })),
					]}
					value={audienceFilter}
					onChange={v => {
						setAudienceFilter(v);
						setPage(1);
					}}
				/>
				<Select
					label="Active"
					placeholder="All"
					clearable
					data={[
						{ value: '', label: 'All' },
						{ value: 'true', label: 'Active' },
						{ value: 'false', label: 'Inactive' },
					]}
					value={activeFilter}
					onChange={v => {
						setActiveFilter(v);
						setPage(1);
					}}
				/>
				<TextInput
					label="Search"
					placeholder="English or Bangla name"
					value={search}
					onChange={e => {
						setSearch(e.currentTarget.value);
						setPage(1);
					}}
				/>
			</Group>

			<Table striped highlightOnHover withTableBorder>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Order</Table.Th>
						<Table.Th>English name</Table.Th>
						<Table.Th>Bangla name</Table.Th>
						<Table.Th>Go to page</Table.Th>
						<Table.Th>Audience</Table.Th>
						<Table.Th>Active</Table.Th>
						<Table.Th>Actions</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{rows.length === 0 ? (
						<Table.Tr>
							<Table.Td colSpan={7}>
								<Text ta="center" c="dimmed">No items found</Text>
							</Table.Td>
						</Table.Tr>
					) : (
						rows.map((row, index) => (
							<Table.Tr key={row.id}>
								<Table.Td>
									<Group gap={4}>
										<Text size="sm">{row.sortOrder}</Text>
										{reorderVisible && (
											<>
												<ActionIcon
													variant="subtle"
													size="sm"
													disabled={index === 0}
													onClick={() => moveRow(index, 'up')}
													aria-label="Move up"
												>
													<IconArrowUp size={14} />
												</ActionIcon>
												<ActionIcon
													variant="subtle"
													size="sm"
													disabled={index === rows.length - 1}
													onClick={() => moveRow(index, 'down')}
													aria-label="Move down"
												>
													<IconArrowDown size={14} />
												</ActionIcon>
											</>
										)}
									</Group>
								</Table.Td>
								<Table.Td>{row.enName}</Table.Td>
								<Table.Td>{row.bnName}</Table.Td>
								<Table.Td>
									<Text size="sm" ff="monospace">{row.gotoPage}</Text>
								</Table.Td>
								<Table.Td>
									<Badge color={audienceBadgeColor[row.audience]} variant="light">
										{audienceLabel(row.audience)}
									</Badge>
								</Table.Td>
								<Table.Td>
									<Switch
										checked={row.isActive}
										onChange={() => handleToggle(row)}
										aria-label="Toggle active"
									/>
								</Table.Td>
								<Table.Td>
									<Group gap="xs">
										<ActionIcon variant="light" onClick={() => openEdit(row)} aria-label="Edit">
											<IconPencil size={16} />
										</ActionIcon>
										<ActionIcon
											variant="light"
											color="red"
											onClick={() => handleDelete(row.id)}
											aria-label="Delete"
										>
											<IconTrash size={16} />
										</ActionIcon>
									</Group>
								</Table.Td>
							</Table.Tr>
						))
					)}
				</Table.Tbody>
			</Table>

			{totalPages > 1 && (
				<Flex justify="center">
					<Pagination value={page} onChange={setPage} total={totalPages} />
				</Flex>
			)}

			<Modal
				opened={modalOpened}
				onClose={() => {
					closeModal();
					resetForm();
				}}
				title={editingId ? 'Edit Quick Access' : 'Add Quick Access'}
				size="lg"
			>
				<form onSubmit={handleSubmit}>
					<Stack gap="sm">
						<TextInput
							label="English name"
							required
							value={form.enName}
							error={fieldErrors.enName}
							onChange={e => setForm(f => ({ ...f, enName: e.currentTarget.value }))}
						/>
						<TextInput
							label="Bangla name"
							required
							lang="bn"
							value={form.bnName}
							error={fieldErrors.bnName}
							onChange={e => setForm(f => ({ ...f, bnName: e.currentTarget.value }))}
						/>
						<Select
							label="Go to page"
							data={gotoSelectOptions}
							value={form.gotoPreset}
							onChange={v =>
								setForm(f => ({
									...f,
									gotoPreset: v || QUICK_ACCESS_GOTO_PRESETS[0].value,
								}))
							}
						/>
						{form.gotoPreset === QUICK_ACCESS_GOTO_CUSTOM && (
							<TextInput
								label="Custom path"
								placeholder="/your-route"
								value={form.customGotoPage}
								error={fieldErrors.gotoPage}
								onChange={e =>
									setForm(f => ({ ...f, customGotoPage: e.currentTarget.value }))
								}
							/>
						)}
						{form.gotoPreset !== QUICK_ACCESS_GOTO_CUSTOM && fieldErrors.gotoPage && (
							<Text size="sm" c="red">{fieldErrors.gotoPage}</Text>
						)}
						<Radio.Group
							label="Audience"
							value={form.audience}
							onChange={v =>
								setForm(f => ({ ...f, audience: (v as QuickAccessAudience) || 'all' }))
							}
						>
							<Group mt="xs">
								{QUICK_ACCESS_AUDIENCE_OPTIONS.map(o => (
									<Radio key={o.value} value={o.value} label={o.label} />
								))}
							</Group>
						</Radio.Group>
						{fieldErrors.audience && (
							<Text size="sm" c="red">{fieldErrors.audience}</Text>
						)}
						<Switch
							label="Active"
							checked={form.isActive}
							onChange={e =>
								setForm(f => ({ ...f, isActive: e.currentTarget.checked }))
							}
						/>
						<TextInput
							label="Sort order"
							type="number"
							value={form.sortOrder}
							error={fieldErrors.sortOrder}
							onChange={e => setForm(f => ({ ...f, sortOrder: e.currentTarget.value }))}
						/>
						<Group justify="flex-end" mt="md">
							<Button variant="default" onClick={closeModal} type="button">
								Cancel
							</Button>
							<Button type="submit">Save</Button>
						</Group>
					</Stack>
				</form>
			</Modal>
		</Stack>
	);
}
