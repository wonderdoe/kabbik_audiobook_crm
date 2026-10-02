'use client';

import { Box, Stack, Typography, alpha, useTheme } from '@mui/material';
import { IconMoodEmpty } from '@tabler/icons-react';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type { GatewayBreakdownRow } from './subscription-gateway-breakdown';
import { cardShadow } from '@/styles/cardShadow';

type GatewayBreakdownChartProps = {
	rows: GatewayBreakdownRow[];
	h?: number;
	emptyMessage?: string;
};

const SERIES = [
	{ key: 'onetime', label: 'One-time', colorKey: 'primary' as const },
	{ key: 'recurring', label: 'Recurring', colorKey: 'success' as const },
	{ key: 'rent', label: 'Rent', colorKey: 'warning' as const },
];

function formatAxis(value: number) {
	if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
	if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
	return value.toLocaleString();
}

function ChartTooltip({
	active,
	payload,
	label,
}: TooltipProps<number, string>) {
	const theme = useTheme();
	if (!active || !payload?.length) return null;

	const total = payload.reduce((sum, p) => sum + (Number(p.value) || 0), 0);

	return (
		<Box
			sx={{
				px: 1.75,
				py: 1.25,
				borderRadius: 1,
				border: `1px solid ${theme.palette.divider}`,
				bgcolor: 'background.paper',
				boxShadow: cardShadow.hover,
				minWidth: 140,
			}}
		>
			<Typography variant="caption" fontWeight={800} color="text.primary" display="block" sx={{ mb: 0.75 }}>
				{label}
			</Typography>
			<Stack spacing={0.5}>
				{payload.map(entry => (
					<Box
						key={entry.dataKey}
						sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
					>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
							<Box
								sx={{
									width: 8,
									height: 8,
									borderRadius: '50%',
									bgcolor: entry.color,
								}}
							/>
							<Typography variant="caption" color="text.secondary">{entry.name}</Typography>
						</Box>
						<Typography variant="caption" fontWeight={700}>
							{Number(entry.value).toLocaleString()}
						</Typography>
					</Box>
				))}
			</Stack>
			<Box
				sx={{
					mt: 1,
					pt: 0.75,
					borderTop: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
					display: 'flex',
					justifyContent: 'space-between',
				}}
			>
				<Typography variant="caption" color="text.secondary" fontWeight={600}>Total</Typography>
				<Typography variant="caption" fontWeight={800} color="primary.main">
					{total.toLocaleString()}
				</Typography>
			</Box>
		</Box>
	);
}

function ChartLegend() {
	const theme = useTheme();
	return (
		<Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.5, gap: 1.5 }}>
			{SERIES.map(s => {
				const color = theme.palette[s.colorKey].main;
				return (
					<Box
						key={s.key}
						sx={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 0.75,
							px: 1.25,
							py: 0.35,
							borderRadius: 999,
							bgcolor: alpha(color, 0.08),
							border: `1px solid ${alpha(color, 0.2)}`,
						}}
					>
						<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
						<Typography variant="caption" fontWeight={600} color="text.secondary">
							{s.label}
						</Typography>
					</Box>
				);
			})}
		</Stack>
	);
}

export function GatewayBreakdownChart({
	rows,
	h = 300,
	emptyMessage = 'No gateway data',
}: GatewayBreakdownChartProps) {
	const theme = useTheme();
	const gridStroke = alpha(theme.palette.text.primary, 0.08);
	const tickFill = theme.palette.text.secondary;

	const colors = {
		onetime: theme.palette.primary.main,
		recurring: theme.palette.success.main,
		rent: theme.palette.warning.main,
	};

	const data = rows.map(r => ({
		gateway: r.name,
		onetime: r.onetime,
		recurring: r.recurring,
		rent: r.rent,
	}));

	if (data.length === 0) {
		return (
			<Box sx={{ py: 4, textAlign: 'center' }}>
				<IconMoodEmpty size={28} stroke={1.5} style={{ color: theme.palette.text.disabled, marginBottom: 6 }} />
				<Typography variant="body2" color="text.disabled">{emptyMessage}</Typography>
			</Box>
		);
	}

	return (
		<Box>
			<ResponsiveContainer width="100%" height={h}>
				<BarChart
					data={data}
					margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
					barCategoryGap="22%"
					barGap={2}
				>
					<defs>
						{(['onetime', 'recurring', 'rent'] as const).map(key => (
							<linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor={colors[key]} stopOpacity={0.95} />
								<stop offset="100%" stopColor={colors[key]} stopOpacity={0.72} />
							</linearGradient>
						))}
					</defs>
					<CartesianGrid stroke={gridStroke} vertical={false} strokeDasharray="0" />
					<XAxis
						dataKey="gateway"
						tick={{ fontSize: 12, fill: tickFill, fontWeight: 600 }}
						tickLine={false}
						axisLine={false}
						dy={8}
					/>
					<YAxis
						tick={{ fontSize: 11, fill: tickFill }}
						tickLine={false}
						axisLine={false}
						tickFormatter={formatAxis}
						width={44}
					/>
					<Tooltip content={<ChartTooltip />} cursor={{ fill: alpha(theme.palette.primary.main, 0.04) }} />
					<Legend content={() => null} />
					<Bar
						dataKey="onetime"
						name="One-time"
						stackId="revenue"
						fill="url(#grad-onetime)"
						radius={[0, 0, 0, 0]}
						maxBarSize={56}
						isAnimationActive
						animationDuration={600}
					/>
					<Bar
						dataKey="recurring"
						name="Recurring"
						stackId="revenue"
						fill="url(#grad-recurring)"
						radius={[0, 0, 0, 0]}
						maxBarSize={56}
						isAnimationActive
						animationDuration={600}
					/>
					<Bar
						dataKey="rent"
						name="Rent"
						stackId="revenue"
						fill="url(#grad-rent)"
						radius={[6, 6, 0, 0]}
						maxBarSize={56}
						isAnimationActive
						animationDuration={600}
					/>
				</BarChart>
			</ResponsiveContainer>
			<ChartLegend />
		</Box>
	);
}
