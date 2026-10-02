'use client';

import {
	Box,
	Stack,
	Typography,
	useTheme,
} from '@mui/material';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useCallback, useState } from 'react';

const IMAGE_MIME = 'image/*';

export const UploadForm = () => {
	const theme = useTheme();
	const [dragState, setDragState] = useState<'idle' | 'accept' | 'reject'>('idle');

	const onDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		const files = [...e.dataTransfer.files];
		const ok = files.every(f => f.type.startsWith('image/'));
		setDragState(ok ? 'accept' : 'reject');
		console.log(ok ? 'accepted files' : 'rejected files', files);
	}, []);

	return (
		<Box
			onDragOver={e => e.preventDefault()}
			onDragLeave={() => setDragState('idle')}
			onDrop={onDrop}
			onClick={() => {
				const input = document.createElement('input');
				input.type = 'file';
				input.accept = IMAGE_MIME;
				input.multiple = true;
				input.onchange = () => console.log('accepted files', input.files);
				input.click();
			}}
			sx={{
				border: '2px dashed',
				borderColor: 'divider',
				borderRadius: 2,
				p: 4,
				cursor: 'pointer',
				minHeight: 220,
			}}
		>
			<Stack direction="row" alignItems="center" justifyContent="center" spacing={3} sx={{ pointerEvents: 'none' }}>
				{dragState === 'accept' ? (
					<IconUpload size={51} stroke={1.5} color={theme.palette.primary.main} />
				) : dragState === 'reject' ? (
					<IconX size={51} stroke={1.5} color={theme.palette.error.main} />
				) : (
					<IconPhoto size={51} stroke={1.5} />
				)}
				<Box>
					<Typography variant="h6" component="span" display="block">
						Drag images here or click to select files
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
						Attach as many files as you like, each file should not exceed 5mb
					</Typography>
				</Box>
			</Stack>
		</Box>
	);
};
