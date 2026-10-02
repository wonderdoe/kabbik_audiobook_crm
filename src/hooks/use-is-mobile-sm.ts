'use client';

import { useMediaQuery, useTheme } from '@mui/material';

/** Viewport below sm (600px) — dialogs often go fullScreen */
export function useIsMobileSm(): boolean {
	const theme = useTheme();
	return useMediaQuery(theme.breakpoints.down('sm'));
}

/** Viewport below md (900px) — matches layout drawer breakpoint */
export function useIsMobileMd(): boolean {
	const theme = useTheme();
	return useMediaQuery(theme.breakpoints.down('md'));
}
