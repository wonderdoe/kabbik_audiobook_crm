'use client';

import { FC, ReactNode, useMemo } from 'react';
import { PageHeader } from '@/components/mantis/PageHeader';
import type { BreadcrumbItem } from '@/components/mantis/Breadcrumbs';
import { useRegisterPageMeta } from '@/contexts/PageMetaContext';

type PageContainerProps = {
	children: ReactNode;
	title: string;
	items?: { label: string; href: string }[];
	actions?: ReactNode;
	subtitle?: ReactNode;
	fluid?: boolean;
};

export const PageContainer: FC<PageContainerProps> = ({ children, title, items, actions, subtitle }) => {
	const breadcrumbs: BreadcrumbItem[] = useMemo(
		() => (items ?? []).map(i => ({ title: i.label, href: i.href })),
		[items],
	);

	useRegisterPageMeta(breadcrumbs, title);

	return (
		<>
			<PageHeader title={title} actions={actions} subtitle={subtitle} />
			{children}
		</>
	);
};
