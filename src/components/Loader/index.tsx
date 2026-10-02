'use client';

import { Box, Typography, alpha, useTheme } from '@mui/material';
import { Lottie } from 'lottie-react';
import { useMemo } from 'react';
import loadingAnimation from '@/assets/lottie/loading.json';
import { tintLottieAnimation } from '@/utils/tintLottieAnimation';

export type LoaderProps = {
	/** Shown under the animation when `variant` is `app`. */
	label?: string;
	/** When false, only the Lottie (for inline page loading). Default true. */
	fullScreen?: boolean;
	/** `app` = bootstrap screen with title; `page` = minimal overlay for route/data loads. */
	variant?: 'app' | 'page';
};

export default function Loader({ label, fullScreen = true, variant = 'page' }: LoaderProps) {
	const theme = useTheme();
	const primary = theme.palette.primary.main;

	const animationData = useMemo(
		() => tintLottieAnimation(loadingAnimation, primary),
		[primary],
	);

	const lottieSize = variant === 'app' ? { xs: 112, sm: 128 } : { xs: 96, sm: 104 };

	const lottie = (
		<Box
			sx={{
				width: lottieSize,
				height: lottieSize,
				borderRadius: 3,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background:
					variant === 'app'
						? `linear-gradient(145deg, ${alpha(primary, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`
						: alpha(theme.palette.background.paper, 0.9),
				boxShadow: variant === 'app' ? `0 8px 32px ${alpha(primary, 0.12)}` : `0 4px 24px ${alpha(primary, 0.1)}`,
				border: variant === 'page' ? `1px solid ${alpha(primary, 0.12)}` : 'none',
			}}
		>
			<Lottie src={animationData} loop autoplay style={{ width: '88%', height: '88%' }} />
		</Box>
	);

	const content =
		variant === 'app' ? (
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 2,
					textAlign: 'center',
					px: 2,
				}}
			>
				{lottie}
				<Box>
					<Typography variant="subtitle1" fontWeight={600} color="text.primary">
						{label ?? 'Kabbik CRM'}
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
						Loading your workspace
					</Typography>
				</Box>
			</Box>
		) : (
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
				{lottie}
				{label ? (
					<Typography variant="body2" color="text.secondary" fontWeight={500}>
						{label}
					</Typography>
				) : null}
			</Box>
		);

	if (!fullScreen) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }} role="status" aria-live="polite">
				{content}
			</Box>
		);
	}

	return (
		<Box
			role="status"
			aria-live="polite"
			aria-busy="true"
			sx={{
				position: 'fixed',
				inset: 0,
				zIndex: theme.zIndex.modal + 2,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				bgcolor: alpha(theme.palette.background.default, 0.72),
				backdropFilter: 'blur(8px)',
			}}
		>
			{content}
		</Box>
	);
}
