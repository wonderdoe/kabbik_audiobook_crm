'use client';

import {
	Breadcrumbs,
	Link,
	Typography,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NextLink from 'next/link';

export type BreadcrumbItem = { title: string; href?: string };

export function MantisBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
	return (
		<Breadcrumbs
			separator={<NavigateNextIcon fontSize="small" sx={{ fontSize: 14 }} />}
			aria-label="breadcrumb"
			sx={{ '& .MuiBreadcrumbs-li': { typography: 'body2' } }}
		>
			<Link
				component={NextLink}
				href="/dashboard"
				underline="hover"
				color="text.secondary"
				sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
			>
				<HomeOutlinedIcon sx={{ fontSize: 16 }} />
			</Link>
			{items.map((item, i) => {
				const isLast = i === items.length - 1;
				if (isLast || !item.href) {
					return (
						<Typography key={item.title} color="text.primary" fontWeight={500} variant="body2">
							{item.title}
						</Typography>
					);
				}
				return (
					<Link key={item.title} component={NextLink} href={item.href} underline="hover" color="text.secondary" variant="body2">
						{item.title}
					</Link>
				);
			})}
		</Breadcrumbs>
	);
}
