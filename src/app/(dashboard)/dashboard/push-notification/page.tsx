'use client';

import {
	Box,
	FormControlLabel,
	Stack,
	Switch,
	Tab,
	Tabs,
	Typography,
} from '@mui/material';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import { useState } from 'react';
import { PNAudiobookForm } from '@/components/Form/PNAudiobookForm';
import { PNCommonForm } from '@/components/Form/PNCommonForm';
import ScheduleList from '@/components/Form/ScheduleList/ScheduleList';

const TAB_ITEMS = [
	{ value: 'first', label: 'Audiobook Details' },
	{ value: 'third', label: 'Common' },
	{ value: 'fourth', label: 'Schedule List' },
];

export default function PushNotification() {
	const [activeTab, setActiveTab] = useState('first');
	return (
		<PageContainer
			title="Push Notification"
			items={[{ label: 'Push Notification', href: '/dashboard/push-notification' }]}
			subtitle={
				<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
					Send or schedule push notifications to app users
				</Typography>
			}
		>
			<MainCard contentSX={{ p: 0 }}>
				<Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 1 }}>
					<Tabs
						value={activeTab}
						onChange={(_, v) => setActiveTab(v)}
						sx={{
							minHeight: 44,
							'& .MuiTab-root': { minHeight: 44, py: 0, fontWeight: 600, fontSize: '0.8125rem' },
						}}
					>
						{TAB_ITEMS.map(t => (
							<Tab key={t.value} label={t.label} value={t.value} />
						))}
					</Tabs>
				</Box>

				<Box sx={{ p: 3 }}>
					<Box hidden={activeTab !== 'first'}>
						<PNAudiobookForm />
					</Box>
					<Box hidden={activeTab !== 'third'}>
						<PNCommonForm />
					</Box>
					<Box hidden={activeTab !== 'fourth'}>
						<ScheduleList />
					</Box>
				</Box>
			</MainCard>
		</PageContainer>
	);
}
