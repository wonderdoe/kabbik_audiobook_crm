'use client';

import moment from 'moment';
import { useEffect, useState } from 'react';
import { DashboardContent } from '@/components/Dashboard/DashboardContent';
import Loader from '@/components/Loader';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { getTopMostUsedPromoList, getTotalReceivedPayment } from '@/services/services';
import TopListners from '@/components/Dashboard/TopListners';
import { checkgetPermission } from '@/helper/Commonfunction';

export default function Dashboard() {
	const [loading, setLoading] = useState(true);
	const [res, setRes] = useState([]);
	const [recentTotalPayments, setRecentTotalPayments] = useState<any>([]);
	const [topMostUsedPromos, setTopMostUsedPromos] = useState({
		yesterday: [],
		today: [],
	});
	useEffect(() => {
		const getData = async () => {
			const date = moment().format('YYYY-MM-DD');
			const response = await fetch(`api/routes/total-user?date=${date}`, { cache: 'no-store' });
			if (!response.ok) {
				throw new Error(`Fetch failed. Status: ${response.status}`);
			}
			const result = await response.json();
			setRes(result);

			let recentTotalPayments = [];
			for (let i = 0; i < 7; i++) {
				const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
				const totalPayment = await getTotalReceivedPayment(date);
				recentTotalPayments.push({
					date: moment(date).format('Do MMM, YYYY'),
					Amount: totalPayment[0].total,
				});
			}
			setRecentTotalPayments(recentTotalPayments);

			const todayMostUsedPromos = await getTopMostUsedPromoList(moment().format('YYYY-MM-DD'));
			const yesterdayMostUsedPromos = await getTopMostUsedPromoList(
				moment().subtract(1, 'days').format('YYYY-MM-DD'),
			);

			setTopMostUsedPromos({
				today: todayMostUsedPromos,
				yesterday: yesterdayMostUsedPromos,
			});
			setLoading(false);
		};
		getData();
	}, []);

	return (
		<>
			<PageContainer title="Dashboard">
				{!loading ? (
					<>
					{console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwww")}

						{checkgetPermission('dashboard') && (
							<DashboardContent
							dashboardData={res}
							recentTotalPayments={recentTotalPayments}
							topMostUsedPromos={topMostUsedPromos}
						/>
						)}
						{/* {checkgetPermission('top_listners') && <TopListners />} */}
					</>
				) : (
					<Loader />
				)}
			</PageContainer>
		</>
	);
}
