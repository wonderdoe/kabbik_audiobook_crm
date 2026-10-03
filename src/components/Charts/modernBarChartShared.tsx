'use client';

import { Box, alpha, useTheme } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

/** Per-bar gradients for single-series charts (top → bottom). */
export const BAR_GRADIENTS: [string, string][] = [
	['#f48fb1', '#e91e8c'],
	['#e91e8c', '#ad1457'],
	['#ce93d8', '#7b1fa2'],
	['#b39ddb', '#4a0080'],
	['#80cbc4', '#00897b'],
	['#90caf9', '#1565c0'],
	['#ffcc80', '#ef6c00'],
	['#a5d6a7', '#2e7d32'],
];

/** Stacked gateway series gradients (top → bottom). */
export const GATEWAY_SERIES_GRADIENTS: Record<string, [string, string]> = {
	onetime: ['#f48fb1', '#e91e8c'],
	recurring: ['#81c784', '#2e7d32'],
	rent: ['#ffcc80', '#ef6c00'],
};

export function formatModernBarAxis(value: number) {
	if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
	if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
	return value.toLocaleString();
}

/** Gradient panel wrapper for bar & area charts. */
export function ModernChartPanel({ children }: { children: ReactNode }) {
	const theme = useTheme();
	return (
		<Box
			sx={{
				p: { xs: 1.5, sm: 2 },
				borderRadius: 2,
				border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
				background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 45%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
			}}
		>
			{children}
		</Box>
	);
}

/** @deprecated use ModernChartPanel */
export const ModernBarChartPanel = ModernChartPanel;

/** Vertical fill under area line (top → bottom). */
export function areaFillGradientStops(stroke: string) {
	return (
		<>
			<stop offset="0%" stopColor={stroke} stopOpacity={0.38} />
			<stop offset="45%" stopColor={stroke} stopOpacity={0.14} />
			<stop offset="100%" stopColor={stroke} stopOpacity={0} />
		</>
	);
}

export function resolveSeriesColor(
	colorKey: string | undefined,
	theme: Theme,
	seriesIndex: number,
): string {
	if (colorKey === 'primary') return theme.palette.primary.main;
	if (colorKey === 'success') return theme.palette.success.main;
	if (colorKey === 'warning') return theme.palette.warning.main;
	const legacy: Record<string, string> = {
		'indigo.6': '#4c6ef5',
		'green.6': '#40c057',
		'red.6': '#fa5252',
		'blue.6': '#228be6',
		'yellow.6': '#fab005',
	};
	if (colorKey && legacy[colorKey]) return legacy[colorKey];
	return BAR_GRADIENTS[seriesIndex % BAR_GRADIENTS.length][1];
}

export function gradientStops(top: string, bottom: string) {
	return (
		<>
			<stop offset="0%" stopColor={top} stopOpacity={1} />
			<stop offset="55%" stopColor={bottom} stopOpacity={0.92} />
			<stop offset="100%" stopColor={bottom} stopOpacity={0.65} />
		</>
	);
}

export function useModernBarChartTheme() {
	const theme = useTheme();
	return {
		tickFill: theme.palette.text.secondary,
		gridStroke: alpha(theme.palette.divider, 0.9),
		cursorFill: alpha(theme.palette.primary.main, 0.06),
		theme,
	};
}

export const CHART_ANIMATION_MS = 900;

type RechartsAnimationProps = {
	isAnimationActive: boolean;
	animationDuration: number;
	animationEasing: 'ease-out';
	animationBegin: number;
};

/** Bar / column enter animation (optional stagger per series). */
export function chartBarAnimation(seriesIndex = 0): RechartsAnimationProps {
	return {
		isAnimationActive: true,
		animationDuration: CHART_ANIMATION_MS,
		animationEasing: 'ease-out',
		animationBegin: seriesIndex * 100,
	};
}

/** Area line draw animation (optional stagger per series). */
export function chartAreaAnimation(seriesIndex = 0): RechartsAnimationProps {
	return {
		isAnimationActive: true,
		animationDuration: CHART_ANIMATION_MS + 150,
		animationEasing: 'ease-out',
		animationBegin: seriesIndex * 120,
	};
}
