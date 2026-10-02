import { NavItem } from '@/types/nav-item';

export type NavSearchOption = {
	label: string;
	link: string;
	group?: string;
};

export function flattenNavLinks(items: NavItem[]): NavSearchOption[] {
	const options: NavSearchOption[] = [];

	for (const item of items) {
		const hasChildren = Array.isArray(item.links) && item.links.length > 0;

		if (item.link && !hasChildren) {
			options.push({ label: item.label, link: item.link });
		}

		if (hasChildren) {
			for (const child of item.links!) {
				options.push({
					label: child.label,
					link: child.link,
					group: item.label,
				});
			}
		}
	}

	return options;
}

export function formatNavSearchLabel(option: NavSearchOption): string {
	return option.group ? `${option.group} › ${option.label}` : option.label;
}

export function filterNavSearchOptions(
	options: NavSearchOption[],
	query: string,
): NavSearchOption[] {
	const q = query.trim().toLowerCase();
	if (!q) return options;

	return options.filter(opt => {
		const label = opt.label.toLowerCase();
		const group = opt.group?.toLowerCase() ?? '';
		return label.includes(q) || group.includes(q);
	});
}
