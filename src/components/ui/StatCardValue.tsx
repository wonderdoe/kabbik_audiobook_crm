'use client';

import { Tooltip } from '@mui/material';
import type { ReactNode } from 'react';
import { formatCompactNumber, isCompactNotation } from '@/utils/formatCompactNumber';

export function StatCardValue({ value }: { value: ReactNode }) {
	if (typeof value === 'number' && Number.isFinite(value)) {
		const display = formatCompactNumber(value);
		if (isCompactNotation(value)) {
			return (
				<Tooltip title={value.toLocaleString()} arrow placement="top">
					<span>{display}</span>
				</Tooltip>
			);
		}
		return <>{display}</>;
	}
	return <>{value}</>;
}
