'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Flex } from '@mantine/core';
import { useEffect, useState } from 'react';
import { FieldErrors, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { createAudiobookWithBGM } from '@/services/services';
import { CustomFileInput } from './CustomFileInput';
import { CustomInput } from './CustomInput';
import { CustomMultiSelect } from './CustomMultiSelect';
import { CustomNumberInput } from './CustomNumberInput';
import { CustomSelect } from './CustomSelect';
import { CustomSwitch } from './CustomSwitch';
import { CustomTextarea } from './CustomTextarea';
import { createToast2 } from 'helpers/SweetAlert';

const audiobookUploadFormSchema = z
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
		episodeList: z.array(
			z.object({
				name: z.string().min(1, { message: 'Name must be provided' }),
				path: z.string().min(1, { message: 'Audio must be uploaded' }),
				bgm: z.string(),
				duration: z.number(),
			}),
		),
	})
	.refine(data => (!data.isPremium && data.price === 0) || (data.isPremium && data.price > 0), {
		message: 'Price must be greater than 0',
		path: ['price'],
	});

export type AudiobookUploadFormDataType = z.infer<typeof audiobookUploadFormSchema>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const AudiobookUploadForm = ({
	token,
	selectionList,
}: {
	token: string;
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
	} = useForm<AudiobookUploadFormDataType>({
		resolver: zodResolver(audiobookUploadFormSchema),
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
			episodeList: [],
		},
	});
	const { fields, append, remove } = useFieldArray({
		name: 'episodeList',
		control,
	});
	const isPremium = watch('isPremium');
	const [loading, setLoading] = useState(false);
	const [resetImagePath, setResetImagePath] = useState(false);

	useEffect(() => {
		if (!isPremium) setValue('price', 0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isPremium]);

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
				episodeList: [],
			});
			setResetImagePath(prev => !prev);
		}
	}, [isSubmitSuccessful, reset]);

	const handleAddAudibook = async (formData: AudiobookUploadFormDataType) => {
		const refinedFormData = {
			...formData,
			category: formData.category.map(item => Number(item)),
			contributor: formData.contributor.join(', '),
			publisher: Number(formData.publisher),
		};

		try {
			const data = await createAudiobookWithBGM(refinedFormData);
			createToast2(data?.message);
		} catch (err) {
			console.error(err);
			return null;
		}
	};

	return (
		<form
			onSubmit={handleSubmit(handleAddAudibook, err => console.log(err))}
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
				withAsterisk
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
				withAsterisk
				isTouched={'bannerImage' in touchedFields}
			/>
			<>
				<>
					{fields.map((item, index) => {
						const nameError = (errors?.episodeList as FieldErrors[] | undefined)?.[index]?.name
							?.message as string;
						const pathError = (errors?.episodeList as FieldErrors[] | undefined)?.[index]?.path
							?.message as string;
						return (
							<Flex gap={10} direction="column" key={item.id}>
								<CustomInput
									label="Episode Name"
									name={`episodeList.${index}.name`}
									placeholder="Episode name"
									control={control}
									error={nameError}
									withAsterisk
								/>
								<CustomFileInput
									label="Audio File"
									name={`episodeList.${index}.path`}
									placeholder="Upload an audio"
									multiple={true}
									register={register}
									setValue={setValue}
									setLoading={setLoading}
									reset={resetImagePath}
									error={pathError}
									isTouched={`episodeList.${index}.path` in touchedFields}
									withAsterisk
								/>
								<Flex direction={'row'} wrap={'nowrap'} gap={10} align={'end'}>
									<div style={{ flexGrow: 1 }}>
										<CustomFileInput
											label="BGM File"
											name={`episodeList.${index}.bgm`}
											placeholder="Upload an audio"
											multiple={true}
											register={register}
											setValue={setValue}
											setLoading={setLoading}
											reset={resetImagePath}
											error={pathError}
											isTouched={`episodeList.${index}.bgm` in touchedFields}
										/>
									</div>
									<Button
										style={{ position: 'relative', top: '-3px' }}
										onClick={() => remove(index)}
									>
										Delete
									</Button>
								</Flex>
							</Flex>
						);
					})}
				</>
				<Flex justify={'end'}>
					<Button
						style={{ flexGrow: 0 }}
						onClick={() => append({ name: '', path: '', bgm: '', duration: 0 })}
					>
						Add Episode
					</Button>
				</Flex>
			</>
			<Button type="submit" py={10} disabled={loading || isLoading || isSubmitting}>
				Create
			</Button>
		</form>
	);
};
