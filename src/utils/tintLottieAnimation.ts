type LottieColor = [number, number, number, number];

const PURPLE_LOTTIE: LottieColor = [0.509804010391, 0.278430998325, 1, 1];

function hexToLottieColor(hex: string): LottieColor {
	const normalized = hex.replace('#', '');
	const r = parseInt(normalized.slice(0, 2), 16) / 255;
	const g = parseInt(normalized.slice(2, 4), 16) / 255;
	const b = parseInt(normalized.slice(4, 6), 16) / 255;
	return [r, g, b, 1];
}

function colorsMatch(a: number[], b: LottieColor, epsilon = 0.02): boolean {
	if (a.length < 3) return false;
	return (
		Math.abs(a[0] - b[0]) < epsilon &&
		Math.abs(a[1] - b[1]) < epsilon &&
		Math.abs(a[2] - b[2]) < epsilon
	);
}

function walk(node: unknown, target: LottieColor): void {
	if (!node || typeof node !== 'object') return;

	if (Array.isArray(node)) {
		for (const item of node) walk(item, target);
		return;
	}

	const record = node as Record<string, unknown>;

	if (record.ty === 'fl' || record.ty === 'st') {
		const colorProp = record.c as { a?: number; k?: number[] } | undefined;
		if (colorProp?.a === 0 && Array.isArray(colorProp.k) && colorsMatch(colorProp.k, PURPLE_LOTTIE)) {
			colorProp.k = [...target];
		}
	}

	for (const value of Object.values(record)) {
		walk(value, target);
	}
}

/** Deep-clone Lottie JSON and replace the animation's purple accent with a theme hex color. */
export function tintLottieAnimation<T>(animationData: T, hexColor: string): T {
	const clone = JSON.parse(JSON.stringify(animationData)) as T;
	walk(clone, hexToLottieColor(hexColor));
	return clone;
}
