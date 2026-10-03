'use client';

import Loader from '@/components/Loader';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { checkNavPermission } from '@/helper/Commonfunction';
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Divider,
	FormControlLabel,
	Grid,
	Paper,
	Stack,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

dayjs.extend(utc);
dayjs.extend(timezone);

const DHAKA_TZ = 'Asia/Dhaka';

export type MaintenanceStatusDto = {
	isUnderMaintenance: boolean;
	titleEn: string;
	titleBn: string;
	messageEn: string;
	messageBn: string;
	startsAt: string | null;
	endsAt: string | null;
	updatedBy: string | null;
	updatedAt: string | null;
};

type MaintenanceLogEntry = {
	platform: string;
	isUnderMaintenance: boolean;
	titleEn: string;
	messageEn: string;
	startsAt: string | null;
	endsAt: string | null;
	changedBy: string;
	changedAt: string | null;
};

type PlatformKey = 'app' | 'website';

type FormState = MaintenanceStatusDto;

const emptyForm: FormState = {
	isUnderMaintenance: false,
	titleEn: '',
	titleBn: '',
	messageEn: '',
	messageBn: '',
	startsAt: null,
	endsAt: null,
	updatedBy: null,
	updatedAt: null,
};

function utcIsoToDhaka(iso: string | null): Dayjs | null {
	if (!iso) return null;
	return dayjs.utc(iso).tz(DHAKA_TZ);
}

function dhakaPickerToUtcIso(d: Dayjs | null): string | null {
	if (!d || !d.isValid()) return null;
	const wall = d.format('YYYY-MM-DD HH:mm:ss');
	return dayjs.tz(wall, DHAKA_TZ).utc().toISOString();
}

function formatDhakaDisplay(iso: string | null): string {
	if (!iso) return '—';
	return dayjs.utc(iso).tz(DHAKA_TZ).format('YYYY-MM-DD HH:mm');
}

function computeDisplayStatus(form: FormState): 'live' | 'maintenance' | 'scheduled' | 'expired' {
	if (!form.isUnderMaintenance) return 'live';
	const now = Date.now();
	if (form.startsAt && new Date(form.startsAt).getTime() > now) return 'scheduled';
	if (form.endsAt && new Date(form.endsAt).getTime() < now) return 'expired';
	return 'maintenance';
}

const statusChip: Record<
	ReturnType<typeof computeDisplayStatus>,
	{ label: string; color: 'success' | 'warning' | 'error' | 'default' }
> = {
	live: { label: 'Live', color: 'success' },
	maintenance: { label: 'Under maintenance', color: 'warning' },
	scheduled: { label: 'Scheduled', color: 'default' },
	expired: { label: 'Expired', color: 'error' },
};

function formsEqual(a: FormState, b: FormState): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}

function MaintenancePlatformCard({
	platform,
	label,
	initial,
	onSaved,
}: {
	platform: PlatformKey;
	label: string;
	initial: FormState;
	onSaved: (platform: PlatformKey, data: MaintenanceStatusDto) => void;
}) {
	const [saved, setSaved] = useState<FormState>(initial);
	const [form, setForm] = useState<FormState>(initial);
	const [saving, setSaving] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		setSaved(initial);
		setForm(initial);
	}, [initial]);

	const dirty = !formsEqual(form, saved);
	const display = computeDisplayStatus(form);
	const chip = statusChip[display];

	const handleToggle = async (checked: boolean) => {
		if (checked && !form.isUnderMaintenance) {
			const result = await Swal.fire({
				title: 'Enable maintenance?',
				text: `This will show the maintenance screen to all ${label.toLowerCase()} users within about 15 seconds. Continue?`,
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Continue',
				confirmButtonColor: '#d33',
			});
			if (!result.isConfirmed) return;
		}
		setForm(prev => ({ ...prev, isUnderMaintenance: checked }));
		setFieldErrors({});
	};

	const handleSave = async () => {
		setFieldErrors({});
		if (form.isUnderMaintenance) {
			if (!form.titleEn.trim()) {
				setFieldErrors({ titleEn: 'English title is required' });
				return;
			}
			if (!form.messageEn.trim()) {
				setFieldErrors({ messageEn: 'English message is required' });
				return;
			}
		}

		setSaving(true);
		try {
			const response = await fetch(`/api/maintenance/${platform}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					isUnderMaintenance: form.isUnderMaintenance,
					titleEn: form.titleEn,
					titleBn: form.titleBn,
					messageEn: form.messageEn,
					messageBn: form.messageBn,
					startsAt: form.startsAt,
					endsAt: form.endsAt,
				}),
			});
			const data = await response.json().catch(() => ({}));
			if (!response.ok) {
				if (data.field && data.message) {
					setFieldErrors({ [data.field]: data.message });
				} else {
					setFieldErrors({ _form: data.message || 'Save failed' });
				}
				return;
			}
			const next = data as MaintenanceStatusDto;
			setSaved(next);
			setForm(next);
			onSaved(platform, next);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Card variant="outlined" sx={{ height: '100%' }}>
			<CardContent>
				<Stack spacing={2}>
					<Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
						<Typography variant="h6">{label}</Typography>
						<Chip label={chip.label} color={chip.color} size="small" />
					</Stack>

					<FormControlLabel
						control={
							<Switch
								checked={form.isUnderMaintenance}
								onChange={e => handleToggle(e.target.checked)}
								color="warning"
							/>
						}
						label="Maintenance on"
					/>
					<Typography variant="caption" color="text.secondary">
						Changes take up to 15 seconds to reach users.
					</Typography>

					<TextField
						label="Title (EN)"
						value={form.titleEn}
						onChange={e => setForm(prev => ({ ...prev, titleEn: e.target.value }))}
						fullWidth
						size="small"
						required={form.isUnderMaintenance}
						error={Boolean(fieldErrors.titleEn)}
						helperText={fieldErrors.titleEn}
					/>
					<TextField
						label="Title (BN)"
						value={form.titleBn}
						onChange={e => setForm(prev => ({ ...prev, titleBn: e.target.value }))}
						fullWidth
						size="small"
					/>
					<TextField
						label="Message (EN)"
						value={form.messageEn}
						onChange={e => setForm(prev => ({ ...prev, messageEn: e.target.value }))}
						fullWidth
						size="small"
						multiline
						minRows={2}
						required={form.isUnderMaintenance}
						error={Boolean(fieldErrors.messageEn)}
						helperText={fieldErrors.messageEn}
					/>
					<TextField
						label="Message (BN)"
						value={form.messageBn}
						onChange={e => setForm(prev => ({ ...prev, messageBn: e.target.value }))}
						fullWidth
						size="small"
						multiline
						minRows={2}
					/>

					<Typography variant="subtitle2">Schedule (Asia/Dhaka, UTC+06:00)</Typography>
					<DateTimePicker
						label="Start (Asia/Dhaka)"
						value={utcIsoToDhaka(form.startsAt)}
						onChange={d =>
							setForm(prev => ({
								...prev,
								startsAt: dhakaPickerToUtcIso(d),
							}))
						}
						slotProps={{
							textField: {
								size: 'small',
								fullWidth: true,
								error: Boolean(fieldErrors.startsAt),
								helperText: fieldErrors.startsAt,
							},
						}}
					/>
					<DateTimePicker
						label="End (Asia/Dhaka)"
						value={utcIsoToDhaka(form.endsAt)}
						onChange={d =>
							setForm(prev => ({
								...prev,
								endsAt: dhakaPickerToUtcIso(d),
							}))
						}
						slotProps={{
							textField: {
								size: 'small',
								fullWidth: true,
								error: Boolean(fieldErrors.endsAt),
								helperText: fieldErrors.endsAt,
							},
						}}
					/>

					<Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
						<Typography variant="subtitle2" gutterBottom>Preview</Typography>
						<Grid container spacing={2}>
							<Grid item xs={12} md={6}>
								<Typography variant="caption" color="text.secondary">English</Typography>
								<Typography variant="subtitle1" fontWeight={600}>
									{form.titleEn || '—'}
								</Typography>
								<Typography variant="body2">{form.messageEn || '—'}</Typography>
							</Grid>
							<Grid item xs={12} md={6}>
								<Typography variant="caption" color="text.secondary">Bangla</Typography>
								<Typography variant="subtitle1" fontWeight={600}>
									{form.titleBn || '—'}
								</Typography>
								<Typography variant="body2">{form.messageBn || '—'}</Typography>
							</Grid>
						</Grid>
					</Paper>

					{fieldErrors._form && (
						<Alert severity="error">{fieldErrors._form}</Alert>
					)}

					<Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
						<Typography variant="caption" color="text.secondary">
							{saved.updatedBy && saved.updatedAt
								? `Last updated by ${saved.updatedBy} at ${formatDhakaDisplay(saved.updatedAt)} (Dhaka)`
								: 'Not updated yet'}
						</Typography>
						<Button variant="contained" onClick={handleSave} disabled={!dirty || saving}>
							{saving ? 'Saving…' : 'Save'}
						</Button>
					</Stack>
				</Stack>
			</CardContent>
		</Card>
	);
}

export default function MaintenancePage() {
	const canManage = checkNavPermission('assign_roles');
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [appStatus, setAppStatus] = useState<FormState>(emptyForm);
	const [websiteStatus, setWebsiteStatus] = useState<FormState>(emptyForm);
	const [logEntries, setLogEntries] = useState<MaintenanceLogEntry[]>([]);

	const fetchLog = useCallback(async () => {
		const response = await fetch('/api/maintenance/log?limit=20');
		if (!response.ok) return;
		const data = await response.json();
		setLogEntries(data.entries ?? []);
	}, []);

	const fetchAll = useCallback(async () => {
		if (!canManage) {
			setLoading(false);
			return;
		}
		setLoading(true);
		setLoadError(null);
		try {
			const response = await fetch('/api/maintenance');
			if (!response.ok) {
				setLoadError('Failed to load maintenance status');
				return;
			}
			const data = await response.json();
			if (data.app) setAppStatus({ ...emptyForm, ...data.app });
			if (data.website) setWebsiteStatus({ ...emptyForm, ...data.website });
			await fetchLog();
		} catch {
			setLoadError('Failed to load maintenance status');
		} finally {
			setLoading(false);
		}
	}, [canManage, fetchLog]);

	useEffect(() => {
		fetchAll();
	}, [fetchAll]);

	const historyRows = useMemo(() => logEntries, [logEntries]);

	if (!canManage) {
		return (
			<PageContainer title="Maintenance" items={[{ label: 'Maintenance', href: '/dashboard/maintenance' }]}>
				<Alert severity="warning">You do not have permission to manage maintenance status.</Alert>
			</PageContainer>
		);
	}

	if (loading) {
		return (
			<PageContainer title="Maintenance" items={[{ label: 'Maintenance', href: '/dashboard/maintenance' }]}>
				<Loader />
			</PageContainer>
		);
	}

	return (
		<PageContainer title="Maintenance" items={[{ label: 'Maintenance', href: '/dashboard/maintenance' }]}>
			{loadError && (
				<Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>
			)}
			<Grid container spacing={3}>
				<Grid item xs={12} lg={6}>
					<MaintenancePlatformCard
						platform="app"
						label="App"
						initial={appStatus}
						onSaved={(p, data) => {
							if (p === 'app') setAppStatus(data);
							fetchLog();
						}}
					/>
				</Grid>
				<Grid item xs={12} lg={6}>
					<MaintenancePlatformCard
						platform="website"
						label="Website"
						initial={websiteStatus}
						onSaved={(p, data) => {
							if (p === 'website') setWebsiteStatus(data);
							fetchLog();
						}}
					/>
				</Grid>
			</Grid>

			<Box sx={{ mt: 4 }}>
				<Typography variant="h6" gutterBottom>History</Typography>
				<Divider sx={{ mb: 2 }} />
				<TableContainer component={Paper} variant="outlined">
					<Table size="small">
						<TableHead>
							<TableRow>
								<TableCell>When (Dhaka)</TableCell>
								<TableCell>Platform</TableCell>
								<TableCell>State</TableCell>
								<TableCell>Title (EN)</TableCell>
								<TableCell>Who</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{historyRows.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} align="center">
										No changes recorded yet.
									</TableCell>
								</TableRow>
							) : (
								historyRows.map((row, index) => (
									<TableRow key={`${row.changedAt}-${row.platform}-${index}`}>
										<TableCell>{formatDhakaDisplay(row.changedAt)}</TableCell>
										<TableCell>{row.platform}</TableCell>
										<TableCell>
											{row.isUnderMaintenance ? 'On' : 'Off'}
										</TableCell>
										<TableCell>{row.titleEn || '—'}</TableCell>
										<TableCell>{row.changedBy}</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Box>
		</PageContainer>
	);
}
