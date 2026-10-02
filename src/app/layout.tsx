import { Analytics } from '@vercel/analytics/react';
import AuthChecker from '@/components/AuthCheck/AuthChecker';
import { MuiAppProvider } from '@/components/providers/MuiAppProvider';
import { publicSans } from '@/styles/fonts';
import '@/globals.css';
import { AppProvider } from './provider';

export const metadata = {
	metadataBase: new URL('https://mantine-admin.vercel.app/'),
	title: { default: 'Kabbik CRM', template: '%s | Kabbik CRM' },
	description: 'A CRM Tool for Kabbik',
	keywords: [
		'Kabbik',
		'CRM',
		'Admin',
		'Template',
		'Kabbik CRM',
		'Kabbik dashboard',
		'Kabbik admin',
		'Kabbik admin panel',
	],
	authors: [
		{
			name: 'Kabbik',
			url: 'https://www.kabbik.com',
		},
	],
	creator: 'Kabbik',
	manifest: 'https://crm.kabbik.com/site.webmanifest',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en-US">
			<head>
				<meta
					name="viewport"
					content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
				/>
			</head>
			<body className={publicSans.className} style={{ margin: 0 }}>
				<MuiAppProvider>
					<AppProvider>
						<AuthChecker>{children}</AuthChecker>
					</AppProvider>
					<Analytics />
				</MuiAppProvider>
			</body>
		</html>
	);
}
