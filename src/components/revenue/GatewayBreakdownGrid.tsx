'use client';

import { Box, Chip, Stack, Tooltip, Typography, alpha, useTheme } from '@mui/material';
import { IconCoin, IconMoodEmpty, IconRepeat, IconShoppingCart } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import type { GatewayBreakdownRow } from './subscription-gateway-breakdown';

function GatewayCard({
	name,
	onetime,
	recurring,
	rent,
	pct,
}: {
	name: string;
	onetime: number;
	recurring: number;
	rent: number;
	pct: number;
}) {
	const theme = useTheme();
	const main = theme.palette.primary.main;
	const total = onetime + recurring + rent;
	return (
		<Box
			sx={{
				p: 2,
				borderRadius: 1,
				border: `1px solid ${theme.palette.divider}`,
				bgcolor: 'background.paper',
				flex: '1 1 160px',
				minWidth: 150,
			}}
		>
			<Stack spacing={1.25}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
					<Typography
						variant="caption"
						fontWeight={700}
						textTransform="uppercase"
						letterSpacing="0.06em"
						color="text.secondary"
						noWrap
					>
						{name}
					</Typography>
					<Chip label={total} size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.72rem' }} />
				</Box>
				<Box sx={{ height: 4, borderRadius: 1, bgcolor: alpha(main, 0.1) }}>
					<Box
						component={motion.div}
						initial={{ width: 0 }}
						animate={{ width: `${pct}%` }}
						transition={{ duration: 0.5, ease: 'easeOut' }}
						sx={{ height: '100%', borderRadius: 1, bgcolor: main }}
					/>
				</Box>
				<Stack direction="row" spacing={1} justifyContent="space-between">
					{[
						{ icon: <IconShoppingCart size={12} stroke={1.5} />, label: 'One-time', val: onetime },
						{ icon: <IconRepeat size={12} stroke={1.5} />, label: 'Recurring', val: recurring },
						{ icon: <IconCoin size={12} stroke={1.5} />, label: 'Rent', val: rent },
					].map(({ icon, label, val }) => (
						<Tooltip key={label} title={label}>
							<Stack alignItems="center" spacing={0.25}>
								<Box sx={{ color: 'text.disabled' }}>{icon}</Box>
								<Typography variant="caption" fontWeight={700}>{val}</Typography>
							</Stack>
						</Tooltip>
					))}
				</Stack>
			</Stack>
		</Box>
	);
}

type GatewayBreakdownGridProps = {
	rows: GatewayBreakdownRow[];
	emptyMessage?: string;
};

export function GatewayBreakdownGrid({ rows, emptyMessage = 'No gateway data' }: GatewayBreakdownGridProps) {
	const theme = useTheme();
	const maxVal = Math.max(...rows.map(b => b.onetime + b.recurring + b.rent), 1);

	if (rows.length === 0) {
		return (
			<Box sx={{ py: 4, textAlign: 'center' }}>
				<IconMoodEmpty size={28} stroke={1.5} style={{ color: theme.palette.text.disabled, marginBottom: 6 }} />
				<Typography variant="body2" color="text.disabled">{emptyMessage}</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
			{rows.map(({ name, onetime, recurring, rent }) => (
				<GatewayCard
					key={name}
					name={name}
					onetime={onetime}
					recurring={recurring}
					rent={rent}
					pct={Math.round(((onetime + recurring + rent) / maxVal) * 100)}
				/>
			))}
		</Box>
	);
}
