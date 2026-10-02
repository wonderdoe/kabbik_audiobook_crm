'use client';

import { createActivityLog } from '@/helper/Commonfunction';
import { imageUploadApiUrl } from '@/utils/constant';
import {
	Button,
	FormHelperText,
	Stack,
	Typography,
} from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type CustomFileInputProps = {
	label: string;
	name: string;
	placeholder?: string;
	multiple?: boolean;
	register: any;
	error?: string;
	setValue: any;
	required?: boolean;
	setLoading: Dispatch<SetStateAction<boolean>>;
	reset: boolean;
	isTouched?: boolean;
	accept?: string;
};

export const CustomFileInput = ({
	label,
	name,
	placeholder = 'Choose file',
	multiple,
	register,
	error,
	setValue,
	required,
	setLoading,
	reset,
	isTouched,
	accept,
}: CustomFileInputProps) => {
	const [filePath, setFilePath] = useState('');

	useEffect(() => {
		setFilePath('');
	}, [reset]);

	const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}

		try {
			if (file.type.startsWith('audio') && name.includes('path')) {
				const audio = document.createElement('audio');
				const objectUrl = URL.createObjectURL(file);
				audio.src = objectUrl;
				audio.onloadedmetadata = () => {
					setValue(name.replace('path', 'duration'), Number(Number(audio.duration).toFixed(2)));
					URL.revokeObjectURL(objectUrl);
				};
			}

			setLoading(true);
			const formData = new FormData();
			formData.append('files', file);
			formData.append('size', String(file.size));
			setFilePath(file.name);

			const response = await fetch(imageUploadApiUrl, {
				method: 'POST',
				body: formData,
			});

			createActivityLog({
				name: 'handleFile,CustomFileInput.tsx',
				action_type: 'create',
				payload: JSON.stringify({ fileName: file.name }),
				api_end_point: imageUploadApiUrl,
			});

			const res = await response.json();
			setValue(name, res.image_file_url, { shouldValidate: true, shouldDirty: true });
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const showError = Boolean(required && isTouched && !filePath && error);

	const registration = register(name);

	return (
		<Stack spacing={0.5} sx={{ my: 1 }}>
			<Typography variant="body2" fontWeight={500}>
				{label}
				{required ? (
					<Typography component="span" color="error.main">
						{' '}
						*
					</Typography>
				) : null}
			</Typography>
			<Button
				variant="outlined"
				component="label"
				size="small"
				sx={{
					justifyContent: 'flex-start',
					color: filePath ? 'text.primary' : 'text.secondary',
					borderColor: showError ? 'error.main' : undefined,
				}}
			>
				{filePath || placeholder}
				<input
					type="file"
					hidden
					multiple={multiple}
					accept={accept}
					name={registration.name}
					ref={registration.ref}
					onBlur={registration.onBlur}
					onChange={e => {
						void handleFile(e);
					}}
				/>
			</Button>
			<FormHelperText error={showError || Boolean(error)}>{showError || error ? error : ' '}</FormHelperText>
		</Stack>
	);
};
