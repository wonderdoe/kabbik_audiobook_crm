import type { SxProps, Theme } from '@mui/material';

/** Stack filter/toolbar rows: column on xs, row on sm+ */
export const stackInputsSx: SxProps<Theme> = {
	flexDirection: { xs: 'column', sm: 'row' },
	alignItems: { xs: 'stretch', sm: 'flex-end' },
	width: '100%',
};

/** Full width on xs, auto on sm+ */
export const fullWidthOnMobileSx: SxProps<Theme> = {
	width: { xs: '100%', sm: 'auto' },
};

/** Common filter field width */
export const filterFieldSx: SxProps<Theme> = {
	width: { xs: '100%', sm: 200 },
	minWidth: { xs: 0, sm: 160 },
};

/** Horizontal scroll for wide tables (contained; does not scroll the page) */
export const tableScrollSx: SxProps<Theme> = {
	display: 'block',
	width: '100%',
	maxWidth: '100%',
	overflowX: 'auto',
	WebkitOverflowScrolling: 'touch',
};

/** Hide table column below md */
export const hideColumnBelowMdSx: SxProps<Theme> = {
	display: { xs: 'none', md: 'table-cell' },
};

/** Hide table column below sm */
export const hideColumnBelowSmSx: SxProps<Theme> = {
	display: { xs: 'none', sm: 'table-cell' },
};

/** Dialog paper width / margin on small screens */
export const dialogPaperSx: SxProps<Theme> = {
	'& .MuiDialog-paper': {
		width: { xs: '100%', sm: 600 },
		maxWidth: { xs: '100%', sm: 600 },
		m: { xs: 1, sm: 2 },
	},
};

/** Page actions stack on mobile */
export const pageActionsStackSx: SxProps<Theme> = {
	width: { xs: '100%', sm: 'auto' },
	'& .MuiButton-root': {
		width: { xs: '100%', sm: 'auto' },
	},
};
