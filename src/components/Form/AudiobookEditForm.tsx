'use client';

import { Box, Stack } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { editAudiobookWithBGM, getCategoryForSingleAudiobook } from '@/services/services';
import { Audiobook } from '@/types/global';
import { imageLoader } from '@/utils/globalHelpers';
import { createToast, createToast2 } from 'helpers/SweetAlert';
import {
	AudiobookFormField,
	AudiobookFormGrid,
	AudiobookFormRoot,
	AudiobookFormSection,
} from './AudiobookFormLayout';
import { CustomFileInput } from './CustomFileInput';
import { CustomInput } from './CustomInput';
import { CustomMultiSelect } from './CustomMultiSelect';
import { CustomNumberInput } from './CustomNumberInput';
import { CustomSelect } from './CustomSelect';
import { CustomSwitch } from './CustomSwitch';
import { CustomTextarea } from './CustomTextarea';

const audiobookEditFormSchema = z
	.object({
		name: z.string().min(1, { message: 'Name must be provided' }),
		enName: z.string().min(1, { message: 'English Name must be provided' }),
		publisher: z.string().min(1, { message: 'Publisher must be provided' }),
		contributor: z
			.array(z.string())
			.min(1, { message: 'At least one contributor must be selected' }),
		category: z.array(z.string()),
		author: z.string().min(1, { message: 'At least one author must be selected' }),
		description: z.string(),
		isPremium: z.boolean(),
		price: z.number(),
		audiobookImage: z.string().min(1, { message: 'Image must be uploaded' }),
		bannerImage: z.string().min(1, { message: 'Image must be uploaded' }),
		isPodcast: z.boolean(),
	})
	.refine(data => (!data.isPremium && data.price === 0) || (data.isPremium && data.price > 0), {
		message: 'Price must be greater than 0',
		path: ['price'],
	});

export type AudiobookEditFormDataType = z.infer<typeof audiobookEditFormSchema>;

export const AudiobookEditForm = ({
	audiobook,
	selectionList,
	formId = 'audiobook-edit-form',
}: {
	audiobook: Audiobook;
	selectionList: any;
	formId?: string;
}) => {
	const {
		control,
		handleSubmit,
		register,
		setValue,
		watch,
		reset,
		formState: { errors, isSubmitSuccessful, touchedFields },
	} = useForm<AudiobookEditFormDataType>({
		resolver: zodResolver(audiobookEditFormSchema),
		defaultValues: {
			name: '',
			enName: '',
			publisher: '1000',
			contributor: [],
			category: [],
			author: '',
			description: '',
			isPremium: false,
			price: 0,
			audiobookImage: '',
			bannerImage: '',
			isPodcast: false,
		},
	});

	const [isFetched, setIsFetched] = useState(false);
	const [isDirty, setIsDirty] = useState(true);
	const isPremium = watch('isPremium');
	const [loading, setLoading] = useState(false);
	const [resetImagePath, setResetImagePath] = useState(false);
	const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

	useEffect(() => {
		if (!isPremium) setValue('price', 0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isPremium]);

	useEffect(() => {
		const fetchSelectedCategory = async () => {
			const result = await getCategoryForSingleAudiobook(audiobook.id);
			setSelectedCategoryIds(result);
			setIsFetched(true);
		};
		fetchSelectedCategory();
	}, [audiobook.id]);

	useEffect(() => {
		if (isSubmitSuccessful) {
			reset({
				name: '',
				enName: '',
				publisher: '1000',
				contributor: [],
				category: [],
				author: '',
				description: '',
				isPremium: false,
				price: 0,
				audiobookImage: '',
				bannerImage: '',
				isPodcast: false,
			});
			setResetImagePath(prev => !prev);
		}
		if (isDirty) {
			reset({
				name: audiobook.name,
				enName: audiobook.en_name,
				publisher: audiobook.publisher_id?.toString(),
				contributor: audiobook.contributing_artists.split(',').map(item => item.trim()),
				category: selectedCategoryIds.map((item: number) => item.toString()),
				author: audiobook.author_name,
				description: audiobook.description,
				isPremium: audiobook.premium ? true : false,
				price: Number(audiobook.price),
				audiobookImage: audiobook.thumb_path,
				bannerImage: audiobook.banner_path,
				isPodcast: audiobook.podcast ? true : false,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSubmitSuccessful, reset, isFetched, selectionList]);

	const handleEditAudibook = async (formData: AudiobookEditFormDataType) => {
		const refinedFormData = {
			...formData,
			category: formData.category.map(item => Number(item)),
			contributor: formData.contributor.join(', '),
			id: audiobook.id,
		};

		try {
			setIsDirty(false);
			const data = await editAudiobookWithBGM(refinedFormData);
			createToast2(data?.message);
		} catch (err) {
			console.error(err);
			createToast('Something went wrong');
		}
	};

	return (
		<AudiobookFormRoot formId={formId} onSubmit={handleSubmit(handleEditAudibook, err => console.log(err))}>
			<AudiobookFormSection title="Basic information" description="Display names shown in the app.">
				<AudiobookFormGrid>
					<AudiobookFormField>
						<CustomInput dense label="Name" name="name" placeholder="Audiobook name" control={control} error={(errors.name && errors.name.message) as string} required />
					</AudiobookFormField>
					<AudiobookFormField>
						<CustomInput dense label="English Name" name="enName" placeholder="Audiobook name in english" control={control} error={(errors.enName && errors.enName.message) as string} required />
					</AudiobookFormField>
					<AudiobookFormField xs={12}>
						<CustomTextarea label="Description" name="description" placeholder="Give a description" control={control} error={(errors.description && errors.description.message) as string} />
					</AudiobookFormField>
				</AudiobookFormGrid>
			</AudiobookFormSection>

			<AudiobookFormSection title="Classification" description="Publisher, people, and categories.">
				<AudiobookFormGrid>
					<AudiobookFormField>
						<CustomSelect label="Publisher" name="publisher" data={selectionList.publisherList} placeholder="Select a publisher" control={control} error={(errors.publisher && errors.publisher.message) as string} clearable searchable required />
					</AudiobookFormField>
					<AudiobookFormField>
						<CustomSelect label="Author" name="author" data={selectionList.authorList} placeholder="Select an author" control={control} error={(errors.author && errors.author.message) as string} searchable clearable required />
					</AudiobookFormField>
					<AudiobookFormField>
						<CustomMultiSelect label="Contributor" name="contributor" data={selectionList.artistList} placeholder="Select a contributor" control={control} error={(errors.contributor && errors.contributor.message) as string} clearable searchable required />
					</AudiobookFormField>
					<AudiobookFormField>
						<CustomMultiSelect label="Category" name="category" data={selectionList.categoryList} placeholder="Select one or more categories" control={control} error={(errors.category && errors.category.message) as string} clearable searchable />
					</AudiobookFormField>
				</AudiobookFormGrid>
			</AudiobookFormSection>

			<AudiobookFormSection title="Pricing & type">
				<AudiobookFormGrid>
					<AudiobookFormField md={4}>
						<CustomSwitch label="Premium" name="isPremium" control={control} />
					</AudiobookFormField>
					<AudiobookFormField md={4}>
						<CustomSwitch label="Podcast" name="isPodcast" control={control} />
					</AudiobookFormField>
					<AudiobookFormField md={4}>
						<CustomNumberInput label="Price" name="price" placeholder="Set a price" control={control} error={(errors.price && errors.price.message) as string} disabled={!isPremium} required={isPremium} />
					</AudiobookFormField>
				</AudiobookFormGrid>
			</AudiobookFormSection>

			<AudiobookFormSection title="Cover art" description="Thumbnail and banner assets.">
				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<AudiobookFormGrid>
							<AudiobookFormField xs={12}>
								<CustomFileInput label="Audiobook Image" name="audiobookImage" placeholder="Upload an image" multiple={true} register={register} setValue={setValue} setLoading={setLoading} reset={resetImagePath} error={(errors.audiobookImage && errors.audiobookImage.message) as string} isTouched={'audiobookImage' in touchedFields} />
							</AudiobookFormField>
							<AudiobookFormField xs={12}>
								<CustomFileInput label="Banner Image" name="bannerImage" placeholder="Upload an image" multiple={true} register={register} setValue={setValue} setLoading={setLoading} reset={resetImagePath} error={(errors.bannerImage && errors.bannerImage.message) as string} isTouched={'bannerImage' in touchedFields} />
							</AudiobookFormField>
						</AudiobookFormGrid>
					</Box>
					{audiobook.thumb_path ? (
						<Box sx={{ flexShrink: 0, p: 0.75, borderRadius: 2, border: 1, borderColor: 'divider', bgcolor: 'grey.50', alignSelf: { xs: 'center', sm: 'flex-start' } }}>
							<Image loader={imageLoader} src={audiobook.thumb_path} height={140} width={100} alt={`${audiobook.en_name}_kabbik`} quality={100} style={{ width: 100, height: 'auto', borderRadius: 8, display: 'block' }} />
						</Box>
					) : null}
				</Stack>
			</AudiobookFormSection>
		</AudiobookFormRoot>
	);
};
