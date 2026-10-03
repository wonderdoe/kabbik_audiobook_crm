'use client';

import { Box, Typography, alpha, useTheme } from '@mui/material';
import { useId, useMemo } from 'react';
import { isLikelyTimeSeriesKey, sortChartDataChronologically } from '@/utils/chartTimeOrder';
import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { cardShadow } from '@/styles/cardShadow';
import {
	ModernChartPanel,
	areaFillGradientStops,
	chartAreaAnimation,
	formatModernBarAxis,
	resolveSeriesColor,
	useModernBarChartTheme,
} from '@/components/Charts/modernBarChartShared';

type SeriesItem = { name: string; color?: string; label?: string };

type MuiAreaChartProps = {
	h?: number;
	data: Record<string, unknown>[];
	dataKey: string;
	series: SeriesItem[];
	curveType?: 'monotone' | 'linear' | 'natural';
	withLegend?: boolean;
	withPanel?: boolean;
	valueFormatter?: (value: number) => string;
};

function AreaChartTooltip({
	active,
	payload,
	label,
	valueFormatter,
}: TooltipProps<number, string> & { valueFormatter?: (value: number) => string }) {
	const theme = useTheme();
	if (!active || !payload?.length) return null;

	const format = (v: number) => (valueFormatter ? valueFormatter(v) : v.toLocaleString());

	return (
		<Box
			sx={{
				px: 1.75,
				py: 1.25,
				borderRadius: 1.5,
				border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
				bgcolor: 'background.paper',
				boxShadow: cardShadow.hover,
				minWidth: 140,
			}}
		>
			<Typography variant="caption" fontWeight={800} color="text.primary" display="block" sx={{ mb: 0.75 }}>
				{label}
			</Typography>
			{payload.map(entry => (
				<Box
					key={entry.dataKey}
					sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 0.25 }}
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
					<Typography variant="caption" fontWeight={700} color="primary.main">
						{format(Number(entry.value) || 0)}
					</Typography>
				</Box>
			))}
		</Box>
	);
}

export function MuiAreaChart({
	h = 300,
	data,
	dataKey,
	series,
	withLegend,
	withPanel = true,
	valueFormatter,
	curveType = 'monotone',
}: MuiAreaChartProps) {
	const theme = useTheme();
	const { tickFill, gridStroke } = useModernBarChartTheme();
	const reactId = useId().replace(/:/g, '');
	const chartData = useMemo(
		() => (isLikelyTimeSeriesKey(dataKey) ? sortChartDataChronologically(data, dataKey) : data),
		[data, dataKey],
	);
	const yTickFormatter = valueFormatter
		? (v: number) => valueFormatter(Number(v))
		: (v: number) => formatModernBarAxis(Number(v));

	const chart = (
		<ResponsiveContainer width="100%" height={h}>
			<AreaChart data={chartData} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
				<defs>
					{series.map((s, si) => {
						const stroke = resolveSeriesColor(s.color, theme, si);
						const id = `${reactId}-area-${si}`;
						return (
							<linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
								{areaFillGradientStops(stroke)}
							</linearGradient>
						);
					})}
				</defs>
				<CartesianGrid stroke={gridStroke} vertical={false} strokeDasharray="0" />
				<XAxis
					dataKey={dataKey}
					tick={{ fontSize: 11, fill: tickFill, fontWeight: 600 }}
					tickLine={false}
					axisLine={false}
					dy={10}
				/>
				<YAxis
					tick={{ fontSize: 11, fill: tickFill }}
					tickLine={false}
					axisLine={false}
					tickFormatter={yTickFormatter}
					width={valueFormatter ? 56 : 48}
				/>
				<Tooltip
					content={<AreaChartTooltip valueFormatter={valueFormatter} />}
					cursor={{ stroke: alpha(theme.palette.primary.main, 0.25), strokeWidth: 1, strokeDasharray: '4 4' }}
				/>
				{withLegend ? (
					<Legend
						verticalAlign="bottom"
						height={36}
						iconType="circle"
						wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 8 }}
					/>
				) : null}
				{series.map((s, si) => {
					const stroke = resolveSeriesColor(s.color, theme, si);
					const fillId = `${reactId}-area-${si}`;
					return (
						<Area
							key={s.name}
							type={curveType}
							dataKey={s.name}
							name={s.label ?? s.name}
							stroke={stroke}
							strokeWidth={2.5}
							fill={`url(#${fillId})`}
							fillOpacity={1}
							dot={false}
							activeDot={{
								r: 5,
								strokeWidth: 2,
								stroke: theme.palette.background.paper,
								fill: stroke,
							}}
							{...chartAreaAnimation(si)}
						/>
					);
				})}
			</AreaChart>
		</ResponsiveContainer>
	);

	if (!withPanel) return chart;
	return <ModernChartPanel>{chart}</ModernChartPanel>;
}
