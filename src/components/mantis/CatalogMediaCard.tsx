'use client';

import { Box, Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import { IconEye } from '@tabler/icons-react';
import type { ReactNode } from 'react';

export type CatalogMediaCardProps = {
	imageSrc?: string | null;
	imageAlt?: string;
	imageHeight?: number;
	imageFit?: 'cover' | 'contain';
	onImageClick?: () => void;
	topBadge?: ReactNode;
	bottomBadge?: ReactNode;
	showPreviewHint?: boolean;
	inactive?: boolean;
	placeholder?: string;
	children: ReactNode;
	actions?: ReactNode;
	contentSx?: object;
	actionsSx?: object;
};

const imgClass = 'catalog-media-card-img';
const overlayClass = 'catalog-media-card-overlay';

export function CatalogMediaCard({
	imageSrc,
	imageAlt = '',
	imageHeight = 160,
	imageFit = 'cover',
	onImageClick,
	topBadge,
	bottomBadge,
	showPreviewHint = true,
	inactive = false,
	placeholder = 'No image',
	children,
	actions,
	contentSx,
	actionsSx,
}: CatalogMediaCardProps) {
	const canPreview = Boolean(imageSrc && onImageClick);

	return (
		<Card
			variant="outlined"
			sx={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				borderRadius: 2,
				overflow: 'hidden',
				transition: 'box-shadow 0.25s ease, transform 0.25s ease',
				boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
				'&:hover': {
					boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
					transform: 'translateY(-2px)',
					[`& .${imgClass}`]: {
						transform: 'scale(1.08)',
					},
					[`& .${overlayClass}`]: {
						opacity: canPreview && showPreviewHint ? 1 : 0,
					},
				},
				...(inactive && { opacity: 0.65 }),
			}}
		>
			<Box
				onClick={canPreview ? onImageClick : undefined}
				onKeyDown={
					canPreview
						? e => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									onImageClick?.();
								}
							}
						: undefined
				}
				role={canPreview ? 'button' : undefined}
				tabIndex={canPreview ? 0 : undefined}
				sx={{
					position: 'relative',
					bgcolor: 'grey.100',
					overflow: 'hidden',
					flexShrink: 0,
					height: imageHeight,
					cursor: canPreview ? 'zoom-in' : 'default',
				}}
			>
				{imageSrc ? (
					<CardMedia
						component="img"
						className={imgClass}
						image={imageSrc}
						alt={imageAlt}
						sx={{
							height: imageHeight,
							width: '100%',
							objectFit: imageFit,
							p: imageFit === 'contain' ? 1 : 0,
							transition: 'transform 0.35s ease',
							willChange: 'transform',
						}}
					/>
				) : (
					<Box
						sx={{
							height: imageHeight,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							bgcolor: 'grey.200',
						}}
					>
						<Typography variant="caption" color="text.disabled">{placeholder}</Typography>
					</Box>
				)}
				{topBadge ? (
					<Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>{topBadge}</Box>
				) : null}
				{bottomBadge ? (
					<Box sx={{ position: 'absolute', bottom: 8, left: 8, zIndex: 1 }}>{bottomBadge}</Box>
				) : null}
				{canPreview && showPreviewHint ? (
					<Box
						className={overlayClass}
						sx={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							opacity: 0,
							bgcolor: 'rgba(0,0,0,0.35)',
							transition: 'opacity 0.25s ease',
							pointerEvents: 'none',
						}}
					>
						<IconEye size={28} color="white" />
					</Box>
				) : null}
			</Box>
			<CardContent sx={{ flex: 1, pt: 1.5, pb: 1, ...contentSx }}>{children}</CardContent>
			{actions ? (
				<CardActions
					sx={{
						px: 1.5,
						pb: 1.5,
						pt: 0,
						display: 'flex',
						alignItems: 'center',
						...actionsSx,
					}}
				>
					{actions}
				</CardActions>
			) : null}
		</Card>
	);
}
