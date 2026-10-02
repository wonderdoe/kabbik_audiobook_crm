'use client';
import { Button, IconButton, Paper, Stack, Typography } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { FieldErrors, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { createAudiobookWithBGM } from '@/services/services';
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

export const AudiobookUploadForm = ({
	token,
	selectionList,
	formId = 'audiobook-add-form',
}: {
	token: string;
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
		<AudiobookFormRoot
			formId={formId}
			onSubmit={handleSubmit(handleAddAudibook, err => console.log(err))}
		>
			<AudiobookFormSection title="Basic information" description="Display names shown in the app.">
				<AudiobookFormGrid>
					<AudiobookFormField>
						<CustomInput
							dense
							label="Name"
							name="name"
							placeholder="Audiobook name"
							control={control}
							error={(errors.name && errors.name.message) as string}
							required
						/>
					</AudiobookFormField>
					<AudiobookFormField>
						<CustomInput
							dense
							label="English Name"
							name="enName"
							placeholder="Audiobook name in english"
							control={control}
							error={(errors.enName && errors.enName.message) as string}
							required
						/>
					</AudiobookFormField>
					<AudiobookFormField xs={12}>
						<CustomTextarea
							label="Description"
							name="description"
							placeholder="Give a description"
							control={control}
							error={(errors.description && errors.description.message) as string}
						/>
					</AudiobookFormField>
				</AudiobookFormGrid>
			</AudiobookFormSection>

			<AudiobookFormSection title="Classification" description="Publisher, people, and categories.">
				<AudiobookFormGrid>
					<AudiobookFormField>
						<CustomSelect
							label="Publisher"
							name="publisher"
							data={selectionList.publisherList}
							placeholder="Select a publisher"
							control={control}
							error={(errors.publisher && errors.publisher.message) as string}
							clearable
							searchable
							required
						/>
					</AudiobookFormField>
					<AudiobookFormField>
						<CustomSelect
							label="Author"
							name="author"
							data={selectionList.authorList}
							placeholder="Select an author"
							control={control}
							error={(errors.author && errors.author.message) as string}
							searchable
							clearable
							required
						/>
					</AudiobookFormField>
					<AudiobookFormField>
						<CustomMultiSelect
							label="Contributor"
							name="contributor"
							data={selectionList.artistList}
							placeholder="Select a contributor"
							control={control}
							error={(errors.contributor && errors.contributor.message) as string}
							clearable
							searchable
							required
						/>
					</AudiobookFormField>
					<AudiobookFormField>
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
						<CustomNumberInput
							label="Price"
							name="price"
							placeholder="Set a price"
							control={control}
							error={(errors.price && errors.price.message) as string}
							disabled={!isPremium}
							required={isPremium}
						/>
					</AudiobookFormField>
				</AudiobookFormGrid>
			</AudiobookFormSection>

			<AudiobookFormSection title="Cover art">
				<AudiobookFormGrid>
					<AudiobookFormField>
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
							required
							isTouched={'audiobookImage' in touchedFields}
						/>
					</AudiobookFormField>
					<AudiobookFormField>
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
							required
							isTouched={'bannerImage' in touchedFields}
						/>
					</AudiobookFormField>
				</AudiobookFormGrid>
			</AudiobookFormSection>

			<AudiobookFormSection
				title="Episodes"
				description="Add audio files now or skip and assign episodes later."
			>
				<Stack spacing={1.5}>
					{fields.map((item, index) => {
						const nameError = (errors?.episodeList as FieldErrors[] | undefined)?.[index]?.name
							?.message as string;
						const pathError = (errors?.episodeList as FieldErrors[] | undefined)?.[index]?.path
							?.message as string;
						return (
							<Paper key={item.id} variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
								<Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
									<Typography variant="subtitle2" fontWeight={600}>
										Episode {index + 1}
									</Typography>
									<IconButton
										size="small"
										color="error"
										aria-label="Remove episode"
										onClick={() => remove(index)}
									>
										<IconTrash size={16} />
									</IconButton>
								</Stack>
								<Stack spacing={0}>
									<CustomInput
										dense
										label="Episode Name"
										name={`episodeList.${index}.name`}
										placeholder="Episode name"
										control={control}
										error={nameError}
										required
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
										required
									/>
									<CustomFileInput
										label="BGM File (optional)"
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
								</Stack>
							</Paper>
						);
					})}
					<Button
						variant="outlined"
						size="small"
						startIcon={<IconPlus size={16} />}
						onClick={() => append({ name: '', path: '', bgm: '', duration: 0 })}
						sx={{ alignSelf: 'flex-start' }}
					>
						Add episode
					</Button>
				</Stack>
			</AudiobookFormSection>
		</AudiobookFormRoot>
	);
};
