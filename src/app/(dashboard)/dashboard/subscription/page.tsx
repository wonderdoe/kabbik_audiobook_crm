'use client';

import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	InputAdornment,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import { MainCard } from '@/components/mantis/MainCard';
import { DetailGrid } from '@/components/ui/DetailGrid';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import {
	DirectoryListCard,
	directoryTableSx,
} from '@/components/directory/directoryListUi';
import { StatCard } from '@/components/ui/StatCard';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useIsMobileSm } from '@/hooks/use-is-mobile-sm';
import { IconEye, IconRepeat, IconSearch, IconUserCheck, IconUsers, IconX } from '@tabler/icons-react';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { SubscribeForm } from '@/components/Form/SubscribeForm';
import Loader from '@/components/Loader';
import { formatPhoneNumber } from '@/utils/globalHelpers';

export default function Subscription() {
	const isMobileSm = useIsMobileSm();
	const [detailsModalOpened, { open: openDetailsModal, close: closeDetailsModal }] = useDisclosure(false);
	const [subscribeModalOpened, { open: openSubscribeModal, close: closeSubscribeModal }] =
		useDisclosure(false);
	const [isLoadingDetails, setIsLoadingDetails] = useState(false);

	const [menuData, setMenuData] = useState<any[]>([]);
	const [filteredData, setFilteredData] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [details, setDetails] = useState<any>(null);
	const [initialLoader, setInitialLoader] = useState(true);
	const [detailsData, setDetailsData] = useState<any[]>([]);
	const [totalUser, setTotalUser] = useState(0);
	const [subscribedTotal, setSubscribedTotal] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchInput, setSearchInput] = useState('');

	const limit = 10;
	const [offset, setOffset] = useState(0);
	const [searchKey, setSearchKey] = useState('');

	const [userId, setUserId] = useState<number>();
	const [modifiedBy, setModifiedBy] = useState<number>();

	const totalPages = Math.max(1, Math.ceil(totalUser / limit));
	const displayData = searchKey ? filteredData : menuData;
	const isSearching = Boolean(searchKey.trim());

	const loadSubscribers = useCallback(async () => {
		setInitialLoader(true);
		try {
			const response = await fetch(`/api/routes/subscription?offset=${offset}&limit=${limit}`);
			if (!response.ok) {
				console.error('response was not ok');
				return;
			}
			const apidata = await response.json();
			const rows = apidata.response?.results?.result ?? [];
			setMenuData(rows);
			if (!searchKey) {
				setFilteredData(rows);
			}
			setTotalUser(apidata.response?.results?.totalUser?.total_count ?? 0);
			setSubscribedTotal(Number(apidata.response?.results?.totalUser?.subscribed_count ?? 0));
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			setInitialLoader(false);
		}
	}, [offset, limit, searchKey]);

	useEffect(() => {
		const id = localStorage.getItem('id');
		if (id) setModifiedBy(parseInt(id, 10));
	}, []);

	useEffect(() => {
		loadSubscribers();
	}, [loadSubscribers]);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		setOffset((page - 1) * limit);
	};

	const handleDetails = async (element: any) => {
		setIsLoadingDetails(true);
		setDetails(element);
		setDetailsData([]);
		openDetailsModal();
		try {
			const response = await fetch(`/api/routes/subuserdetails/${element.id}`);
			const apidata = await response.json();
			if (apidata.statusCode === 200) {
				setDetailsData(apidata.results ?? []);
			} else {
				console.error('Error fetching data:', apidata.message);
			}
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			setIsLoadingDetails(false);
		}
	};

	const handleSubscribe = (id: number) => {
		setUserId(id);
		openSubscribeModal();
	};

	const handleSearchSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const key = searchInput.trim();
		if (!key) {
			setSearchKey('');
			setFilteredData(menuData);
			setCurrentPage(1);
			setOffset(0);
			return;
		}
		setSearchKey(key);
		setLoading(true);
		setCurrentPage(1);
		setOffset(0);
		try {
			const response = await fetch(
				`/api/routes/searchuser?offset=0&limit=${limit}&searchkey=${encodeURIComponent(key)}`,
			);
			const apidata = await response.json();
			setFilteredData(apidata.results ?? []);
		} catch (error) {
			console.error('Error occurred while searching:', error);
		} finally {
			setLoading(false);
		}
	};

	const clearSearch = () => {
		setSearchInput('');
		setSearchKey('');
		setFilteredData(menuData);
		setCurrentPage(1);
		setOffset(0);
	};

	return (
		<PageContainer
			title="Kabbik Users"
			subtitle="All registered users from the users table"
			items={[{ label: 'Kabbik Users', href: '/dashboard/subscription' }]}
		>
			<Stack spacing={2} sx={{ minWidth: 0, width: '100%' }}>
				<Grid container spacing={2}>
					<Grid item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
						<StatCard
							title="Total users"
							value={totalUser}
							color="primary"
							icon={<IconUsers size={22} />}
							loading={initialLoader}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
						<StatCard
							title="Total subscribed"
							value={subscribedTotal}
							color="success"
							icon={<IconUserCheck size={22} />}
							loading={initialLoader}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
						<StatCard
							title="On this page"
							value={displayData.length}
							color="info"
							icon={<IconUsers size={22} />}
							loading={initialLoader || loading}
						/>
					</Grid>
				</Grid>

				<MainCard title="Search">
					<form onSubmit={handleSearchSubmit}>
						<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
							<TextField
								name="searchkey"
								fullWidth
								size="small"
								value={searchInput}
								onChange={e => setSearchInput(e.target.value)}
								placeholder="User id, name, email, or phone…"
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<IconSearch size={18} style={{ opacity: 0.55 }} />
										</InputAdornment>
									),
								}}
							/>
							<Stack direction="row" spacing={1} sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>
								<Button type="submit" variant="contained" size="small" sx={{ flex: { xs: 1, sm: 'none' } }}>
									Search
								</Button>
								{isSearching ? (
									<Button
										type="button"
										variant="outlined"
										size="small"
										color="inherit"
										onClick={clearSearch}
										sx={{ flex: { xs: 1, sm: 'none' } }}
									>
										Clear
									</Button>
								) : null}
							</Stack>
						</Stack>
					</form>
				</MainCard>

				{initialLoader ? (
					<Loader />
				) : loading ? (
					<Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
						<CircularProgress size={28} />
					</Box>
				) : (
					<DirectoryListCard
						title="All users"
						subtitle={isSearching ? `Search: “${searchKey}”` : undefined}
						totalCount={isSearching ? displayData.length : totalUser}
						currentPage={currentPage}
						totalPages={isSearching ? 1 : totalPages}
						onPageChange={handlePageChange}
						isEmpty={displayData.length === 0}
						emptyMessage={
							isSearching ? 'No users match this search.' : 'No users found.'
						}
					>
						<Table size="small" sx={directoryTableSx}>
							<TableHead>
								<TableRow>
									<TableCell width={72}>ID</TableCell>
									<TableCell>Login</TableCell>
									<TableCell>Phone</TableCell>
									<TableCell>Email</TableCell>
									<TableCell width={120}>Status</TableCell>
									<TableCell align="right" sx={{ width: 220, minWidth: 220 }}>
										Actions
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{displayData.map((element: any) => (
									<TableRow key={element.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
										<TableCell>
											<Typography variant="body2" fontWeight={600}>
												{element.id ?? '—'}
											</Typography>
										</TableCell>
										<TableCell>
											<Typography variant="body2" fontWeight={500}>
												{element.user_name || element.full_name || 'N/A'}
											</Typography>
											{element.full_name && element.user_name ? (
												<Typography variant="caption" color="text.secondary" display="block">
													{element.full_name}
												</Typography>
											) : null}
										</TableCell>
										<TableCell>{formatPhoneNumber(element.phone_no) || '—'}</TableCell>
										<TableCell sx={{ maxWidth: 220 }}>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ wordBreak: 'break-word' }}
											>
												{element.user_email || '—'}
											</Typography>
										</TableCell>
										<TableCell>
											<Chip
												size="small"
												variant="outlined"
												color={element.is_subscribed === 1 ? 'success' : 'default'}
												label={element.is_subscribed === 1 ? 'Subscribed' : 'Not subscribed'}
											/>
										</TableCell>
										<TableCell align="right" sx={{ width: 220, minWidth: 220, whiteSpace: 'nowrap' }}>
											<Stack
												direction="row"
												spacing={0.75}
												justifyContent="flex-end"
												alignItems="center"
												flexWrap="nowrap"
											>
												{element.is_subscribed !== 1 ? (
													<Button
														size="small"
														variant="outlined"
														color="primary"
														sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
														startIcon={<IconRepeat size={16} />}
														onClick={() => handleSubscribe(element.id)}
													>
														Subscribe
													</Button>
												) : null}
												<Button
													size="small"
													variant="text"
													sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
													startIcon={<IconEye size={16} />}
													onClick={() => handleDetails(element)}
												>
													Details
												</Button>
											</Stack>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</DirectoryListCard>
				)}

				<Dialog
					open={detailsModalOpened}
					onClose={closeDetailsModal}
					maxWidth="lg"
					fullWidth
					fullScreen={isMobileSm}
					scroll="paper"
				>
					<DialogTitle sx={{ pr: 6 }}>
						Subscription history
						<Typography variant="body2" color="text.secondary" fontWeight={400}>
							{details?.user_name || details?.full_name || 'User'} · ID {details?.id ?? '—'}
						</Typography>
					</DialogTitle>
					<IconButton
						onClick={closeDetailsModal}
						sx={{ position: 'absolute', right: 12, top: 12 }}
						aria-label="Close"
					>
						<IconX size={20} />
					</IconButton>
					<DialogContent dividers>
						<DetailGrid
							title="Profile"
							fields={[
								{ label: 'Login', value: details?.user_name },
								{ label: 'Email', value: details?.user_email },
								{ label: 'Phone', value: formatPhoneNumber(details?.phone_no) },
								{
									label: 'Joined',
									value: details?.created_at
										? moment(details.created_at).format('Do MMM YYYY, h:mm a')
										: '—',
								},
							]}
						/>
						<Typography variant="subtitle2" fontWeight={700} sx={{ mt: 3, mb: 1.5 }}>
							Payment log
						</Typography>
						{isLoadingDetails ? (
							<Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
								<CircularProgress size={28} />
							</Box>
						) : !detailsData?.length ? (
							<Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
								No subscription history found.
							</Typography>
						) : (
							<Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
								<Table size="small" sx={{ minWidth: 960, ...directoryTableSx }}>
									<TableHead>
										<TableRow>
											<TableCell>Created</TableCell>
											<TableCell>Package</TableCell>
											<TableCell>Subscribed</TableCell>
											<TableCell>Payer</TableCell>
											<TableCell>Status</TableCell>
											<TableCell>Method</TableCell>
											<TableCell>Amount</TableCell>
											<TableCell>Next payment</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{detailsData.map((row: any) => (
											<TableRow key={`${row.userId}-${row.created_at}-${row.sub_request_id}`} hover>
												<TableCell>
													{row.created_at
														? moment(row.created_at).format('DD MMM YYYY')
														: '—'}
												</TableCell>
												<TableCell>{row.name || '—'}</TableCell>
												<TableCell>{row.is_subscribed === 1 ? 'Yes' : 'No'}</TableCell>
												<TableCell>{row.payer || '—'}</TableCell>
												<TableCell>{row.payment_status || '—'}</TableCell>
												<TableCell>{row.payment_method || '—'}</TableCell>
												<TableCell>{row.amount ?? '—'}</TableCell>
												<TableCell>
													{row.nextPaymentDate
														? moment(row.nextPaymentDate).format('DD MMM YYYY')
														: '—'}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</Box>
						)}
					</DialogContent>
					<DialogActions>
						<Button onClick={closeDetailsModal}>Close</Button>
					</DialogActions>
				</Dialog>

				<Dialog
					open={subscribeModalOpened}
					onClose={closeSubscribeModal}
					maxWidth="md"
					fullWidth
					fullScreen={isMobileSm}
					scroll="paper"
				>
					<DialogTitle sx={{ pb: 0.5 }}>
						Manual subscription
						<Typography variant="body2" color="text.secondary" fontWeight={400}>
							Grant package access for a Kabbik user
						</Typography>
					</DialogTitle>
					<DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
						{userId != null && modifiedBy != null ? (
							<SubscribeForm
								userId={userId}
								modifiedBy={modifiedBy}
								onCancel={closeSubscribeModal}
								onSuccess={() => {
									closeSubscribeModal();
									void loadSubscribers();
								}}
							/>
						) : (
							<Typography variant="body2" color="text.secondary">
								Loading…
							</Typography>
						)}
					</DialogContent>
				</Dialog>
			</Stack>
		</PageContainer>
	);
}
