import { NavItem } from '@/types/nav-item';

export function navGroupId(label: string): string {
	return `group:${label}`;
}

export function navChildId(groupLabel: string, childLabel: string): string {
	return `child:${groupLabel}:${childLabel}`;
}

export function partitionNavItems(items: NavItem[]): {
	topLinks: NavItem[];
	groups: NavItem[];
} {
	const topLinks: NavItem[] = [];
	const groups: NavItem[] = [];

	for (const item of items) {
		const hasChildren = Array.isArray(item.links) && item.links.length > 0;
		if (hasChildren) {
			groups.push(item);
		} else if (item.link) {
			topLinks.push(item);
		}
	}

	return { topLinks, groups };
}

export function getDefaultExpandedItems(groups: NavItem[], pathname: string): string[] {
	const ids = new Set<string>();

	for (const group of groups) {
		if (group.initiallyOpened) {
			ids.add(navGroupId(group.label));
		}
		if (group.links?.some(child => child.link === pathname)) {
			ids.add(navGroupId(group.label));
		}
	}

	return [...ids];
}

export function isGroupChildActive(group: NavItem, pathname: string): boolean {
	return Boolean(group.links?.some(child => child.link === pathname));
}
