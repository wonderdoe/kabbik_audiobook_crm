import { EmailNotificationForm } from '@/components/Form/EmailNotificationForm';
import { Paper, Title } from '@mantine/core';

export default function EmailNotification() {
	return (
		<>
			<Title order={1} style={{ marginBottom: '20px' }}>
				Email Notification
			</Title>
			<Paper shadow="xs" p="lg">
				<EmailNotificationForm />
			</Paper>
		</>
	);
}
