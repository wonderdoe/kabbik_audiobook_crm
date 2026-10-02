'use client';

import '@mui/x-tree-view/themeAugmentation';
import { createTheme, alpha, type Shadows } from '@mui/material/styles';

function softenShadowString(shadow: string): string {
	if (!shadow || shadow === 'none') return shadow;
	return shadow.replace(/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*([\d.]+)\s*\)/g, (_, a) => {
		const n = Math.min(parseFloat(a) * 0.45, 0.1);
		return `rgba(0,0,0,${n})`;
	});
}

function softenElevationShadows(): Shadows {
	const base = createTheme().shadows;
	return base.map((s, i) => (i === 0 ? s : softenShadowString(s))) as Shadows;
}

// Kabbik brand: hot-pink → deep-purple (matches login gradient)
const primaryMain = '#e91e8c';
const primaryDark = '#4a0080';
const primaryLight = '#f06ab2';

const grey = {
	50: '#fafafa',
	100: '#f5f5f5',
	200: '#f0f0f0',
	300: '#d9d9d9',
	400: '#bfbfbf',
	500: '#8c8c8c',
	600: '#595959',
	700: '#262626',
	800: '#141414',
	900: '#000000',
};

export const muiTheme = createTheme({
	shadows: softenElevationShadows(),
	palette: {
		mode: 'light',
		primary: {
			main: primaryMain,
			dark: primaryDark,
			light: primaryLight,
			contrastText: '#fff',
		},
		secondary: {
			main: primaryDark,
			dark: '#2d004d',
			light: '#7c3acd',
			contrastText: '#fff',
		},
		success: { main: '#00a854', light: alpha('#00a854', 0.1) },
		warning: { main: '#faad14', light: alpha('#faad14', 0.1) },
		error: { main: '#ff4d4f', light: alpha('#ff4d4f', 0.1) },
		grey,
		background: {
			default: '#fafafb',
			paper: '#ffffff',
		},
		text: {
			primary: grey[700],
			secondary: grey[500],
		},
		divider: grey[200],
	},
	typography: {
		fontFamily: 'var(--font-public-sans), Public Sans, Inter, system-ui, sans-serif',
		h4: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
		h5: { fontWeight: 600, fontSize: '1rem' },
		h6: { fontWeight: 600, fontSize: '0.875rem' },
		body1: { fontSize: '0.875rem' },
		body2: { fontSize: '0.8125rem' },
		caption: { fontSize: '0.75rem' },
		button: { textTransform: 'none', fontWeight: 600 },
	},
	shape: { borderRadius: 4 },
	transitions: {
		duration: { shortest: 150, shorter: 200, short: 250, standard: 300 },
		easing: { easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)' },
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: { backgroundColor: '#fafafb' },
			},
		},
		MuiButton: {
			defaultProps: { disableElevation: true },
			styleOverrides: {
				root: { borderRadius: 4, fontWeight: 600 },
				containedPrimary: {
					backgroundColor: primaryMain,
					boxShadow: `0 2px 8px ${alpha(primaryMain, 0.24)}`,
					'&:hover': {
						backgroundColor: '#c41070',
						boxShadow: `0 4px 12px ${alpha(primaryMain, 0.32)}`,
					},
				},
			},
		},
		MuiCard: {
			defaultProps: { elevation: 0 },
			styleOverrides: {
				root: ({ theme }) => ({
					border: `1px solid ${grey[200]}`,
					borderRadius: theme.shape.borderRadius,
					boxShadow: 'none',
				}),
			},
		},
		MuiPaper: {
			defaultProps: { elevation: 0 },
			styleOverrides: {
				root: { backgroundImage: 'none' },
			},
		},
		MuiTextField: {
			defaultProps: { size: 'small', variant: 'outlined' },
		},
		MuiDrawer: {
			styleOverrides: {
				paper: {
					borderRight: `1px solid ${grey[200]}`,
					boxShadow: 'none',
					backgroundColor: grey[50],
					backgroundImage: `linear-gradient(180deg, ${alpha(primaryMain, 0.03)} 0%, ${grey[50]} 120px)`,
				},
			},
		},
		MuiTreeItem: {
			styleOverrides: {
				content: {
					borderRadius: 4,
					'&:hover': {
						backgroundColor: grey[100],
					},
				},
				groupTransition: {
					borderLeft: `1px solid ${grey[300]}`,
					marginLeft: 12,
					paddingLeft: 8,
				},
			},
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundColor: '#fff',
					color: grey[700],
					borderBottom: `1px solid ${alpha(primaryMain, 0.12)}`,
					boxShadow: `0 1px 0 ${alpha(primaryMain, 0.06)}`,
				},
			},
		},
		MuiListItemButton: {
			styleOverrides: {
				root: {
					borderRadius: 4,
					margin: '2px 8px',
					paddingTop: 6,
					paddingBottom: 6,
					'&.Mui-selected': {
						background: `linear-gradient(90deg, ${alpha(primaryMain, 0.12)} 0%, ${alpha(primaryDark, 0.08)} 100%)`,
						color: primaryMain,
						borderLeft: `3px solid ${primaryMain}`,
						paddingLeft: 'calc(8px + 3px - 3px)',
						'& .MuiListItemIcon-root': { color: primaryMain },
						'&:hover': { background: `linear-gradient(90deg, ${alpha(primaryMain, 0.16)} 0%, ${alpha(primaryDark, 0.12)} 100%)` },
					},
					'&:hover': { backgroundColor: grey[100] },
				},
			},
		},
		MuiListItemIcon: {
			styleOverrides: {
				root: { minWidth: 36, color: grey[600] },
			},
		},
		MuiChip: {
			styleOverrides: { root: { fontWeight: 500, borderRadius: 4 } },
		},
		MuiTableContainer: {
			styleOverrides: {
				root: {
					display: 'block',
					width: '100%',
					maxWidth: '100%',
					overflowX: 'auto',
					WebkitOverflowScrolling: 'touch',
				},
			},
		},
		MuiTableCell: {
			styleOverrides: {
				body: {
					'& img:not([data-table-thumb-size])': {
						width: '64px !important',
						height: '64px !important',
						maxWidth: '64px !important',
						maxHeight: '64px !important',
						objectFit: 'cover',
						borderRadius: '4px',
						display: 'block',
						border: `1px solid ${grey[200]}`,
						backgroundColor: grey[50],
					},
					'& img[data-table-thumb="contain"]': {
						objectFit: 'contain !important',
					},
					'& img[data-table-thumb-size="lg"]': {
						width: '96px !important',
						height: '128px !important',
						maxWidth: '96px !important',
						maxHeight: '128px !important',
						objectFit: 'contain !important',
					},
					'& img[data-table-thumb-size="md"]': {
						width: '96px !important',
						height: '96px !important',
						maxWidth: '96px !important',
						maxHeight: '96px !important',
					},
					'& .MuiAvatar-root': {
						width: '48px !important',
						height: '48px !important',
					},
				},
			},
		},
		MuiCheckbox: {
			styleOverrides: {
				root: {
					'&.Mui-checked': { color: primaryMain },
				},
			},
		},
		MuiSwitch: {
			styleOverrides: {
				switchBase: {
					'&.Mui-checked': {
						color: primaryMain,
						'& + .MuiSwitch-track': { backgroundColor: primaryMain },
					},
				},
			},
		},
		MuiDialog: {
			defaultProps: { transitionDuration: 200 },
			styleOverrides: {
				paper: {
					margin: 8,
					'@media (max-width:599.95px)': {
						margin: 8,
						width: 'calc(100% - 16px)',
						maxWidth: 'calc(100% - 16px)',
					},
				},
			},
		},
	},
});

export const DRAWER_WIDTH = 260;
export const DRAWER_WIDTH_MINI = 90;
export const HEADER_HEIGHT = 60;
