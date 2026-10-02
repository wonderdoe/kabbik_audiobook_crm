import { PageContainer } from '@/components/PageContainer/PageContainer';

export default async function Page() {
	return (
		<PageContainer title="Recording" items={[{ label: 'Recording', href: '/dashboard/recording' }]}>
			<div style={{ textAlign: 'center', marginTop: '200px' }}>No content yet</div>
		</PageContainer>
	);
}
