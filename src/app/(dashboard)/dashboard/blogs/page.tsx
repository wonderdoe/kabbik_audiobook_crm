import BlogList from '@/components/Blogs/BlogList';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { getAudiobookCategories } from '@/services/services';

export default async function BlogsPage() {
	const categories = (await getAudiobookCategories()).map((item: { name: string }) => item.name) || [];
	return (
		<PageContainer
			title="Blogs"
			subtitle="Create, edit, and publish articles for the Kabbik blog"
			items={[{ label: 'Blogs', href: '/dashboard/blogs' }]}
		>
			<BlogList categories={categories} />
		</PageContainer>
	);
}
