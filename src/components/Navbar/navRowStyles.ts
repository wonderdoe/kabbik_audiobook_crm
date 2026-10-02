import { alpha, Theme } from '@mui/material/styles';
import { SxProps } from '@mui/material';

export function navRowSelectedSx(theme: Theme): SxProps<Theme> {
	const primaryMain = theme.palette.primary.main;
	const primaryDark = theme.palette.secondary.main;

	return {
		background: `linear-gradient(90deg, ${alpha(primaryMain, 0.12)} 0%, ${alpha(primaryDark, 0.08)} 100%)`,
		color: primaryMain,
		borderLeft: `3px solid ${primaryMain}`,
		'& .MuiListItemIcon-root, & .nav-row-icon': {
			color: primaryMain,
		},
	};
}

/** Shared 40×40 icon control for collapsed sidebar rail */
export function navMiniIconSx(active: boolean): SxProps<Theme> {
	return theme => ({
		width: 40,
		height: 40,
		borderRadius: 2,
		flexShrink: 0,
		...(active
			? {
					color: theme.palette.primary.main,
					backgroundColor: alpha(theme.palette.primary.main, 0.12),
					'&:hover': {
						backgroundColor: alpha(theme.palette.primary.main, 0.18),
					},
				}
			: {
					color: theme.palette.text.secondary,
					'&:hover': {
						backgroundColor: theme.palette.action.hover,
						color: theme.palette.text.primary,
					},
				}),
	});
}

export const navMiniRailSx: SxProps<Theme> = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: 0.5,
	width: '100%',
	py: 0.5,
	px: 0.5,
};

export const navMiniItemWrapSx: SxProps<Theme> = {
	display: 'flex',
	justifyContent: 'center',
	width: '100%',
};
