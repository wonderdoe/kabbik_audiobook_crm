export type QuickAccessAudience = 'all' | 'free' | 'premium';

export const QUICK_ACCESS_AUDIENCE_OPTIONS = [
	{ value: 'all', label: 'All' },
	{ value: 'free', label: 'Free users' },
	{ value: 'premium', label: 'Premium users' },
] as const;
