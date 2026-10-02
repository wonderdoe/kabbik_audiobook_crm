export const GATEWAYS = [
	'Bkash',
	'Nagad',
	'Upay',
	'Robi',
	'GP',
	'BL',
	'ApplePay',
	'GooglePay',
	'Stripe',
	'Aamarpay',
] as const;

const GW_KEYS: Record<string, [string, string, string]> = {
	Bkash: ['Bkash-onetime0', 'Bkash-recurring0', 'bkash-onetime1'],
	Nagad: ['NAGAD-onetime0', 'NAGAD-recurring0', 'nagad-onetime1'],
	Upay: ['UPAY-onetime0', 'UPAY-recurring0', 'upay-onetime1'],
	Robi: ['ROBI-onetime0', 'ROBI-recurring0', 'robi-onetime1'],
	GP: ['GP-onetime0', 'GP-recurring0', 'gp-onetime1'],
	BL: ['BL-onetime0', 'BL-recurring0', 'BL-onetime1'],
	ApplePay: ['APP_STORE-onetime0', 'APP_STORE-recurring0', 'app_store-onetime1'],
	GooglePay: ['PLAY_STORE-onetime0', 'PLAY_STORE-recurring0', 'play_store-onetime1'],
	Stripe: ['STRIPE-onetime0', 'STRIPE-recurring0', 'stripe-onetime1'],
	Aamarpay: ['AAMARPAY-onetime0', 'AAMARPAY-recurring0', 'aamarpay-onetime1'],
};

export type GatewayBreakdownRow = {
	name: string;
	onetime: number;
	recurring: number;
	rent: number;
};

export type NestedRevenueEntry = [string, number];

export function getBreakdown(list: NestedRevenueEntry[]): GatewayBreakdownRow[] {
	return GATEWAYS.map(name => {
		const [k0, k1, k2] = GW_KEYS[name];
		const f = (k: string) =>
			list.find(i => i[0]?.toLowerCase() === k.toLowerCase())?.[1] ?? 0;
		return { name, onetime: f(k0), recurring: f(k1), rent: f(k2) };
	}).filter(g => g.onetime + g.recurring + g.rent > 0);
}

export function breakdownDayTotal(rows: GatewayBreakdownRow[]): number {
	return rows.reduce((acc, g) => acc + g.onetime + g.recurring + g.rent, 0);
}
