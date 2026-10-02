'use client';

import {
	Avatar,
	Box,
	Card,
	CardContent,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Typography,
} from '@mui/material';
import { IconCircleCheck } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { fadeInUp, transition } from '@/styles/motion';

export function WelcomeCard() {
	return (
		<Card
			component={motion.div}
			initial={fadeInUp.initial}
			animate={fadeInUp.animate}
			transition={transition.normal}
			whileHover={{ y: -2 }}
			sx={{ borderRadius: 2 }}
		>
			<CardContent>
				<Typography variant="subtitle1" fontWeight={600}>
					Welcome back!
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Kabbik Audiobook CRM
				</Typography>
				<Box sx={{ height: 8 }} />
				<List dense disablePadding>
					{['Manage catalog and contributors', 'Track subscriptions and reports', 'Publish notifications safely'].map(
						text => (
							<ListItem key={text} disableGutters>
								<ListItemAvatar sx={{ minWidth: 36 }}>
									<Avatar sx={{ width: 28, height: 28, bgcolor: 'success.light' }}>
										<IconCircleCheck size={14} />
									</Avatar>
								</ListItemAvatar>
								<ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={text} />
							</ListItem>
						),
					)}
				</List>
			</CardContent>
		</Card>
	);
}
