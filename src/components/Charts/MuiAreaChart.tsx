'use client';

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

const MANTINE_COLOR_MAP: Record<string, string> = {
	'indigo.6': '#4c6ef5',
	'green.6': '#40c057',
	'red.6': '#fa5252',
	'blue.6': '#228be6',
	'yellow.6': '#fab005',
};

type SeriesItem = { name: string; color?: string; label?: string };

type MuiAreaChartProps = {
	h?: number;
	data: Record<string, unknown>[];
	dataKey: string;
	series: SeriesItem[];
	curveType?: string;
	withLegend?: boolean;
	valueFormatter?: (value: number) => string;
};

export function MuiAreaChart({
	h = 300,
	data,
	dataKey,
	series,
	withLegend,
	valueFormatter,
}: MuiAreaChartProps) {
	const curve = 'monotone';

	return (
		<ResponsiveContainer width="100%" height={h}>
			<AreaChart data={data}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey={dataKey} />
				<YAxis tickFormatter={valueFormatter ? v => valueFormatter(Number(v)) : undefined} />
				<Tooltip
					formatter={valueFormatter ? (v: number) => valueFormatter(Number(v)) : undefined}
				/>
				{withLegend ? <Legend /> : null}
				{series.map(s => {
					const color = MANTINE_COLOR_MAP[s.color ?? ''] ?? '#4c6ef5';
					return (
						<Area
							key={s.name}
							type={curve}
							dataKey={s.name}
							name={s.label ?? s.name}
							stroke={color}
							fill={color}
							fillOpacity={0.2}
						/>
					);
				})}
			</AreaChart>
		</ResponsiveContainer>
	);
}
