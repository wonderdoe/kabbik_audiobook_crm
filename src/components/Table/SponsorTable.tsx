'use client';

import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	InputAdornment,
	Link,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import {
	DirectoryListCard,
	directoryTableSx,
} from '@/components/directory/directoryListUi';
import { MainCard } from '@/components/mantis/MainCard';
import { DetailGrid } from '@/components/ui/DetailGrid';
import { StatCard } from '@/components/ui/StatCard';
import Loader from '@/components/Loader';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useIsMobileSm } from '@/hooks/use-is-mobile-sm';
import { formatPhoneNumber } from '@/utils/globalHelpers';
import {
	IconBuildingStore,
	IconCalendar,
	IconExternalLink,
	IconEye,
	IconMail,
	IconSearch,
	IconUsers,
	IconX,
} from '@tabler/icons-react';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';

const PAGE_SIZE = 20;

export type SponsorshipRequestRow = {
	id?: number;
	product_name?: string;
	company_product_details?: string;
	link?: string;
	contact_person_name?: string;
	contact_person_phone?: string;
	contact_person_email?: string;
	created_at?: string;
};

function formatPhone(phone: string | undefined | null) {
	if (!phone) return '—';
	const local = phone.includes('0') ? phone.slice(phone.indexOf('0')) : phone;
	return formatPhoneNumber(local) || local;
}

function truncate(text: string, max = 72) {
	if (text.length <= max) return text;
	return `${text.slice(0, max).trim()}…`;
}

export function SponsorTable() {
	const isMobileSm = useIsMobileSm();
	const [loading, setLoading] = useState(true);
	const [rows, setRows] = useState<SponsorshipRequestRow[]>([]);
	const [searchInput, setSearchInput] = useState('');
	const [searchKey, setSearchKey] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [selected, setSelected] = useState<SponsorshipRequestRow | null>(null);

	const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);

	const loadRows = useCallback(async () => {
		setLoading(true);
		try {
			const response = await fetch('/api/routes/sponsorship-request', { cache: 'no-store' });
			const result = await response.json();
			setRows(Array.isArray(result.response) ? result.response : []);
		} catch (error) {
			console.error('Failed to load sponsorship requests:', error);
			setRows([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadRows();
	}, [loadRows]);

	const withLinkCount = useMemo(
		() => rows.filter(r => Boolean(r.link?.trim())).length,
		[rows],
	);

	const recentCount = useMemo(() => {
		const cutoff = moment().subtract(30, 'days');
		return rows.filter(r => r.created_at && moment(r.created_at).isAfter(cutoff)).length;
	}, [rows]);

	const filtered = useMemo(() => {
		const q = searchKey.trim().toLowerCase();
		if (!q) return rows;
		return rows.filter(row => {
			const haystack = [
				row.product_name,
				row.company_product_details,
				row.contact_person_name,
				row.contact_person_phone,
				row.contact_person_email,
				row.link,
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return haystack.includes(q);
		});
	}, [rows, searchKey]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const pageRows = useMemo(() => {
		const start = (currentPage - 1) * PAGE_SIZE;
		return filtered.slice(start, start + PAGE_SIZE);
	}, [filtered, currentPage]);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchKey]);

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSearchKey(searchInput.trim());
	};

	const clearSearch = () => {
		setSearchInput('');
		setSearchKey('');
	};

	const showDetails = (row: SponsorshipRequestRow) => {
		setSelected(row);
		openDetails();
	};

	return (
		<Stack spacing={2} sx={{ minWidth: 0, width: '100%' }}>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
					<StatCard
						title="Total requests"
						value={rows.length}
						color="primary"
						icon={<IconUsers size={22} />}
						loading={loading}
					/>
				</Grid>
				<Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
					<StatCard
						title="Last 30 days"
						value={recentCount}
						color="info"
						icon={<IconCalendar size={22} />}
						loading={loading}
					/>
				</Grid>
				<Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
					<StatCard
						title="With product link"
						value={withLinkCount}
						color="success"
						icon={<IconBuildingStore size={22} />}
						loading={loading}
					/>
				</Grid>
			</Grid>

			<MainCard title="Search">
				<Stack
					component="form"
					onSubmit={handleSearchSubmit}
					direction={{ xs: 'column', md: 'row' }}
					spacing={1.5}
					alignItems={{ xs: 'stretch', md: 'center' }}
					sx={{ width: '100%' }}
				>
					<TextField
						size="small"
						label="Search"
						placeholder="Product, company, contact, email, or link…"
						value={searchInput}
						onChange={e => setSearchInput(e.target.value)}
						sx={{ flex: 1, minWidth: 0 }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<IconSearch size={18} style={{ opacity: 0.55 }} />
								</InputAdornment>
							),
						}}
					/>
					<Stack
						direction="row"
						spacing={1}
						sx={{ flexShrink: 0, width: { xs: '100%', md: 'auto' } }}
					>
						<Button
							type="submit"
							variant="contained"
							size="small"
							sx={{ flex: { xs: 1, md: 'none' }, whiteSpace: 'nowrap' }}
						>
							Search
						</Button>
						{searchKey ? (
							<Button
								type="button"
								variant="outlined"
								size="small"
								color="inherit"
								onClick={clearSearch}
								sx={{ flex: { xs: 1, md: 'none' }, whiteSpace: 'nowrap' }}
							>
								Clear
							</Button>
						) : null}
					</Stack>
				</Stack>
			</MainCard>

			{loading ? (
				<Loader />
			) : (
				<DirectoryListCard
					title="Requests"
					subtitle={searchKey ? `${filtered.length.toLocaleString()} matching` : undefined}
					totalCount={filtered.length}
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					isEmpty={filtered.length === 0}
					emptyMessage={
						searchKey ? 'No requests match your search.' : 'No sponsorship requests yet.'
					}
				>
					<Table size="small" sx={directoryTableSx}>
						<TableHead>
							<TableRow>
								<TableCell>Product</TableCell>
								<TableCell>Company</TableCell>
								<TableCell>Contact</TableCell>
								<TableCell width={140}>Submitted</TableCell>
								<TableCell align="right" sx={{ width: 160, minWidth: 160 }}>
									Actions
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{pageRows.map((row, index) => {
								const key = row.id ?? `row-${index}`;
								const details = row.company_product_details?.trim() ?? '';
								const href = row.link?.trim();
								return (
									<TableRow key={key} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
										<TableCell>
											<Typography variant="body2" fontWeight={600}>
												{row.product_name || '—'}
											</Typography>
											{href ? (
												<Link
													href={href}
													target="_blank"
													rel="noopener noreferrer"
													variant="caption"
													sx={{
														display: 'inline-flex',
														alignItems: 'center',
														gap: 0.25,
														mt: 0.25,
													}}
												>
													<IconExternalLink size={14} />
													Open link
												</Link>
											) : (
												<Typography variant="caption" color="text.secondary" display="block">
													No link
												</Typography>
											)}
										</TableCell>
										<TableCell sx={{ maxWidth: 280 }}>
											{details ? (
												<Typography variant="body2" color="text.secondary">
													{truncate(details)}
												</Typography>
											) : (
												<Typography variant="body2" color="text.secondary">—</Typography>
											)}
										</TableCell>
										<TableCell>
											<Typography variant="body2" fontWeight={500}>
												{row.contact_person_name || '—'}
											</Typography>
											<Typography variant="caption" color="text.secondary" display="block">
												{formatPhone(row.contact_person_phone)}
											</Typography>
											{row.contact_person_email ? (
												<Typography
													variant="caption"
													color="text.secondary"
													sx={{ wordBreak: 'break-word' }}
													display="block"
												>
													{row.contact_person_email}
												</Typography>
											) : null}
										</TableCell>
										<TableCell>
											<Typography variant="body2">
												{row.created_at
													? moment(row.created_at).format('D MMM YYYY')
													: '—'}
											</Typography>
											{row.created_at ? (
												<Typography variant="caption" color="text.secondary" display="block">
													{moment(row.created_at).format('h:mm a')}
												</Typography>
											) : null}
										</TableCell>
										<TableCell align="right">
											<Button
												size="small"
												variant="text"
												startIcon={<IconEye size={16} />}
												onClick={() => showDetails(row)}
											>
												Details
											</Button>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</DirectoryListCard>
			)}

			<Dialog
				open={detailsOpened}
				onClose={closeDetails}
				maxWidth="md"
				fullWidth
				fullScreen={isMobileSm}
				scroll="paper"
			>
				<DialogTitle sx={{ pr: 6 }}>
					Sponsorship request
					<Typography variant="body2" color="text.secondary" fontWeight={400}>
						{selected?.product_name ?? 'Product'} ·{' '}
						{selected?.contact_person_name ?? 'Contact'}
					</Typography>
				</DialogTitle>
				<IconButton
					onClick={closeDetails}
					sx={{ position: 'absolute', right: 12, top: 12 }}
					aria-label="Close"
				>
					<IconX size={20} />
				</IconButton>
				<DialogContent dividers>
					<Stack spacing={3}>
						<DetailGrid
							fields={[
								{ label: 'Product', value: selected?.product_name },
								{
									label: 'Product link',
									value: selected?.link?.trim()
										? (
											<Link
												href={selected.link.trim()}
												target="_blank"
												rel="noopener noreferrer"
												sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
											>
												<IconExternalLink size={16} />
												{selected.link.trim()}
											</Link>
										)
										: '—',
								},
								{ label: 'Contact', value: selected?.contact_person_name },
								{ label: 'Phone', value: formatPhone(selected?.contact_person_phone) },
								{
									label: 'Email',
									value: selected?.contact_person_email
										? (
											<Stack direction="row" alignItems="center" spacing={0.5}>
												<IconMail size={16} style={{ opacity: 0.6 }} />
												<span>{selected.contact_person_email}</span>
											</Stack>
										)
										: '—',
								},
								{
									label: 'Submitted',
									value: selected?.created_at
										? moment(selected.created_at).format('D MMM YYYY, h:mm a')
										: '—',
								},
							]}
						/>
						<Box>
							<Typography variant="subtitle2" gutterBottom>
								Company & product details
							</Typography>
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
							>
								{selected?.company_product_details?.trim() || '—'}
							</Typography>
						</Box>
					</Stack>
				</DialogContent>
			</Dialog>
		</Stack>
	);
}
