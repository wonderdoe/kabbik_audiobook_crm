'use client';

import {
	Box,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tabs,
	Typography,
} from '@mui/material';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import { MuiAreaChart } from '@/components/Charts/MuiAreaChart';
import { TrendValue } from '@/components/ui/TrendValue';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';

const KABBIK_LOGO = 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780521478.png';
const BL_LOGO = 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780481387.png';

type TabKey = 'playcount' | 'unique';

export default function PageCountReport() {
	const [loading, setLoading] = useState(true);
	const [allData, setAllData] = useState<any>([]);
	const [tab, setTab] = useState<TabKey>('playcount');

	useEffect(() => {
		(async () => {
			try {
				const response = await fetch(`/api/routes/play-count-report`);
				const apidata = await response.json();
				if (!response.ok) {
					setAllData([]);
					return;
				}
				const rows = Array.isArray(apidata)
					? apidata
					: Array.isArray(apidata?.payload)
						? apidata.payload
						: [];
				setAllData(rows);
			} catch {
				setAllData([]);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const week = Array.isArray(allData) ? allData.slice(0, 7) : [];

	const playRows = [
		{ logo: KABBIK_LOGO, alt: 'Kabbik', key: 'kabbik_playcount' },
		{ logo: BL_LOGO, alt: 'Banglalink', key: 'mybl_playcount' },
	];
	const uniqueRows = [
		{ logo: KABBIK_LOGO, alt: 'Kabbik', key: 'kabbik_uniquecount' },
		{ logo: BL_LOGO, alt: 'Banglalink', key: 'mybl_uniquecount' },
	];
	const activeRows = tab === 'playcount' ? playRows : uniqueRows;

	return (
		<PageContainer
			title="Play Count Report"
			items={[{ label: 'Play Count Report', href: '/dashboard/play-count-report' }]}
		>
			{loading ? (
				<Loader />
			) : (
				<>
					<MainCard title="Overview" subtitle="Last 7 days listening metrics" sx={{ mb: 3 }}>
						<MuiAreaChart
							h={300}
							withLegend
							data={week.map((v: any) => ({ ...v, date: moment(v.date).format('Do MMM, YYYY') }))}
							dataKey="date"
							series={[
								{ name: 'kabbik_playcount', color: 'indigo.6', label: 'Kabbik Playcount' },
								{ name: 'mybl_playcount', color: 'green.6', label: 'Mybl Playcount' },
								{ name: 'kabbik_uniquecount', color: 'red.6', label: 'Kabbik Uniquecount' },
								{ name: 'mybl_uniquecount', color: 'yellow.6', label: 'Mybl Uniquecount' },
							]}
							curveType="linear"
						/>
					</MainCard>

					<MainCard
						title="Daily breakdown"
						secondary={
							<Box sx={{ width: '100%', overflowX: 'auto' }}>
								<Tabs
									value={tab}
									onChange={(_, v) => setTab(v as TabKey)}
									variant="scrollable"
									scrollButtons="auto"
									allowScrollButtonsMobile
								>
									<Tab label="Play count" value="playcount" />
									<Tab label="Unique listeners" value="unique" />
								</Tabs>
							</Box>
						}
					>
						<TableContainer>
							<Table size="small">
								<TableHead>
									<TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
										<TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
											Platform
										</TableCell>
										{week.map((element: any) => (
											<TableCell key={element.date} align="center">
												<Typography variant="caption" color="text.secondary">
													{moment(element.date).format('Do MMM, YYYY')}
												</Typography>
											</TableCell>
										))}
									</TableRow>
								</TableHead>
								<TableBody>
									{activeRows.map(row => (
										<TableRow key={row.key} hover>
											<TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper' }}>
												<Box
													component="img"
													src={row.logo}
													alt={row.alt}
													sx={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 2 }}
												/>
											</TableCell>
											{week.map((element: any, index: number) => {
												const current = element[row.key] as number;
												const previous = index < 7 ? week[index + 1]?.[row.key] : undefined;
												return (
													<TableCell key={element.date} align="center">
														<TrendValue current={current} previous={previous} showTrend={index < 7} />
													</TableCell>
												);
											})}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</MainCard>
				</>
			)}
		</PageContainer>
	);
}
