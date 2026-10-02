'use client';

import {
	Avatar,
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	Stack,
	Tooltip,
	Typography,
	alpha,
	useTheme,
} from '@mui/material';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	IconCoin,
	IconMoodEmpty,
	IconRefresh,
	IconRepeat,
	IconSearch,
	IconShoppingCart,
	IconX,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useDisclosure } from '@/hooks/use-disclosure';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CustomDatePicker } from '@/components/Form/CustomDatePicker';
import Loader from '@/components/Loader';
import { checkgetPermission } from '@/helper/Commonfunction';

/* ── Gateway key map ─────────────────────────── */
const GATEWAYS = ['Bkash','Nagad','Upay','Robi','GP','BL','ApplePay','GooglePay','Stripe','Aamarpay'] as const;
const GW_KEYS: Record<string, [string,string,string]> = {
	Bkash:     ['Bkash-onetime0',     'Bkash-recurring0',     'bkash-onetime1'],
	Nagad:     ['NAGAD-onetime0',     'NAGAD-recurring0',     'nagad-onetime1'],
	Upay:      ['UPAY-onetime0',      'UPAY-recurring0',      'upay-onetime1'],
	Robi:      ['ROBI-onetime0',      'ROBI-recurring0',      'robi-onetime1'],
	GP:        ['GP-onetime0',        'GP-recurring0',        'gp-onetime1'],
	BL:        ['BL-onetime0',        'BL-recurring0',        'BL-onetime1'],
	ApplePay:  ['APP_STORE-onetime0', 'APP_STORE-recurring0', 'app_store-onetime1'],
	GooglePay: ['PLAY_STORE-onetime0','PLAY_STORE-recurring0','play_store-onetime1'],
	Stripe:    ['STRIPE-onetime0',    'STRIPE-recurring0',    'stripe-onetime1'],
	Aamarpay:  ['AAMARPAY-onetime0',  'AAMARPAY-recurring0',  'aamarpay-onetime1'],
};

function getBreakdown(list: any[]) {
	return GATEWAYS.map(name => {
		const [k0,k1,k2] = GW_KEYS[name];
		const f = (k: string) => list.find((i:any) => i[0]?.toLowerCase() === k.toLowerCase())?.[1] ?? 0;
		return { name, onetime: f(k0), recurring: f(k1), rent: f(k2) };
	}).filter(g => g.onetime + g.recurring + g.rent > 0);
}

/* ── Day pill ─────────────────────────────────── */
function DayPill({ date, total, onClick }: { date: string; total: number; onClick: () => void }) {
	const theme = useTheme();
	const main = theme.palette.success.main;
	return (
		<Box
			component={motion.div}
			whileHover={{ y: -3, boxShadow: `0 6px 16px ${alpha(main, 0.22)}` }}
			whileTap={{ scale: 0.97 }}
			onClick={onClick}
			sx={{
				px: 2, py: 1.25, borderRadius: 2,
				border: `1px solid ${alpha(main, 0.28)}`,
				bgcolor: alpha(main, 0.06),
				cursor: 'pointer', minWidth: 76, textAlign: 'center',
				transition: 'all 0.18s',
				'&:hover': { bgcolor: alpha(main, 0.1) },
			}}
		>
			<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', lineHeight: 1.3 }}>
				{moment(date).format('D MMM')}
			</Typography>
			<Typography variant="subtitle2" fontWeight={800} sx={{ color: main }}>
				{total.toLocaleString()}
			</Typography>
		</Box>
	);
}

/* ── Gateway card in modal ────────────────────── */
function GatewayCard({ name, onetime, recurring, rent, pct }: {
	name: string; onetime: number; recurring: number; rent: number; pct: number;
}) {
	const theme = useTheme();
	const main = theme.palette.primary.main;
	const total = onetime + recurring + rent;
	return (
		<Box sx={{
			p: 2, borderRadius: 2,
			border: `1px solid ${theme.palette.divider}`,
			bgcolor: 'background.paper', flex: '1 1 160px', minWidth: 150,
		}}>
			<Stack spacing={1.25}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
					<Typography variant="caption" fontWeight={700} textTransform="uppercase" letterSpacing="0.06em" color="text.secondary" noWrap>
						{name}
					</Typography>
					<Chip label={total} size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.72rem' }} />
				</Box>
				<Box sx={{ height: 4, borderRadius: 2, bgcolor: alpha(main, 0.1) }}>
					<Box component={motion.div} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }}
						sx={{ height: '100%', borderRadius: 2, bgcolor: main }} />
				</Box>
				<Stack direction="row" spacing={1} justifyContent="space-between">
					{[
						{ icon: <IconShoppingCart size={12} stroke={1.5} />, label: 'One-time', val: onetime },
						{ icon: <IconRepeat size={12} stroke={1.5} />, label: 'Recurring', val: recurring },
						{ icon: <IconCoin size={12} stroke={1.5} />, label: 'Rent', val: rent },
					].map(({ icon, label, val }) => (
						<Tooltip key={label} title={label}>
							<Stack alignItems="center" spacing={0.25}>
								<Box sx={{ color: 'text.disabled' }}>{icon}</Box>
								<Typography variant="caption" fontWeight={700}>{val}</Typography>
							</Stack>
						</Tooltip>
					))}
				</Stack>
			</Stack>
		</Box>
	);
}

/* ── Revenue section block ────────────────────── */
function RevenueSection({ title, imageUrl, list, onDayClick, modalOpened, closeModal, modalTitle, nestedList }: {
	title: string; imageUrl: string; list: any[]; onDayClick: (d: any) => void;
	modalOpened: boolean; closeModal: () => void; modalTitle: string; nestedList: any[];
}) {
	const theme = useTheme();
	const grandTotal = list.reduce((acc: number, item: any) =>
		acc + Object.values(item[1] as object).reduce((s: number, v: number) => s + v, 0), 0);
	const breakdown = getBreakdown(nestedList);
	const maxVal = Math.max(...breakdown.map(b => b.onetime + b.recurring + b.rent), 1);

	return (
		<>
			<Box sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
				{/* Section header */}
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<Avatar src={imageUrl} alt={title} variant="rounded"
							sx={{ width: 36, height: 36, bgcolor: 'grey.100', '& img': { objectFit: 'contain' } }} />
						<Box>
							<Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
							<Typography variant="caption" color="text.secondary">{list.length} day{list.length !== 1 ? 's' : ''} of data</Typography>
						</Box>
					</Box>
					<Chip label={`${grandTotal.toLocaleString()} total`} size="small" color="success" sx={{ fontWeight: 700 }} />
				</Box>

				{/* Day pills */}
				{list.length ? (
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
						{list.map((item: any) => {
							const dayTotal = Object.values(item[1] as object).reduce((a: number, v: number) => a + v, 0);
							return (
								<DayPill key={item[0]} date={item[0]} total={dayTotal as number} onClick={() => onDayClick(item[1])} />
							);
						})}
					</Box>
				) : (
					<Box sx={{ py: 3, textAlign: 'center' }}>
						<IconMoodEmpty size={28} stroke={1.5} style={{ color: theme.palette.text.disabled, marginBottom: 6 }} />
						<Typography variant="body2" color="text.disabled">No payments in this range</Typography>
					</Box>
				)}
			</Box>

			{/* Detail modal */}
			<Dialog open={modalOpened} onClose={closeModal} maxWidth="md" fullWidth
				PaperProps={{ sx: { borderRadius: 3 } }}>
				<DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<Avatar src={imageUrl} alt={title} variant="rounded" sx={{ width: 30, height: 30, bgcolor: 'grey.100', '& img': { objectFit: 'contain' } }} />
						<Typography variant="h6" fontWeight={700}>{modalTitle}</Typography>
					</Box>
					<IconButton size="small" onClick={closeModal} sx={{ color: 'text.secondary' }}>
						<IconX size={18} />
					</IconButton>
				</DialogTitle>
				<Divider />
				<DialogContent sx={{ pt: 2.5 }}>
					{breakdown.length > 0 ? (
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
							{breakdown.map(({ name, onetime, recurring, rent }) => (
								<GatewayCard key={name} name={name} onetime={onetime} recurring={recurring} rent={rent}
									pct={Math.round(((onetime + recurring + rent) / maxVal) * 100)} />
							))}
						</Box>
					) : (
						<Typography variant="body2" color="text.disabled" textAlign="center" sx={{ py: 4 }}>No gateway data</Typography>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}

/* ── Page ─────────────────────────────────────── */
const formSchema = z.object({
	startDate: z.date({ required_error: 'Required' }),
	endDate: z.date({ required_error: 'Required' }),
});
type FormData = z.infer<typeof formSchema>;

export default function Revenue() {
	const [data, setData] = useState({ kabbik: [], mybl: [], course: [] });
	const [individual, setIndividual] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [updatedAt, setUpdatedAt] = useState<string | null>(null);
	const [detailsOpened,       { open: openDetails,       close: closeDetails       }] = useDisclosure(false);
	const [detailsOpenedMyBl,   { open: openDetailsMyBl,   close: closeDetailsMyBl   }] = useDisclosure(false);
	const [detailsOpenedCourse, { open: openDetailsCourse, close: closeDetailsCourse }] = useDisclosure(false);
	const [date, setDate] = useState({
		startDate: moment().subtract(6, 'days').format('YYYY-MM-DD'),
		endDate: moment().format('YYYY-MM-DD'),
	});
	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			startDate: new Date(moment().subtract(6, 'days').format('YYYY-MM-DD')),
			endDate: new Date(),
		},
	});

	const getData = useCallback(async (refresh = false) => {
		try {
			setIsLoading(true);
			const r = refresh ? '&refresh=1' : '';
			const res = await fetch(`/api/routes/revenue?startDate=${date.startDate}&endDate=${date.endDate}${r}`, { cache: 'no-store' });
			if (!res.ok) throw new Error('Failed');
			const d = await res.json();
			setUpdatedAt(d.updatedAt ?? null);
			setData({
				kabbik: Object.entries(d.kabbik ?? {}) as [],
				mybl:   Object.entries(d.mybl   ?? {}) as [],
				course: Object.entries(d.course  ?? {}) as [],
			});
		} catch (e) { console.error(e); }
		finally { setIsLoading(false); }
	}, [date]);

	const handleRefresh = async () => {
		if (!checkgetPermission('see_subscription_revenue_report')) return;
		setRefreshing(true);
		try { await getData(true); } finally { setRefreshing(false); }
	};

	useEffect(() => { getData(); }, [getData]);

	const handleSubmit = (fd: FormData) => {
		setDate({
			startDate: moment(fd.startDate).format('YYYY-MM-DD'),
			endDate:   moment(fd.endDate).format('YYYY-MM-DD'),
		});
	};

	const openModal = (fn: () => void, raw: any) => { fn(); setIndividual(Object.entries({ ...raw }) as any[]); };
	const updatedLabel = updatedAt ? `Updated ${moment(updatedAt).fromNow()}` : null;

	return (
		<PageContainer
			title="Subscription Revenue Report"
			items={[{ label: 'Revenue', href: '/dashboard/revenue' }]}
			subtitle={updatedLabel
				? <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{updatedLabel}</Typography>
				: undefined
			}
			actions={
				checkgetPermission('see_subscription_revenue_report') ? (
					<Button variant="outlined" size="small"
						startIcon={refreshing ? <CircularProgress size={13} /> : <IconRefresh size={14} />}
						disabled={refreshing} onClick={handleRefresh}>
						Refresh
					</Button>
				) : undefined
			}
		>
			<MainCard contentSX={{ p: 3 }}>
				<Stack spacing={3}>
					{/* ── Date filter section ── */}
					<Box sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
						<Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 2, display: 'block' }}>
							Date range
						</Typography>
						<form onSubmit={form.handleSubmit(handleSubmit, e => console.error(e))}>
							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
								<Box sx={{ flex: 1, '& .MuiFormControl-root': { mt: 0, mb: 0 }, '& .MuiFormHelperText-root': { display: 'none' } }}>
									<CustomDatePicker name="startDate" label="Start Date" control={form.control}
										placeholder="Pick a date" error={(form.formState.errors.startDate?.message) as string} />
								</Box>
								<Box sx={{ flex: 1, '& .MuiFormControl-root': { mt: 0, mb: 0 }, '& .MuiFormHelperText-root': { display: 'none' } }}>
									<CustomDatePicker name="endDate" label="End Date" control={form.control}
										placeholder="Pick a date" error={(form.formState.errors.endDate?.message) as string} />
								</Box>
								<Button type="submit" variant="contained" startIcon={<IconSearch size={15} />}
									sx={{ px: 3, whiteSpace: 'nowrap', flexShrink: 0 }}>
									Apply
								</Button>
							</Stack>
						</form>
					</Box>

					{/* ── Revenue data ── */}
					{isLoading ? <Loader /> : (
						<>
							<Box sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
								<Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 2.5, display: 'block' }}>
									Revenue sources
								</Typography>
								<Stack spacing={2}>
									<RevenueSection
										title="Kabbik Revenue"
										imageUrl="https://kabbik-space.sgp1.digitaloceanspaces.com/1713780521478.png"
										list={data.kabbik}
										onDayClick={d => openModal(openDetails, d)}
										modalOpened={detailsOpened} closeModal={closeDetails}
										modalTitle="Kabbik Payment Breakdown" nestedList={individual}
									/>
									<RevenueSection
										title="MyBL Revenue"
										imageUrl="https://kabbik-space.sgp1.digitaloceanspaces.com/1713780481387.png"
										list={data.mybl}
										onDayClick={d => openModal(openDetailsMyBl, d)}
										modalOpened={detailsOpenedMyBl} closeModal={closeDetailsMyBl}
										modalTitle="MyBL Payment Breakdown" nestedList={individual}
									/>
									<RevenueSection
										title="Course Revenue"
										imageUrl="https://kabbik-space.sgp1.digitaloceanspaces.com/course.png"
										list={data.course}
										onDayClick={d => openModal(openDetailsCourse, d)}
										modalOpened={detailsOpenedCourse} closeModal={closeDetailsCourse}
										modalTitle="Course Payment Breakdown" nestedList={individual}
									/>
								</Stack>
							</Box>
						</>
					)}
				</Stack>
			</MainCard>
		</PageContainer>
	);
}
