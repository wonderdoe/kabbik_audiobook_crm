'use client';

import { Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { NavItem } from '@/types/nav-item';
import {
	getDefaultExpandedItems,
	isGroupChildActive,
	navChildId,
	navGroupId,
} from './nav-tree-utils';
import { navRowSelectedSx } from './navRowStyles';

const treeItemSx = {
	'& .MuiTreeItem-content': {
		borderRadius: 1,
		py: 0.35,
		px: 0.5,
		my: 0.15,
		'&:hover': { bgcolor: 'action.hover' },
	},
	'& .MuiTreeItem-groupTransition': {
		ml: 1.5,
		pl: 1.5,
		borderLeft: 1,
		borderColor: 'divider',
	},
};

interface NavTreeGroupProps {
	group: NavItem;
	toggle: () => void;
}

export function NavTreeGroup({ group, toggle }: NavTreeGroupProps) {
	const pathname = usePathname();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const groupId = navGroupId(group.label);
	const childActive = isGroupChildActive(group, pathname);
	const Icon = group.icon;

	const [expandedItems, setExpandedItems] = useState<string[]>(() =>
		getDefaultExpandedItems([group], pathname),
	);

	useEffect(() => {
		const required = getDefaultExpandedItems([group], pathname);
		setExpandedItems(prev => [...new Set([...prev, ...required])]);
	}, [pathname, group]);

	const onNavigate = () => {
		if (isMobile) toggle();
	};

	return (
		<SimpleTreeView
			expandedItems={expandedItems}
			onExpandedItemsChange={(_event, itemIds) => setExpandedItems(itemIds)}
			disableSelection
			sx={{
				'& .MuiTreeItem-iconContainer': { width: 20 },
			}}
		>
			<TreeItem
				itemId={groupId}
				label={
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 1,
							width: '100%',
							fontWeight: 500,
							fontSize: 14,
							color: childActive ? 'primary.main' : 'text.primary',
							...(childActive && {
								...navRowSelectedSx(theme),
								borderLeft: 'none',
								background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 100%)`,
							}),
						}}
					>
						<Box component="span" className="nav-row-icon" sx={{ display: 'flex', color: 'inherit' }}>
							<Icon size={18} stroke={1.75} />
						</Box>
						{group.label}
					</Box>
				}
				sx={treeItemSx}
			>
				{(group.links ?? []).map(child => {
					const childId = navChildId(group.label, child.label);
					const selected = child.link === pathname;

					return (
						<TreeItem
							key={childId}
							itemId={childId}
							label={
								<Box
									component={Link}
									href={child.link}
									onClick={e => {
										e.stopPropagation();
										onNavigate();
									}}
									sx={{
										display: 'block',
										width: '100%',
										textDecoration: 'none',
										color: selected ? 'primary.main' : 'text.primary',
										fontSize: 13,
										fontWeight: selected ? 600 : 400,
										borderRadius: 1,
										py: 0.25,
										px: 0.5,
										...(selected ? navRowSelectedSx(theme) : {}),
									}}
								>
									{child.label}
								</Box>
							}
							sx={{
								'& .MuiTreeItem-iconContainer': { display: 'none' },
								'& .MuiTreeItem-content': { pl: 0.5 },
							}}
						/>
					);
				})}
			</TreeItem>
		</SimpleTreeView>
	);
}
