import { PageContainer } from '@/components/PageContainer/PageContainer';
import { SponsorTable } from '@/components/Table/SponsorTable';

export default function SponsorshipRequestPage() {
	return (
		<PageContainer
			title="Sponsorship Request"
			subtitle="Inbound partnership and sponsorship inquiries from brands"
			items={[{ label: 'Sponsorship Request', href: '/dashboard/sponsorship-request' }]}
		>
			<SponsorTable />
		</PageContainer>
	);
}
