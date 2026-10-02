'use client';

import {
	Alert,
	Snackbar,
} from '@mui/material';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';

type NotifyOptions = {
	title?: string;
	message: string;
	color?: 'red' | 'green' | 'blue' | 'yellow';
};

type SnackbarContextValue = {
	show: (options: NotifyOptions) => void;
};

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const [payload, setPayload] = useState<NotifyOptions>({ message: '' });

	const show = useCallback((options: NotifyOptions) => {
		setPayload(options);
		setOpen(true);
	}, []);

	const value = useMemo(() => ({ show }), [show]);

	useEffect(() => {
		registerNotify(show);
		return () => registerNotify(null);
	}, [show]);

	const severity =
		payload.color === 'red'
			? 'error'
			: payload.color === 'green'
				? 'success'
				: payload.color === 'yellow'
					? 'warning'
					: 'info';

	return (
		<SnackbarContext.Provider value={value}>
			{children}
			<Snackbar
				open={open}
				autoHideDuration={4000}
				onClose={() => setOpen(false)}
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
				TransitionProps={{ timeout: 200 }}
			>
				<Alert onClose={() => setOpen(false)} severity={severity} variant="contained" sx={{ width: '100%' }}>
					{payload.title ? (
						<>
							<strong>{payload.title}</strong>
							<br />
							{payload.message}
						</>
					) : (
						payload.message
					)}
				</Alert>
			</Snackbar>
		</SnackbarContext.Provider>
	);
}

export function useSnackbar() {
	const ctx = useContext(SnackbarContext);
	if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
	return ctx;
}

let notifyHandler: ((options: NotifyOptions) => void) | null = null;

function registerNotify(handler: ((options: NotifyOptions) => void) | null) {
	notifyHandler = handler;
}

/** Drop-in for legacy notifications.show API */
export const notifications = {
	show: (options: NotifyOptions) => {
		notifyHandler?.(options);
	},
};
