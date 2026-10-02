'use client';

import { PageContainer } from '@/components/PageContainer/PageContainer';
import { MainCard } from '@/components/mantis/MainCard';
import { EmailNotificationForm } from '@/components/Form/EmailNotificationForm';
import { Typography } from '@mui/material';

export default function EmailNotification() {
	return (
		<PageContainer
			title="Email Notification"
			items={[{ label: 'Email Notification', href: '/dashboard/email-notification' }]}
			subtitle={
				<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
					Compose and send emails to a target user segment
				</Typography>
			}
		>
			<MainCard contentSX={{ p: 3 }}>
				<EmailNotificationForm />
			</MainCard>
		</PageContainer>
	);
}
