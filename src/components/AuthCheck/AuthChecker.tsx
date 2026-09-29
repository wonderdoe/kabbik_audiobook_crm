import { getCookie } from '@/utils/serverHelpers';
// import { useRouter } from 'next/router'
export default function AuthChecker({ children }: any) {
	const pathname = '/login'; // Hardcoded value for demonstration, replace with the actual pathname you want to check
	const cookie = getCookie('access-token');
	if (!cookie && pathname !== '/login') {
		return null;
	}

	return <>{children}</>;
}
