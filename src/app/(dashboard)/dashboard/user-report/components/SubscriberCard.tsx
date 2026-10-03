'use client';

import { Box, LinearProgress, Stack, Tooltip, Typography, alpha, useTheme } from '@mui/material';
import { TableThumbnail } from '@/components/mantis/TableThumbnail';
import { StatCardValue } from '@/components/ui/StatCardValue';

export type SubscriberItem = {
	title: string;
	image?: string;
	recurring?: number | string;
	is_onetime?: number | string;
	count?: number | string;
};

type SubscriberCardProps = {
	item: SubscriberItem;
	showBreakdown?: boolean;
	color?: string;
	/** optional max across sibling cards for progress bar */
	max?: number;
};

export function SubscriberCard({ item, showBreakdown = true, color, max }: SubscriberCardProps) {
	const theme = useTheme();
	const accentColor = color ?? theme.palette.primary.main;
	const recurring = Number(item.recurring ?? 0);
	const onetime = Number(item.is_onetime ?? 0);
	const total =
		item.count !== undefined ? Number(item.count) : recurring + onetime;

	const pct = max && max > 0 ? Math.round((total / max) * 100) : 0;

	return (
		<Box
			sx={{
				bgcolor: 'background.paper',
				border: `1px solid ${theme.palette.divider}`,
				borderRadius: 1,
				overflow: 'hidden',
				position: 'relative',
				minWidth: 160,
				flex: '0 0 auto',
				transition: 'box-shadow 0.2s, transform 0.18s',
				'&:hover': {
					boxShadow: `0 4px 14px ${alpha(accentColor, 0.14)}`,
					transform: 'translateY(-2px)',
				},
				'&::before': {
					content: '""',
					position: 'absolute',
					left: 0,
					top: 0,
					bottom: 0,
					width: 4,
					background: `linear-gradient(180deg, ${accentColor}, ${alpha(accentColor, 0.4)})`,
				},
			}}
		>
			<Stack spacing={1.25} sx={{ pl: 2.5, pr: 2, pt: 1.75, pb: 1.75 }}>
				{/* Logo + name */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
					{item.image ? (
						<Box sx={{ flexShrink: 0 }}>
							<TableThumbnail src={item.image} alt={item.title} objectFit="contain" size={32} />
						</Box>
					) : (
						<Box
							sx={{
								width: 32,
								height: 32,
								borderRadius: 1,
								bgcolor: alpha(accentColor, 0.12),
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Typography variant="caption" fontWeight={800} color={accentColor}>
								{item.title.charAt(0).toUpperCase()}
							</Typography>
						</Box>
					)}
					<Typography
						variant="caption"
						fontWeight={700}
						textTransform="uppercase"
						letterSpacing="0.05em"
						color="text.secondary"
						lineHeight={1.3}
						noWrap
					>
						{item.title}
					</Typography>
				</Box>

				{/* Total */}
				<Typography variant="h5" fontWeight={800} color="text.primary" lineHeight={1.1}>
					<StatCardValue value={total} />
				</Typography>

				{/* Progress bar relative to siblings */}
				{max != null && max > 0 && (
					<Tooltip title={`${pct}% of max`} arrow placement="top">
						<LinearProgress
							variant="determinate"
							value={pct}
							sx={{
								height: 4,
								borderRadius: 2,
								bgcolor: alpha(accentColor, 0.1),
								'& .MuiLinearProgress-bar': { bgcolor: accentColor, borderRadius: 2 },
							}}
						/>
					</Tooltip>
				)}

				{/* Recurring / one-time breakdown */}
				{showBreakdown && item.recurring !== undefined && (
					<Stack spacing={0.25}>
						<Typography variant="caption" color="text.secondary" lineHeight={1.4}>
							Recurring{' '}
							<Box component="span" fontWeight={700} color="text.primary">
								{Number(recurring).toLocaleString()}
							</Box>
						</Typography>
						<Typography variant="caption" color="text.secondary" lineHeight={1.4}>
							One-time{' '}
							<Box component="span" fontWeight={700} color="text.primary">
								{Number(onetime).toLocaleString()}
							</Box>
						</Typography>
					</Stack>
				)}
			</Stack>
		</Box>
	);
}
