import {
	Avatar,
	Box,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	Typography,
} from '@mui/material';
'use client';

interface UserButtonProps {
	image: string;
	name: string;
	email: string;
	mini?: boolean;
}

export function UserButton({ image, name, email, mini = false }: UserButtonProps) {
	if (mini) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center' }}>
				<Avatar src={image || undefined} sx={{ width: 36, height: 36 }}>
					{name?.charAt(0)?.toUpperCase()}
				</Avatar>
			</Box>
		);
	}

	return (
		<ListItemButton sx={{ borderRadius: 2, px: 1 }}>
			<ListItemAvatar sx={{ minWidth: 44 }}>
				<Avatar src={image || undefined}>{name?.charAt(0)?.toUpperCase()}</Avatar>
			</ListItemAvatar>
			<ListItemText
				primary={
					<Typography variant="body2" fontWeight={600} noWrap>
						{name}
					</Typography>
				}
				secondary={
					<Typography variant="caption" color="text.secondary" noWrap>
						{email}
					</Typography>
				}
			/>
		</ListItemButton>
	);
}
