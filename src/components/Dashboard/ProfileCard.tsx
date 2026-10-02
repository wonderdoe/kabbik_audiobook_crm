'use client';

import {
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	Divider,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Stack,
	Typography,
} from '@mui/material';
import { IconDots, IconEye, IconFileZip, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

const sectionSx = {
	p: 2,
	borderTop: '1px solid',
	borderColor: 'divider',
};

export function ProfileCard() {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	return (
		<Card sx={{ borderRadius: 2 }}>
			<CardContent sx={sectionSx}>
				<Stack direction="row" alignItems="center" justifyContent="space-between">
					<Avatar />
					<IconButton onClick={e => setAnchorEl(e.currentTarget)}>
						<IconDots size="1rem" />
					</IconButton>
					<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
						<MenuItem onClick={() => setAnchorEl(null)}>
							<ListItemIcon>
								<IconFileZip size={14} />
							</ListItemIcon>
							<ListItemText>Action One</ListItemText>
						</MenuItem>
						<MenuItem onClick={() => setAnchorEl(null)}>
							<ListItemIcon>
								<IconEye size={14} />
							</ListItemIcon>
							<ListItemText>Action Two</ListItemText>
						</MenuItem>
						<MenuItem onClick={() => setAnchorEl(null)} sx={{ color: 'error.main' }}>
							<ListItemIcon>
								<IconTrash size={14} />
							</ListItemIcon>
							<ListItemText>Action Three</ListItemText>
						</MenuItem>
					</Menu>
				</Stack>

				<Box sx={{ height: 16 }} />

				<Stack spacing={0.5}>
					<Typography variant="subtitle2" component="h5">Joshua Lee</Typography>
					<Typography fontSize="sm" color="text.secondary" fontWeight={500}>
						jotyy318@email.com
					</Typography>
					<Typography fontSize="sm" color="text.secondary" fontWeight={500}>
						{'0x3D2f3bA6737C6999850E0c0Fe571190E6d27C40C'.slice(0, 12) +
							'..' +
							'0x3D2f3bA6737C6999850E0c0Fe571190E6d27C40C'.slice(-4)}
					</Typography>
				</Stack>
			</CardContent>

			<Divider />

			<CardContent sx={sectionSx}>
				<Stack direction="row" alignItems="center" spacing={4}>
					<Stack spacing={0.5}>
						<Typography fontSize="sm" fontWeight={500}>Balance</Typography>
						<Typography variant="h6" component="h3">$9821</Typography>
					</Stack>
					<Stack spacing={0.5}>
						<Typography fontSize="sm" fontWeight={500}>Chain</Typography>
						<Typography variant="h6" component="h3">Etherum</Typography>
					</Stack>
				</Stack>
			</CardContent>

			<Divider />

			<CardContent sx={sectionSx}>
				<Stack direction="row" alignItems="center" spacing={1}>
					<Button variant="outlined">Deposit</Button>
					<Button variant="contained">Buy/Sell</Button>
				</Stack>
			</CardContent>
		</Card>
	);
}
