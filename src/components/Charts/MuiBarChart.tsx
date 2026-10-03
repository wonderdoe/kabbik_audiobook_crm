'use client';

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { isLikelyTimeSeriesKey, sortChartDataChronologically } from '@/utils/chartTimeOrder';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { chartBarAnimation } from '@/components/Charts/modernBarChartShared';

type SeriesItem = { name: string; color?: string; label?: string };

type MuiBarChartProps = {
	h?: number;
	data: Record<string, unknown>[];
	dataKey: string;
	series: SeriesItem[];
	withLegend?: boolean;
	valueFormatter?: (value: number) => string;
	/** When true, each bar in a single-series chart gets a distinct palette colour */
	multiColor?: boolean;
};

const PALETTE = [
	'#e91e8c',
	'#2196f3',
	'#4caf50',
	'#ff9800',
	'#9c27b0',
	'#00bcd4',
	'#f44336',
	'#8bc34a',
];

export function MuiBarChart({
	h = 300,
	data,
	dataKey,
	series,
	withLegend,
	valueFormatter,
	multiColor = false,
}: MuiBarChartProps) {
	const theme = useTheme();
	const chartData = useMemo(
		() => (isLikelyTimeSeriesKey(dataKey) ? sortChartDataChronologically(data, dataKey) : data),
		[data, dataKey],
	);

	return (
		<ResponsiveContainer width="100%" height={h}>
			<BarChart data={chartData} barCategoryGap="30%">
				<CartesianGrid strokeDasharray="3 3" vertical={false} />
				<XAxis dataKey={dataKey} tick={{ fontSize: 12 }} />
				<YAxis tickFormatter={valueFormatter ? v => valueFormatter(Number(v)) : undefined} tick={{ fontSize: 12 }} />
				<Tooltip
					formatter={
						valueFormatter
							? (v: number) => [valueFormatter(Number(v)), '']
							: undefined
					}
				/>
				{withLegend ? <Legend /> : null}
				{series.map((s, si) => {
					const baseColor =
						s.color === 'primary'
							? theme.palette.primary.main
							: (PALETTE[si % PALETTE.length]);
					return (
						<Bar
							key={s.name}
							dataKey={s.name}
							name={s.label ?? s.name}
							radius={[4, 4, 0, 0]}
							{...chartBarAnimation(si)}
						>
							{multiColor
								? chartData.map((_, i) => (
										<Cell key={i} fill={PALETTE[i % PALETTE.length]} />
								  ))
								: <Cell fill={baseColor} />}
						</Bar>
					);
				})}
			</BarChart>
		</ResponsiveContainer>
	);
}
