import BlogList from '@/components/Blogs/BlogList';
import { getAudiobookCategories } from '@/services/services';

export default async function Page() {
	const categories = (await getAudiobookCategories()).map((item: any) => item.name) || [];
	return <BlogList categories={categories} />;
}
