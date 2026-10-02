'use client';

import {
	Box,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useMotionSafe } from '@/styles/motion';

export function PageTransition({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { pageEnter: variants, transition: t } = useMotionSafe();

	return (
		<AnimatePresence mode="wait">
			<Box
				component={motion.div}
				key={pathname}
				initial={variants.initial}
				animate={variants.animate}
				exit={variants.exit}
				transition={t}
				sx={{ minWidth: 0, maxWidth: '100%', overflowX: 'hidden' }}
			>
				{children}
			</Box>
		</AnimatePresence>
	);
}
