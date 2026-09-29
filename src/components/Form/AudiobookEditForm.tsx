'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Flex } from '@mantine/core';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { editAudiobookWithBGM, getCategoryForSingleAudiobook } from '@/services/services';
import { Audiobook } from '@/types/global';
import { imageLoader } from '@/utils/globalHelpers';
import { createToast, createToast2 } from 'helpers/SweetAlert';
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
}: {
	audiobook: Audiobook;
	selectionList: any;
}) => {
	const {
		control,
		handleSubmit,
		register,
		setValue,
		watch,
		reset,
		formState: { errors, isLoading, isSubmitting, isSubmitSuccessful, touchedFields },
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
	}, []);

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
		<form
			onSubmit={handleSubmit(handleEditAudibook, err => console.log(err))}
			style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
		>
			<CustomInput
				label="Name"
				name="name"
				placeholder="Audiobook name"
				control={control}
				error={(errors.name && errors.name.message) as string}
				withAsterisk
			/>
			<CustomInput
				label="English Name"
				name="enName"
				placeholder="Audiobook name in english"
				control={control}
				error={(errors.enName && errors.enName.message) as string}
				withAsterisk
			/>

			<CustomSelect
				label="Publisher"
				name="publisher"
				data={selectionList.publisherList}
				placeholder="Select a publisher"
				control={control}
				error={(errors.publisher && errors.publisher.message) as string}
				clearable
				searchable
				withAsterisk
			/>
			{/* {console.log(selectionList.artistList)} */}
			<CustomMultiSelect
				label="Contributor"
				name="contributor"
				data={selectionList.artistList}
				placeholder="Select a contributor"
				control={control}
				error={(errors.contributor && errors.contributor.message) as string}
				clearable
				searchable
				withAsterisk
			/>
			<CustomMultiSelect
				label="Category"
				name="category"
				data={selectionList.categoryList}
				placeholder="Select one or more categories"
				control={control}
				error={(errors.category && errors.category.message) as string}
				clearable
				searchable
			/>
			<CustomSelect
				label="Author"
				name="author"
				data={selectionList.authorList}
				placeholder="Select an author"
				control={control}
				error={(errors.author && errors.author.message) as string}
				searchable
				clearable
				withAsterisk
			/>
			<CustomTextarea
				label="Description"
				name="description"
				placeholder="Give a description"
				control={control}
				error={(errors.description && errors.description.message) as string}
			/>
			<CustomSwitch label="Premium" name="isPremium" control={control} />
			<CustomSwitch label="Podcast" name="isPodcast" control={control} />
			<CustomNumberInput
				label="Price"
				name="price"
				placeholder="Set a price"
				control={control}
				error={(errors.price && errors.price.message) as string}
				disabled={!isPremium}
				withAsterisk={isPremium}
			/>
			<Flex gap={10} align={'end'}>
				<div style={{ flexGrow: 1 }}>
					<CustomFileInput
						label="Audiobook Image"
						name="audiobookImage"
						placeholder="Upload an image"
						multiple={true}
						register={register}
						setValue={setValue}
						setLoading={setLoading}
						reset={resetImagePath}
						error={(errors.audiobookImage && errors.audiobookImage.message) as string}
						isTouched={'audiobookImage' in touchedFields}
					/>
					<CustomFileInput
						label="Banner Image"
						name="bannerImage"
						placeholder="Upload an image"
						multiple={true}
						register={register}
						setValue={setValue}
						setLoading={setLoading}
						reset={resetImagePath}
						error={(errors.bannerImage && errors.bannerImage.message) as string}
						isTouched={'bannerImage' in touchedFields}
					/>
				</div>
				<Image
					loader={imageLoader}
					src={audiobook.thumb_path}
					height={0}
					width={0}
					alt={`${audiobook.en_name}_kabbik`}
					quality={100}
					priority={true}
					style={{ width: '100px', height: 'auto', borderRadius: '5px', marginLeft: 'auto' }}
				/>
			</Flex>
			<Button type="submit" py={10} disabled={loading || isLoading || isSubmitting}>
				Update
			</Button>
		</form>
	);
};
