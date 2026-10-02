'use client';

import { createActivityLog } from '@/helper/Commonfunction';
import { imageUploadApiUrl } from '@/utils/constant';
import {
	Button,
	FormControl,
	FormHelperText,
	InputLabel,
	OutlinedInput,
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

	const showError = Boolean(required && isTouched && !filePath && error) || Boolean(error);

	const registration = register(name);
	const helperMessage = showError || error ? error : ' ';

	return (
		<FormControl fullWidth size="small" error={Boolean(showError || error)} required={required}>
			<InputLabel shrink htmlFor={`${name}-file`}>
				{label}
			</InputLabel>
			<OutlinedInput
				notched
				label={label}
				readOnly
				value={filePath || ''}
				placeholder={placeholder}
				sx={{
					'& .MuiOutlinedInput-input': {
						cursor: 'pointer',
						color: filePath ? 'text.primary' : 'text.secondary',
					},
				}}
				inputProps={{ id: `${name}-file` }}
				onClick={() => document.getElementById(`${name}-file-input`)?.click()}
				endAdornment={
					<Button component="label" size="small" variant="text" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
						Browse
						<input
							id={`${name}-file-input`}
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
				}
			/>
			<FormHelperText sx={{ minHeight: 20, m: 0, mt: 0.5 }}>{helperMessage}</FormHelperText>
		</FormControl>
	);
};
