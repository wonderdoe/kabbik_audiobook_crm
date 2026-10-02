'use client';

import { useReducedMotion } from 'framer-motion';
import { cardShadow } from './cardShadow';

export const easing = [0.4, 0, 0.2, 1] as const;

export const duration = {
	fast: 0.15,
	normal: 0.25,
	slow: 0.4,
} as const;

export const transition = {
	fast: { duration: duration.fast, ease: easing },
	normal: { duration: duration.normal, ease: easing },
	slow: { duration: duration.slow, ease: easing },
} as const;

export const pageEnter = {
	initial: { opacity: 0, y: 10 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -6 },
};

export const cardHover = {
	rest: { y: 0, boxShadow: cardShadow.rest },
	hover: { y: -1, boxShadow: cardShadow.hover },
};

export const staggerContainer = {
	animate: { transition: { staggerChildren: 0.05 } },
};

export const fadeInUp = {
	initial: { opacity: 0, y: 12 },
	animate: { opacity: 1, y: 0 },
};

export function useMotionSafe() {
	const reduce = useReducedMotion();
	return {
		reduce,
		duration: reduce ? 0 : duration.normal,
		transition: reduce ? { duration: 0 } : transition.normal,
		pageEnter: reduce
			? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
			: pageEnter,
	};
}
