'use client';

import { Dialog, type DialogProps } from '@mui/material';
import { useIsMobileSm } from '@/hooks/use-is-mobile-sm';

/** Dialog that goes fullScreen below sm breakpoint */
export function ResponsiveDialog({ fullScreen, ...props }: DialogProps) {
	const isMobileSm = useIsMobileSm();
	return <Dialog fullScreen={fullScreen ?? isMobileSm} {...props} />;
}
