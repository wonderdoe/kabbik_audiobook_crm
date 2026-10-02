'use client';

import {
	Box,
	CircularProgress,
	Divider,
	IconButton,
	InputAdornment,
	Stack,
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
import { directoryTableSx } from '@/components/directory/directoryListUi';
import { IconCheck, IconCopy, IconSearch } from '@tabler/icons-react';
import moment from 'moment';
import { useState } from 'react';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import { TableThumbnail } from '@/components/mantis/TableThumbnail';

type PaymentLogRow = {
	subscription_id?: string;
	sub_request_id?: string;
	name?: string;
	payment_method?: string;
	amount?: number | string;
	created_at?: string;
	payment_proof?: string;
	payment_status?: string;
	payer?: string;
	user_id?: number;
};

function SubscriptionIdCell({ value }: { value: string }) {
	const [copied, setCopied] = useState(false);
	const copy = () => {
		void navigator.clipboard.writeText(value).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1800);
		});
	};
	return (
		<Stack direction="row" alignItems="center" spacing={0.25} sx={{ minWidth: 0 }}>
			<Tooltip title={value} placement="top-start">
				<Typography
					variant="body2"
					sx={{
						flex: 1,
						minWidth: 0,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}
				>
					{value}
				</Typography>
			</Tooltip>
			<Tooltip title={copied ? 'Copied!' : 'Copy subscription id'}>
				<IconButton
					size="small"
					onClick={copy}
					color={copied ? 'success' : 'default'}
					aria-label="Copy subscription id"
					sx={{ flexShrink: 0, p: 0.5 }}
				>
					{copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
				</IconButton>
			</Tooltip>
		</Stack>
	);
}

export default function ProofOfPaymentPage() {
	const [payerNo, setPayerNo] = useState('');
	const [loading, setLoading] = useState(false);
	const [searched, setSearched] = useState(false);
	const [rows, setRows] = useState<PaymentLogRow[]>([]);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const value = String(formData.get('payerNo') ?? '').trim();
		setPayerNo(value);
		if (!value) {
			setError('Enter a payer number');
			setRows([]);
			setSearched(false);
			return;
		}
		setLoading(true);
		setError(null);
		setSearched(true);
		try {
			const response = await fetch(
				`/api/routes/proof-of-payment?payerNo=${encodeURIComponent(value)}`,
			);
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.message || 'Failed to fetch payment log');
			}
			setRows(data.results ?? []);
		} catch (err) {
			console.error(err);
			setError(err instanceof Error ? err.message : 'Failed to fetch payment log');
			setRows([]);
		} finally {
			setLoading(false);
		}
	};

	const proofSrc = (row: PaymentLogRow) =>
		row.payment_proof || (row as Record<string, string>).proof_of_payment;

	const formatAmount = (amount: PaymentLogRow['amount']) => {
		if (amount === null || amount === undefined || amount === '') return '—';
		const n = Number(amount);
		return Number.isFinite(n) ? n.toFixed(2) : String(amount);
	};

	const ellipsisCell = {
		maxWidth: 160,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
	};

	return (
		<PageContainer
			title="Proof of Payment"
			items={[{ label: 'Proof of Payment', href: '/dashboard/proof-of-payment' }]}
		>
			<MainCard title="Search by payer number">
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					Enter payer mobile number (e.g. 013094501029) to load subscription payment logs.
				</Typography>
				<form onSubmit={handleSubmit}>
					<TextField
						name="payerNo"
						fullWidth
						size="small"
						placeholder="Payer number"
						defaultValue={payerNo}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton type="submit" edge="end" aria-label="Search" disabled={loading}>
										<IconSearch size={18} />
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
				</form>
			</MainCard>
			<Box sx={{ height: 16 }} />
			<MainCard contentSX={{ p: 0 }}>
				{loading ? (
					<Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 6 }}>
						<CircularProgress size={28} />
					</Box>
				) : error ? (
					<Typography color="error" textAlign="center" sx={{ py: 4 }}>
						{error}
					</Typography>
				) : searched && rows.length === 0 ? (
					<Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
						No payment logs found for {payerNo}.
					</Typography>
				) : (
					<>
						<TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
							<Table
								size="small"
								sx={{
									tableLayout: 'fixed',
									width: '100%',
									minWidth: 880,
									...directoryTableSx,
								}}
							>
								<TableHead>
									<TableRow>
										<TableCell component="th" sx={{ width: 72 }}>User Id</TableCell>
										<TableCell component="th" sx={{ width: 180 }}>Subscription Id</TableCell>
										<TableCell component="th" sx={{ width: 110 }}>Package</TableCell>
										<TableCell component="th" sx={{ width: 88 }}>Method</TableCell>
										<TableCell component="th" sx={{ width: 72 }}>Amount</TableCell>
										<TableCell component="th" sx={{ width: 140 }}>Status</TableCell>
										<TableCell component="th" sx={{ width: 148 }}>Created At</TableCell>
										<TableCell component="th" sx={{ width: 120 }}>Proof</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{rows.map((row, index) => {
										const src = proofSrc(row);
										const subscriptionId =
											row.subscription_id ?? row.sub_request_id ?? '—';
										const subscriptionLabel =
											subscriptionId === '—' ? '—' : String(subscriptionId);
										return (
											<TableRow
												key={`${row.user_id}-${row.created_at}-${subscriptionLabel}-${index}`}
											>
												<TableCell>{row.user_id ?? '—'}</TableCell>
												<TableCell sx={{ maxWidth: 180, overflow: 'hidden' }}>
													{subscriptionLabel === '—' ? (
														'—'
													) : (
														<SubscriptionIdCell value={subscriptionLabel} />
													)}
												</TableCell>
												<TableCell sx={ellipsisCell}>
													<Tooltip title={row.name ?? ''} placement="top-start">
														<Typography variant="body2" component="span" sx={ellipsisCell} display="block">
															{row.name ?? '—'}
														</Typography>
													</Tooltip>
												</TableCell>
												<TableCell>{row.payment_method ?? '—'}</TableCell>
												<TableCell>{formatAmount(row.amount)}</TableCell>
												<TableCell sx={ellipsisCell}>
													<Tooltip title={row.payment_status ?? ''} placement="top-start">
														<Typography variant="body2" component="span" sx={ellipsisCell} display="block">
															{row.payment_status ?? '—'}
														</Typography>
													</Tooltip>
												</TableCell>
												<TableCell sx={{ whiteSpace: 'nowrap' }}>
													{row.created_at
														? moment(row.created_at).format('Do MMM YYYY h:mma')
														: '—'}
												</TableCell>
												<TableCell sx={{ maxWidth: 120 }}>
													{src ? (
														<TableThumbnail
															src={src}
															alt={row.payment_method ?? 'proof'}
															objectFit="contain"
														/>
													) : (
														'—'
													)}
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</TableContainer>
						{rows.length > 0 && <Divider sx={{ my: 1 }} />}
						{rows.length > 0 && (
							<Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }}>
								{rows.length} record{rows.length === 1 ? '' : 's'}
							</Typography>
						)}
					</>
				)}
			</MainCard>
		</PageContainer>
	);
}
