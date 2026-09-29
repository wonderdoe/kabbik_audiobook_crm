import AuthLayout from './(auth)/layout';
import Login from './(auth)/login/page';

export default function Page() {
	return (
		<AuthLayout>
			<Login />
		</AuthLayout>
	);
}
