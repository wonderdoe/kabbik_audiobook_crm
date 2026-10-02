import { PageContainer } from '@/components/PageContainer/PageContainer';
import { PaginationTable } from '@/components/Table/PaginationTable';
import { SimpleTable } from '@/components/Table/SimpleTable';
import { SponsorTable } from '@/components/Table/SponsorTable';

export default function TablePage() {
	return (
		<PageContainer
			title="Sponsorship Request"
			items={[{ label: 'Sponsorship Request', href: '/dashboard/sponsorship-request' }]}
		>
			<SponsorTable />
		</PageContainer>
	);
}
