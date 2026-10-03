const TIERS = [
	{ div: 1e12, suffix: 'T' },
	{ div: 1e9, suffix: 'B' },
	{ div: 1e6, suffix: 'M' },
	{ div: 1e3, suffix: 'k' },
] as const;

export function formatCompactNumber(value: number): string {
	if (!Number.isFinite(value)) return '—';

	const abs = Math.abs(value);
	const sign = value < 0 ? '-' : '';

	if (abs < 1000) {
		return sign + Math.round(abs).toLocaleString();
	}

	for (const { div, suffix } of TIERS) {
		if (abs >= div) {
			const scaled = abs / div;
			const rounded = Math.round(scaled * 10) / 10;
			const str = rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
			return sign + str + suffix;
		}
	}

	return sign + abs.toLocaleString();
}

export function isCompactNotation(value: number): boolean {
	return Number.isFinite(value) && Math.abs(value) >= 1000;
}

export function formatCompactCount(value: unknown): string {
	const n = Number(value);
	if (!Number.isFinite(n)) return '0';
	return formatCompactNumber(n);
}

export function formatCompactCurrency(amount: unknown, suffix = ' Tk'): string {
	const n = Number(amount);
	if (!Number.isFinite(n)) return `0${suffix}`;
	return `${formatCompactNumber(n)}${suffix}`;
}
