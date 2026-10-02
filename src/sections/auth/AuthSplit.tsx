'use client';

import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type AuthSplitProps = {
	children: ReactNode;
	tagline?: string;
};

export function AuthSplit({
	children,
	tagline = 'Manage Kabbik Audiobook content, subscriptions, and reports in one place.',
}: AuthSplitProps) {
	return (
		<Box sx={{ display: 'flex', minHeight: '100vh' }}>
			{/* Left decorative panel */}
			<Box
				sx={{
					display: { xs: 'none', md: 'flex' },
					width: '46%',
					flexDirection: 'column',
					justifyContent: 'center',
					px: 7,
					background: 'linear-gradient(145deg, #4a0080 0%, #a8006e 55%, #e91e8c 100%)',
					color: '#fff',
					position: 'relative',
					overflow: 'hidden',
				}}
			>
				{/* Decorative blobs */}
				<Box sx={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(233,30,140,0.3)', filter: 'blur(60px)', pointerEvents: 'none' }} />
				<Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(74,0,128,0.4)', filter: 'blur(50px)', pointerEvents: 'none' }} />

				<Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
					<Typography
						variant="overline"
						sx={{
							color: 'rgba(255,255,255,0.55)',
							letterSpacing: '0.15em',
							fontSize: '0.7rem',
							fontWeight: 600,
						}}
					>
						Admin Dashboard
					</Typography>

					<Typography variant="h2" fontWeight={800} lineHeight={1.15} sx={{ maxWidth: 380 }}>
						Kabbik<br />CRM
					</Typography>

					<Box sx={{ width: 48, height: 4, borderRadius: 999, background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.4) 100%)', my: 1 }} />

					<Typography variant="body1" sx={{ opacity: 0.75, maxWidth: 360, lineHeight: 1.75 }}>
						{tagline}
					</Typography>

					<Stack spacing={1.5} mt={4}>
						{['Content management', 'Subscriptions & promo codes', 'Analytics & reports'].map(f => (
							<Stack key={f} direction="row" alignItems="center" spacing={1.25}>
								<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.7)', flexShrink: 0 }} />
								<Typography variant="body2" sx={{ opacity: 0.8 }}>{f}</Typography>
							</Stack>
						))}
					</Stack>
				</Stack>
			</Box>

			{/* Right form panel */}
			<Box
				sx={{
					flex: 1,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					bgcolor: 'grey.50',
					px: { xs: 2, sm: 4 },
					py: 4,
				}}
			>
				<Box sx={{ width: '100%', maxWidth: 440 }}>
					{children}
				</Box>
			</Box>
		</Box>
	);
}
