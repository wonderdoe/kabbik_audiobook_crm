'use client';

import { TableContainer, type TableContainerProps } from '@mui/material';
import { tableScrollSx } from '@/helper/responsive-sx';

type Props = TableContainerProps;

/** Table wrapper with horizontal scroll on narrow viewports */
export function ResponsiveTableContainer({ sx, ...props }: Props) {
	return <TableContainer sx={{ ...tableScrollSx, ...sx }} {...props} />;
}
