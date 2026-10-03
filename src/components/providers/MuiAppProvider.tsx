'use client';

import {
	CssBaseline,
	ThemeProvider,
} from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { muiTheme } from '@/styles/muiTheme';
import { SnackbarProvider } from '@/components/providers/SnackbarProvider';

dayjs.extend(localizedFormat);

export function MuiAppProvider({ children }: { children: React.ReactNode }) {
	return (
		<AppRouterCacheProvider options={{ enableCssLayer: true }}>
			<ThemeProvider theme={muiTheme}>
				<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
					<CssBaseline />
					<SnackbarProvider>{children}</SnackbarProvider>
				</LocalizationProvider>
			</ThemeProvider>
		</AppRouterCacheProvider>
	);
}
