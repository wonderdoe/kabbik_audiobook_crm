'use client';

import { Card, Chip, Stack, Typography } from '@mui/material';
import { TableThumbnail } from '@/components/mantis/TableThumbnail';

export type SubscriberItem = {
	title: string;
	image?: string;
	recurring?: number | string;
	is_onetime?: number | string;
	count?: number | string;
};

type SubscriberCardProps = {
	item: SubscriberItem;
	showBreakdown?: boolean;
};

export function SubscriberCard({ item, showBreakdown = true }: SubscriberCardProps) {
	const total =
		item.count !== undefined
			? Number(item.count)
			: Number(item.recurring ?? 0) + Number(item.is_onetime ?? 0);

	return (
		<Card
			variant="outlined"
			sx={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'column',
				minHeight: showBreakdown ? 190 : 150,
				p: 1.5,
				borderRadius: 2,
				transition: 'box-shadow 0.2s',
				'&:hover': { boxShadow: 2 },
			}}
		>
			<Stack alignItems="center" spacing={0.75}>
				{item.image ? (
					<TableThumbnail src={item.image} alt={item.title} objectFit="contain" size={48} />
				) : null}
				<Typography variant="caption" color="text.secondary" textAlign="center" textTransform="uppercase" fontWeight={600}>
					{item.title}
				</Typography>
				<Chip label={total.toLocaleString()} color="secondary" size="small" sx={{ fontWeight: 700 }} />
				{showBreakdown && item.recurring !== undefined ? (
					<>
						<Typography variant="caption" color="text.secondary" textAlign="center">
							Recurring ({item.recurring})
						</Typography>
						<Typography variant="caption" color="text.secondary" textAlign="center">
							One time ({item.is_onetime})
						</Typography>
					</>
				) : null}
			</Stack>
		</Card>
	);
}
