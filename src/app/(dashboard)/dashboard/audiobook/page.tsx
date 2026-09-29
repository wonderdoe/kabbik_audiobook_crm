import { cookies } from 'next/headers';
import AudiobookViews from '@/views/AudioBookViews';

export default function AudioBook() {
	const cookieStore = cookies();
	const token = cookieStore.get('access-token');
	return (
		<>
			<AudiobookViews cookie={token} />
		</>
	);
}
