import { SimpleForm } from '@/components/Form/SimpleForm';
import { PageContainer } from '@/components/PageContainer/PageContainer';

export default function Form() {
	return (
		<PageContainer title="Forms" items={[{ label: 'Forms', href: '/dashboard/form' }]}>
			<SimpleForm />
		</PageContainer>
	);
}
