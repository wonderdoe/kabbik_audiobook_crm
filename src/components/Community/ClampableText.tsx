'use client';

import { Box, Typography } from '@mui/material';
import { useState } from 'react';

const DEFAULT_MAX_CHARS = 280;

type ClampableTextProps = {
	text: string;
	maxChars?: number;
	variant?: 'body2' | 'body1';
	color?: string;
};

export function ClampableText({
	text,
	maxChars = DEFAULT_MAX_CHARS,
	variant = 'body2',
	color = 'text.secondary',
}: ClampableTextProps) {
	const [expanded, setExpanded] = useState(false);
	const clamp = !expanded && text.length > maxChars;

	if (!text) {
		return (
			<Typography variant={variant} color={color}>
				—
			</Typography>
		);
	}

	return (
		<Box>
			<Typography
				variant={variant}
				color={color}
				sx={
					clamp
						? {
								display: '-webkit-box',
								WebkitLineClamp: 4,
								WebkitBoxOrient: 'vertical',
								overflow: 'hidden',
							}
						: { whiteSpace: 'pre-wrap', wordBreak: 'break-word' }
				}
			>
				{text}
			</Typography>
			{text.length > maxChars ? (
				<Typography
					component="button"
					type="button"
					variant="caption"
					color="primary"
					onClick={() => setExpanded(v => !v)}
					sx={{
						mt: 0.5,
						border: 0,
						bgcolor: 'transparent',
						cursor: 'pointer',
						p: 0,
						font: 'inherit',
					}}
				>
					{expanded ? 'Show less' : 'Read more'}
				</Typography>
			) : null}
		</Box>
	);
}
