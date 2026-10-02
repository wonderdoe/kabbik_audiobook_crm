import { PageContainer } from '@/components/PageContainer/PageContainer';
import { PublisherRequests } from '@/components/publisher/PublisherRequests';

export default async function Page() {
	return (
		<PageContainer
			title="Publisher Requests"
			items={[{ label: 'Publisher Requests', href: '/dashboard/publisher-requests' }]}
		>
			<PublisherRequests />
		</PageContainer>
	);
}
