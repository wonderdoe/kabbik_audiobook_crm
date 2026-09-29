import { createActivityLog } from '@/helper/Commonfunction';
import { imageUploadApiUrl } from '@/utils/constant';
import { Text, useMantineColorScheme } from '@mantine/core';
import { create } from 'domain';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type CustomFileInputProps = {
	label: string;
	name: string;
	placeholder?: string;
	multiple?: boolean;
	register: any;
	error?: string;
	setValue: any;
	withAsterisk?: boolean;
	setLoading: Dispatch<SetStateAction<boolean>>;
	reset: boolean;
	isTouched?: boolean;
};

export const CustomFileInput = ({
	label,
	name,
	placeholder,
	multiple,
	register,
	error,
	setValue,
	withAsterisk,
	setLoading,
	reset,
	isTouched,
}: CustomFileInputProps) => {
	const [filePath, setFilePath] = useState('');
	const { colorScheme } = useMantineColorScheme();
	const isLightTheme = colorScheme === 'light';

	useEffect(() => {
		setFilePath('');
	}, [reset]);

	const handleFile = async (event: any) => {
		try {
			const file = event.target.files[0];
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
			formData.append('files', event.target.files[0]);
			formData.append('size', event.target.files[0].size);
			setFilePath(event.target.files[0].name);
			const response = await fetch(imageUploadApiUrl, {
				method: 'POST',
				body: formData,
			});

			let activityLogPayload = {
				name: 'handleFile',
				action_type: 'create',
				payload: JSON.stringify({ fileName: event.target.files[0].name }),
				api_end_point: imageUploadApiUrl,
			};
			createActivityLog(activityLogPayload);

			const res = await response.json();
			setValue(name, res.image_file_url);
			// setValue(name, 'dummy path');
			setLoading(false);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div>
			<span
				style={{
					fontSize: '14px',
					color: isLightTheme ? '#000000' : '#c9c9c9',
					fontWeight: 500,
					marginBottom: '-18px',
				}}
			>
				{label}
				{withAsterisk && <span style={{ color: '#fa5252' }}> *</span>}
			</span>
			<label
				style={{
					marginBottom: '3px',
					paddingLeft: '10px',
					width: '100%',
					height: '36px',
					borderRadius: '8px',
					display: 'flex',
					justifyContent: 'start',
					alignItems: 'center',
					fontSize: '14px',
					border: `1px solid ${isLightTheme ? (filePath === '' && isTouched ? 'var(--mantine-color-error)' : 'rgb(206, 212, 218)') : 'rgb(66, 66, 66)'}`,
					background: isLightTheme ? '#ffffff' : 'var(--mantine-color-dark-6)',
					color: 'var(--input-color)',
				}}
			>
				{filePath === '' && (
					<span
						style={{
							fontSize: '14px',
							color: isLightTheme
								? filePath === '' && isTouched
									? 'var(--mantine-color-error)'
									: 'var(--mantine-color-dark-1)'
								: 'var(--mantine-color-dark-3)',
						}}
					>
						{placeholder}
					</span>
				)}
				<input
					type="file"
					multiple={multiple}
					{...register(name, {
						onChange: (e: any) => {
							handleFile(e);
						},
						value: (e: any) => e.target.files[0].name,
					})}
					hidden
				/>
				<div>{filePath}</div>
			</label>
			{withAsterisk && filePath === '' ? (
				<Text size="xs" c="red">
					{error}
				</Text>
			) : (
				<></>
			)}
		</div>
	);
};
