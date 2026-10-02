'use client';

import { Chip } from '@mui/material';
import { IconArrowDown, IconArrowUp, IconMinus } from '@tabler/icons-react';

type TrendValueProps = {
	current: number;
	previous?: number;
	showTrend?: boolean;
};

export function TrendValue({ current, previous, showTrend = true }: TrendValueProps) {
	if (!showTrend || previous === undefined) {
		return <span>{current.toLocaleString()}</span>;
	}

	if (current > previous) {
		return (
			<Chip
				size="small"
				color="success"
				variant="outlined"
				icon={<IconArrowUp size={14} />}
				label={current.toLocaleString()}
				sx={{ fontWeight: 700 }}
			/>
		);
	}
	if (current < previous) {
		return (
			<Chip
				size="small"
				color="error"
				variant="outlined"
				icon={<IconArrowDown size={14} />}
				label={current.toLocaleString()}
				sx={{ fontWeight: 700 }}
			/>
		);
	}
	return (
		<Chip
			size="small"
			variant="outlined"
			icon={<IconMinus size={14} />}
			label={current.toLocaleString()}
			sx={{ fontWeight: 600 }}
		/>
	);
}
