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
import {
	GATEWAY_SERIES_GRADIENTS,
	ModernBarChartPanel,
	chartBarAnimation,
	formatModernBarAxis,
	gradientStops,
	useModernBarChartTheme,
} from '@/components/Charts/modernBarChartShared';
import { cardShadow } from '@/styles/cardShadow';
import type { GatewayBreakdownRow } from './subscription-gateway-breakdown';

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

const CHART_ID = 'gateway-breakdown';

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
	const theme = useTheme();
	if (!active || !payload?.length) return null;
	const total = payload.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
	return (
		<Box sx={{ px: 1.75, py: 1.25, borderRadius: 1.5, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, bgcolor: 'background.paper', boxShadow: cardShadow.hover, minWidth: 160 }}>
			<Typography variant="caption" fontWeight={800} color="text.primary" display="block" sx={{ mb: 0.75 }}>{label}</Typography>
			<Stack spacing={0.5}>
				{payload.map(entry => (
					<Box key={entry.dataKey} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
							<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color }} />
							<Typography variant="caption" color="text.secondary">{entry.name}</Typography>
						</Box>
						<Typography variant="caption" fontWeight={700}>{Number(entry.value).toLocaleString()}</Typography>
					</Box>
				))}
			</Stack>
			<Box sx={{ mt: 1, pt: 0.75, borderTop: `1px solid ${alpha(theme.palette.divider, 0.8)}`, display: 'flex', justifyContent: 'space-between' }}>
				<Typography variant="caption" color="text.secondary" fontWeight={600}>Total</Typography>
				<Typography variant="caption" fontWeight={800} color="primary.main">{total.toLocaleString()} Tk</Typography>
			</Box>
		</Box>
	);
}

function ChartLegend() {
	return (
		<Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.5, gap: 1.5 }}>
			{SERIES.map(s => {
				const [top] = GATEWAY_SERIES_GRADIENTS[s.key];
				return (
					<Box key={s.key} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.35, borderRadius: 999, bgcolor: alpha(top, 0.12), border: `1px solid ${alpha(top, 0.28)}` }}>
						<Box sx={{ width: 8, height: 8, borderRadius: '50%', background: `linear-gradient(180deg, ${GATEWAY_SERIES_GRADIENTS[s.key][0]}, ${GATEWAY_SERIES_GRADIENTS[s.key][1]})` }} />
						<Typography variant="caption" fontWeight={600} color="text.secondary">{s.label}</Typography>
					</Box>
				);
			})}
		</Stack>
	);
}

export function GatewayBreakdownChart({ rows, h = 300, emptyMessage = 'No gateway data' }: GatewayBreakdownChartProps) {
	const theme = useTheme();
	const { tickFill, gridStroke, cursorFill } = useModernBarChartTheme();

	const data = rows.map(r => ({ gateway: r.name, onetime: r.onetime, recurring: r.recurring, rent: r.rent }));

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
			<ModernBarChartPanel>
				<ResponsiveContainer width="100%" height={h}>
					<BarChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 8 }} barCategoryGap="24%" barGap={2}>
						<defs>
							{(['onetime', 'recurring', 'rent'] as const).map(key => {
								const [top, bottom] = GATEWAY_SERIES_GRADIENTS[key];
								const id = `${CHART_ID}-grad-${key}`;
								return (
									<linearGradient key={key} id={id} x1="0" y1="0" x2="0" y2="1">
										{gradientStops(top, bottom)}
									</linearGradient>
								);
							})}
						</defs>
						<CartesianGrid stroke={gridStroke} vertical={false} strokeDasharray="0" />
						<XAxis dataKey="gateway" tick={{ fontSize: 11, fill: tickFill, fontWeight: 600 }} tickLine={false} axisLine={false} dy={10} />
						<YAxis tick={{ fontSize: 11, fill: tickFill }} tickLine={false} axisLine={false} tickFormatter={formatModernBarAxis} width={48} />
						<Tooltip content={<ChartTooltip />} cursor={{ fill: cursorFill, radius: 8 }} />
						<Legend content={() => null} />
						<Bar dataKey="onetime" name="One-time" stackId="revenue" fill={`url(#${CHART_ID}-grad-onetime)`} radius={[0, 0, 0, 0]} maxBarSize={52} {...chartBarAnimation(0)} />
						<Bar dataKey="recurring" name="Recurring" stackId="revenue" fill={`url(#${CHART_ID}-grad-recurring)`} radius={[0, 0, 0, 0]} maxBarSize={52} {...chartBarAnimation(1)} />
						<Bar dataKey="rent" name="Rent" stackId="revenue" fill={`url(#${CHART_ID}-grad-rent)`} radius={[10, 10, 4, 4]} maxBarSize={52} {...chartBarAnimation(2)} />
					</BarChart>
				</ResponsiveContainer>
			</ModernBarChartPanel>
			<ChartLegend />
		</Box>
	);
}
