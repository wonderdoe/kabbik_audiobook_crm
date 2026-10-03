'use client';

import { Box, LinearProgress, Stack, Tooltip, Typography, alpha, useTheme } from '@mui/material';
import { TableThumbnail } from '@/components/mantis/TableThumbnail';
import { StatCardValue } from '@/components/ui/StatCardValue';

type Item = { title: string; count: number; image: string };

export function PlayCountGrid({ list }: { list: Item[] }) {
	const theme = useTheme();
	const max = list.length ? Math.max(...list.map(i => Number(i.count) || 0)) : 1;
	const accentColor = theme.palette.primary.main;

	return (
		<Box
			sx={{
				display: 'flex',
				flexWrap: 'wrap',
				gap: 1.5,
			}}
		>
			{list.map(item => {
				const count = Number(item.count) || 0;
				const pct = Math.round((count / Math.max(max, 1)) * 100);

				return (
					<Box
						key={item.title}
						sx={{
							flex: '0 0 auto',
							width: { xs: 'calc(50% - 6px)', sm: 'calc(33.33% - 8px)', md: 'calc(25% - 9px)', lg: 'calc(16.66% - 10px)' },
							bgcolor: 'background.paper',
							border: `1px solid ${theme.palette.divider}`,
							borderRadius: 1,
							overflow: 'hidden',
							position: 'relative',
							transition: 'box-shadow 0.2s, transform 0.18s',
							'&:hover': {
								boxShadow: `0 4px 14px ${alpha(accentColor, 0.14)}`,
								transform: 'translateY(-2px)',
							},
							'&::before': {
								content: '""',
								position: 'absolute',
								left: 0,
								top: 0,
								bottom: 0,
								width: 4,
								background: `linear-gradient(180deg, ${accentColor}, ${alpha(accentColor, 0.4)})`,
							},
						}}
					>
						<Stack spacing={1} sx={{ pl: 2.5, pr: 2, pt: 1.75, pb: 1.75 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
								{item.image ? (
									<Box sx={{ flexShrink: 0 }}>
										<TableThumbnail src={item.image} alt={item.title} objectFit="contain" size={28} />
									</Box>
								) : null}
								<Typography
									variant="caption"
									fontWeight={700}
									textTransform="uppercase"
									letterSpacing="0.05em"
									color="text.secondary"
									lineHeight={1.3}
									noWrap
								>
									{item.title}
								</Typography>
							</Box>
							<Typography variant="h5" fontWeight={800} color="text.primary" lineHeight={1.1}>
								<StatCardValue value={count} />
							</Typography>
							<Tooltip title={`${pct}% of top`} arrow placement="top">
								<LinearProgress
									variant="determinate"
									value={pct}
									sx={{
										height: 4,
										borderRadius: 2,
										bgcolor: alpha(accentColor, 0.1),
										'& .MuiLinearProgress-bar': { bgcolor: accentColor, borderRadius: 2 },
									}}
								/>
							</Tooltip>
						</Stack>
					</Box>
				);
			})}
		</Box>
	);
}
