import '@mantine/core/styles.css';
import 'mantine-react-table/styles.css';

import { ColorSchemeScript, DirectionProvider, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { Analytics } from '@vercel/analytics/react';
import AuthChecker from '@/components/AuthCheck/AuthChecker';
import { inter } from '@/styles/fonts';
import { theme } from '@/styles/theme';
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
				<ColorSchemeScript />
				<meta
					name="viewport"
					content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
				/>
			</head>
			<body className={inter.className} style={{ marginBottom: '50px' }}>
				<MantineProvider theme={theme}>
					<DirectionProvider>
						<ModalsProvider>
							<AppProvider>
								<AuthChecker>{children}</AuthChecker>
							</AppProvider>
							<Analytics />
						</ModalsProvider>
						<Notifications />
					</DirectionProvider>
				</MantineProvider>
			</body>
		</html>
	);
}
