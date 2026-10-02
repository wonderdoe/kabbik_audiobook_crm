import BlogList from '@/components/Blogs/BlogList';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { getAudiobookCategories } from '@/services/services';

export default async function Page() {
	const categories = (await getAudiobookCategories()).map((item: any) => item.name) || [];
	return (
		<PageContainer title="Blogs" items={[{ label: 'Blogs', href: '/dashboard/blogs' }]}>
			<BlogList categories={categories} />
		</PageContainer>
	);
}
