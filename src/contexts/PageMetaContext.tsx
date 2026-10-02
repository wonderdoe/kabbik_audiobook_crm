'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { BreadcrumbItem } from '@/components/mantis/Breadcrumbs';

type PageMeta = {
	breadcrumbs: BreadcrumbItem[];
	title?: string;
};

type PageMetaContextValue = {
	meta: PageMeta;
	setMeta: (meta: PageMeta) => void;
};

const PageMetaContext = createContext<PageMetaContextValue | null>(null);

export function PageMetaProvider({ children }: { children: ReactNode }) {
	const [meta, setMeta] = useState<PageMeta>({ breadcrumbs: [] });
	const value = useMemo(() => ({ meta, setMeta }), [meta]);
	return <PageMetaContext.Provider value={value}>{children}</PageMetaContext.Provider>;
}

export function usePageMeta() {
	const ctx = useContext(PageMetaContext);
	if (!ctx) throw new Error('usePageMeta requires PageMetaProvider');
	return ctx;
}

export function useRegisterPageMeta(breadcrumbs: BreadcrumbItem[], title?: string) {
	const { setMeta } = usePageMeta();
	useEffect(() => {
		setMeta({ breadcrumbs, title });
		return () => setMeta({ breadcrumbs: [] });
	}, [breadcrumbs, title, setMeta]);
}
