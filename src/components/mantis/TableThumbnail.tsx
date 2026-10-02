'use client';

import { Box } from '@mui/material';

export type TableThumbnailProps = {
	src?: string | null;
	alt?: string;
	size?: number;
	objectFit?: 'cover' | 'contain';
	/** Overrides global 48px table cap — use `lg` for banners/wide art */
	displaySize?: 'sm' | 'md' | 'lg';
};

/** Fixed-size image for table cells (covers, logos, proofs). */
const THUMB_SIZES = {
	sm: { width: 64, height: 64 },
	md: { width: 96, height: 96 },
	/** Tall box for portrait covers; wide banners use contain inside */
	lg: { width: 96, height: 128 },
} as const;

export function TableThumbnail({
	src,
	alt = '',
	size = 64,
	objectFit = 'cover',
	displaySize = 'sm',
}: TableThumbnailProps) {
	if (!src) {
		return null;
	}

	const dataSize = displaySize !== 'sm' ? displaySize : undefined;
	const dims = THUMB_SIZES[displaySize];
	const width = displaySize === 'sm' ? size : dims.width;
	const height = displaySize === 'sm' ? size : dims.height;

	return (
		<Box
			component="img"
			src={src}
			alt={alt}
			data-table-thumb={objectFit}
			data-table-thumb-size={dataSize}
			sx={{
				width,
				height,
				maxWidth: width,
				maxHeight: height,
				objectFit,
				borderRadius: 1,
				display: 'block',
				border: 1,
				borderColor: 'divider',
				bgcolor: 'grey.50',
			}}
		/>
	);
}
