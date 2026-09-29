'use client';

import { Tabs, Title } from '@mantine/core';
import { useState } from 'react';
import { PNAudiobookForm } from '@/components/Form/PNAudiobookForm';
import { PNCommonForm } from '@/components/Form/PNCommonForm';
import { PNSubscriptionForm } from '@/components/Form/PNSubscriptionForm';
import ScheduleList from '@/components/Form/ScheduleList/ScheduleList';

export default function PushNotification() {
	const [activeTab, setActiveTab] = useState<string | null>('first');
	return (
		<>
			<Title order={1} style={{ marginBottom: 10 }}>
				Push Notification
			</Title>
			<Tabs value={activeTab} onChange={setActiveTab}>
				<Tabs.List mb={10}>
					<Tabs.Tab value="first">Audiobook Details</Tabs.Tab>
					{/* <Tabs.Tab value="second">Subscription</Tabs.Tab> */}
					<Tabs.Tab value="third">Common</Tabs.Tab>
					<Tabs.Tab value="fourth">Schedule List</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel value="first">
					<PNAudiobookForm />
				</Tabs.Panel>
				{/* <Tabs.Panel value="second">
					<PNSubscriptionForm />
				</Tabs.Panel> */}
				<Tabs.Panel value="third">
					<PNCommonForm />
				</Tabs.Panel>
				<Tabs.Panel value="fourth">
					<ScheduleList/>
				</Tabs.Panel>
			</Tabs>
		</>
	);
}
