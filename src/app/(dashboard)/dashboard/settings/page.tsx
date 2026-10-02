import { PageContainer } from '@/components/PageContainer/PageContainer';

export default function Settings() {
	return (
		<PageContainer title="Settings" items={[{ label: 'Settings', href: '/dashboard/settings' }]}>
			Settings
		</PageContainer>
	);
}
