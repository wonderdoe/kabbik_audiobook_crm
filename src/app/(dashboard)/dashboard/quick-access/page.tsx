'use client';

import {
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormControlLabel,
	FormLabel,
	IconButton,
	Pagination,
	Radio,
	RadioGroup,
	Stack,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import { DataSelect } from '@/components/Form/DataSelect';
import Loader from '@/components/Loader';
import { createActivityLog } from '@/helper/Commonfunction';
import {
	QUICK_ACCESS_AUDIENCE_OPTIONS,
	type QuickAccessAudience,
} from '@/constants/quickAccess';
import { notifications } from '@/components/providers/SnackbarProvider';
import { useDisclosure } from '@/hooks/use-disclosure';
import { IconArrowDown, IconArrowUp, IconPencil, IconTrash } from '@tabler/icons-react';
import { useIsMobileSm } from '@/hooks/use-is-mobile-sm';
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
	gotoPage: string;
	audience: QuickAccessAudience;
	isActive: boolean;
};

const emptyForm: FormState = {
	enName: '',
	bnName: '',
	gotoPage: '',
	audience: 'all',
	isActive: true,
};

const audienceChipColor: Record<
	QuickAccessAudience,
	'default' | 'primary' | 'warning'
> = {
	all: 'primary',
	free: 'default',
	premium: 'warning',
};

export default function QuickAccessPage() {
	const isMobileSm = useIsMobileSm();
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
		setForm({
			enName: row.enName,
			bnName: row.bnName,
			gotoPage: row.gotoPage,
			audience: row.audience,
			isActive: row.isActive,
		});
		setFieldErrors({});
		setEditingId(row.id);
		openModal();
	};

	const clientValidate = (): Record<string, string> => {
		const errors: Record<string, string> = {};
		if (!form.enName.trim()) errors.enName = 'English name is required';
		if (!form.bnName.trim()) errors.bnName = 'Bangla name is required';
		const gotoPage = form.gotoPage.trim();
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

		const gotoPage = form.gotoPage.trim();
		const payload = {
			enName: form.enName.trim(),
			bnName: form.bnName.trim(),
			gotoPage,
			audience: form.audience,
			isActive: form.isActive,
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

	const reorderVisible = rows.length > 0;

	const moveRow = async (index: number, direction: 'up' | 'down') => {
		const swapIndex = direction === 'up' ? index - 1 : index + 1;
		if (swapIndex < 0 || swapIndex >= rows.length) return;

		const next = [...rows];
		[next[index], next[swapIndex]] = [next[swapIndex], next[index]];

		const reordered = next.map((row, i) => ({ ...row, sortOrder: i + 1 }));
		const items = reordered.map(row => ({ id: row.id, sortOrder: row.sortOrder }));

		setRows(reordered);

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
				loadList();
				return;
			}
		} catch {
			notifications.show({ title: 'Error', message: 'Reorder failed', color: 'red' });
			loadList();
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
		<PageContainer
			title="Quick Access"
			items={[{ label: 'Quick Access', href: '/dashboard/quick-access' }]}
			actions={<Button onClick={openCreate}>Add Quick Access</Button>}
		>
		<Stack spacing={2}>
			<MainCard title="Filters">
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				flexWrap="wrap"
				alignItems={{ xs: 'stretch', sm: 'flex-end' }}
				spacing={2}
				useFlexGap
			>
				<Box sx={{ flex: '1 1 200px', maxWidth: { xs: '100%', sm: 280 }, width: { xs: '100%', sm: 'auto' } }}>
					<DataSelect
						fullWidth
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
				</Box>
				<Box sx={{ flex: '1 1 160px', maxWidth: { xs: '100%', sm: 220 }, width: { xs: '100%', sm: 'auto' } }}>
					<DataSelect
						fullWidth
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
				</Box>
				<Box sx={{ flex: '2 1 240px', minWidth: { xs: 0, sm: 200 }, width: { xs: '100%', sm: 'auto' } }}>
					<TextField
						fullWidth
						size="small"
						label="Search"
						placeholder="English or Bangla name"
						value={search}
						onChange={e => {
							setSearch(e.currentTarget.value);
							setPage(1);
						}}
					/>
				</Box>
			</Stack>
			</MainCard>

			<MainCard contentSX={{ p: 0 }}>
			<TableContainer>
			<Table size="small">
				<TableHead>
					<TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
						<TableCell component="th">Order</TableCell>
						<TableCell component="th">English name</TableCell>
						<TableCell component="th">Bangla name</TableCell>
						<TableCell component="th">Go to page</TableCell>
						<TableCell component="th">Audience</TableCell>
						<TableCell component="th">Active</TableCell>
						<TableCell component="th">Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.length === 0 ? (
						<TableRow>
							<TableCell colSpan={7}>
								<Typography textAlign="center" color="text.secondary">No items found</Typography>
							</TableCell>
						</TableRow>
					) : (
						rows.map((row, index) => (
							<TableRow key={row.id} hover>
								<TableCell>
									<Stack direction="row" alignItems="center" spacing={4} wrap="nowrap">
										{reorderVisible && (
											<>
												<Tooltip title="Move up">
												<span>
												<IconButton
													size="small"
													disabled={index === 0}
													onClick={() => moveRow(index, 'up')}
													aria-label="Move up"
												>
													<IconArrowUp size={14} />
												</IconButton>
												</span>
												</Tooltip>
												<Tooltip title="Move down">
												<span>
												<IconButton
													size="small"
													disabled={index === rows.length - 1}
													onClick={() => moveRow(index, 'down')}
													aria-label="Move down"
												>
													<IconArrowDown size={14} />
												</IconButton>
												</span>
												</Tooltip>
											</>
										)}
									</Stack>
								</TableCell>
								<TableCell>{row.enName}</TableCell>
								<TableCell>{row.bnName}</TableCell>
								<TableCell>
									<Typography variant="body2" fontFamily="monospace">{row.gotoPage}</Typography>
								</TableCell>
								<TableCell>
									<Chip
										size="small"
										variant="outlined"
										color={audienceChipColor[row.audience]}
										label={audienceLabel(row.audience)}
									/>
								</TableCell>
								<TableCell>
									<Switch
										checked={row.isActive}
										onChange={() => handleToggle(row)}
										aria-label="Toggle active"
									/>
								</TableCell>
								<TableCell>
									<Stack direction="row" alignItems="center" spacing={0.5}>
										<Tooltip title="Edit">
											<IconButton size="small" onClick={() => openEdit(row)} aria-label="Edit">
												<IconPencil size={16} />
											</IconButton>
										</Tooltip>
										<Tooltip title="Delete">
											<IconButton
												size="small"
												color="error"
												onClick={() => handleDelete(row.id)}
												aria-label="Delete"
											>
												<IconTrash size={16} />
											</IconButton>
										</Tooltip>
									</Stack>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
			</TableContainer>

			{totalPages > 1 && (
				<Stack direction="row" flexWrap="wrap" justifyContent="center" sx={{ py: 2 }}>
					<Pagination page={page} onChange={(_, p) => setPage(p)} count={totalPages} color="primary" />
				</Stack>
			)}
			</MainCard>

			<Dialog
				open={modalOpened}
				onClose={() => {
					closeModal();
					resetForm();
				}}
				maxWidth="sm"
				fullWidth
				fullScreen={isMobileSm}
			>
				<DialogTitle>{editingId ? 'Edit Quick Access' : 'Add Quick Access'}</DialogTitle>
				<DialogContent>
				<form id="quick-access-form" onSubmit={handleSubmit}>
					<Stack spacing={2} sx={{ pt: 1 }}>
						<TextField
							label="English name"
							required
							value={form.enName}
							error={Boolean(fieldErrors.enName)}
							helperText={fieldErrors.enName}
							onChange={e => {
								const enName = e.currentTarget.value;
								setForm(f => ({ ...f, enName }));
							}}
						/>
						<TextField
							label="Bangla name"
							required
							lang="bn"
							value={form.bnName}
							error={Boolean(fieldErrors.bnName)}
							helperText={fieldErrors.bnName}
							onChange={e => {
								const bnName = e.currentTarget.value;
								setForm(f => ({ ...f, bnName }));
							}}
						/>
						<TextField
							label="Go to page"
							required
							placeholder="/your-route"
							value={form.gotoPage}
							error={Boolean(fieldErrors.gotoPage)}
							helperText={fieldErrors.gotoPage}
							onChange={e => {
								const gotoPage = e.currentTarget.value;
								setForm(f => ({ ...f, gotoPage }));
							}}
						/>
						<FormControl>
							<FormLabel>Audience</FormLabel>
							<RadioGroup
								row
								value={form.audience}
								onChange={e =>
									setForm(f => ({
										...f,
										audience: (e.target.value as QuickAccessAudience) || 'all',
									}))
								}
							>
								{QUICK_ACCESS_AUDIENCE_OPTIONS.map(o => (
									<FormControlLabel key={o.value} value={o.value} control={<Radio />} label={o.label} />
								))}
							</RadioGroup>
						</FormControl>
						{fieldErrors.audience && (
							<Typography variant="body2" color="error">{fieldErrors.audience}</Typography>
						)}
						<FormControlLabel
							control={
								<Switch
									checked={form.isActive}
									onChange={e => {
										const isActive = e.currentTarget.checked;
										setForm(f => ({ ...f, isActive }));
									}}
								/>
							}
							label="Active"
						/>
					</Stack>
				</form>
				</DialogContent>
				<DialogActions>
					<Button variant="outlined" onClick={closeModal} type="button">
						Cancel
					</Button>
					<Button type="submit" form="quick-access-form" variant="contained">Save</Button>
				</DialogActions>
			</Dialog>
		</Stack>
		</PageContainer>
	);
}
