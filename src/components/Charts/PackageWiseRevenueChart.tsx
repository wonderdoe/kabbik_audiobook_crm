'use client';

import { Box, Typography, alpha, useTheme } from '@mui/material';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { cardShadow } from '@/styles/cardShadow';
import {
	BAR_GRADIENTS,
	ModernBarChartPanel,
	chartBarAnimation,
	formatModernBarAxis,
	gradientStops,
	useModernBarChartTheme,
} from '@/components/Charts/modernBarChartShared';

export type PackageWiseChartRow = {
	name: string;
	Amount: number;
	fullName?: string;
};

type PackageWiseRevenueChartProps = {
	data: PackageWiseChartRow[];
	h?: number;
};

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
	const theme = useTheme();
	if (!active || !payload?.length) return null;

	const row = payload[0]?.payload as PackageWiseChartRow | undefined;
	const title = row?.fullName ?? label;
	const value = Number(payload[0]?.value) || 0;

	return (
		<Box
			sx={{
				px: 1.75,
				py: 1.25,
				borderRadius: 1.5,
				border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
				bgcolor: 'background.paper',
				boxShadow: cardShadow.hover,
				minWidth: 160,
			}}
		>
			<Typography variant="caption" fontWeight={800} color="text.primary" display="block" sx={{ mb: 0.5 }}>
				{title}
			</Typography>
			<Typography variant="body2" fontWeight={800} color="primary.main">
				{value.toLocaleString()} Tk
			</Typography>
		</Box>
	);
}

export function PackageWiseRevenueChart({ data, h = 300 }: PackageWiseRevenueChartProps) {
	const { tickFill, gridStroke, cursorFill } = useModernBarChartTheme();
	const chartId = 'pkg-wise';

	return (
		<ModernBarChartPanel>
			<ResponsiveContainer width="100%" height={h}>
				<BarChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 8 }} barCategoryGap="28%">
					<defs>
						{data.map((_, i) => {
							const [top, bottom] = BAR_GRADIENTS[i % BAR_GRADIENTS.length];
							const id = `${chartId}-grad-${i}`;
							return (
								<linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
									{gradientStops(top, bottom)}
								</linearGradient>
							);
						})}
					</defs>
					<CartesianGrid stroke={gridStroke} vertical={false} strokeDasharray="0" />
					<XAxis
						dataKey="name"
						tick={{ fontSize: 11, fill: tickFill, fontWeight: 600 }}
						tickLine={false}
						axisLine={false}
						interval={0}
						dy={10}
					/>
					<YAxis
						tick={{ fontSize: 11, fill: tickFill }}
						tickLine={false}
						axisLine={false}
						tickFormatter={formatModernBarAxis}
						width={48}
					/>
					<Tooltip content={<ChartTooltip />} cursor={{ fill: cursorFill, radius: 8 }} />
					<Bar
						dataKey="Amount"
						name="Revenue"
						radius={[10, 10, 4, 4]}
						maxBarSize={48}
						{...chartBarAnimation(0)}
					>
						{data.map((_, i) => (
							<Cell key={i} fill={`url(#${chartId}-grad-${i})`} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</ModernBarChartPanel>
	);
}
