'use client';

import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
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
const TOFFEE_LOGO = 'https://kabbik-space.sgp1.digitaloceanspaces.com/1713780502718.png';

export default function SignUpReport() {
	const [loading, setLoading] = useState(true);
	const [trackUser, setTrackUser] = useState<any>([]);

	useEffect(() => {
		(async () => {
			try {
				const response = await fetch(`/api/routes/last-seven-days-sign-up`, {
					cache: 'no-store',
					method: 'POST',
				});
				const apidata = await response.json();
				setTrackUser(apidata);
			} catch {
				/* ignore */
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const week = trackUser.slice(0, 7);

	return (
		<PageContainer
			title="Sign Up Report"
			items={[{ label: 'Sign Up Report', href: '/dashboard/sign-up-report' }]}
		>
			{loading ? (
				<Loader />
			) : (
				<>
					<MainCard
						title="Overview"
						subtitle="Last 7 days sign-ups by platform"
						sx={{ mb: 3 }}
					>
						<MuiAreaChart
							h={300}
							withLegend
							data={week.map((v: any) => ({ ...v, date: moment(v.date).format('Do MMM, YYYY') }))}
							dataKey="date"
							series={[
								{ name: 'kabbikCount', color: 'indigo.6', label: 'Kabbik Count' },
								{ name: 'myBLCount', color: 'green.6', label: 'Mybl Count' },
								{ name: 'toffeeCount', color: 'red.6', label: 'Toffee Count' },
							]}
							curveType="linear"
						/>
					</MainCard>

					<MainCard title="Sign Up Report">
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
									{[
										{ logo: KABBIK_LOGO, alt: 'Kabbik', key: 'kabbikCount' },
										{ logo: BL_LOGO, alt: 'Banglalink', key: 'myBLCount' },
										{ logo: TOFFEE_LOGO, alt: 'Toffee', key: 'toffeeCount' },
									].map(row => (
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
