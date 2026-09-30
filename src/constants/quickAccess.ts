export type QuickAccessAudience = 'all' | 'free' | 'premium';

export const QUICK_ACCESS_GOTO_PRESETS = [
	{ value: '/rent', label: 'Rent Screen' },
	{ value: '/subscription', label: 'Subscription' },
	{ value: '/upcoming', label: 'Upcoming' },
	{ value: '/refer', label: 'Refer and Earn' },
	{ value: '/rewards', label: 'Rewards' },
	{ value: '/bookRequest', label: 'Book Request' },
	{ value: '/kabbik Reads', label: 'Kabbik Reads' },
] as const;

export const QUICK_ACCESS_GOTO_CUSTOM = '__custom__';

export const QUICK_ACCESS_AUDIENCE_OPTIONS = [
	{ value: 'all', label: 'All' },
	{ value: 'free', label: 'Free users' },
	{ value: 'premium', label: 'Premium users' },
] as const;
