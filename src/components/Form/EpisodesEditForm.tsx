'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Flex, Modal, Paper, Switch, Table } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { FieldErrors, useFieldArray, useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { z } from 'zod';
import {
	addEpisodesWithBGM,
	toggleEpisodeIsFree,
	updateSingleEpisodeWithBGM,
} from '@/services/services';
import { Audiobook, Episode } from '@/types/global';
import { createToast, createToast2 } from 'helpers/SweetAlert';
import { CustomFileInput } from './CustomFileInput';
import { CustomInput } from './CustomInput';

const episodesEditFormSchema = z.object({
	episodeList: z.array(
		z.object({
			name: z.string().min(1, { message: 'Name must be provided' }),
			path: z.string().min(1, { message: 'Audio must be uploaded' }),
			bgm: z.string().nullable(),
			duration: z.number(),
		}),
	),
	audiobookId: z.number(),
});

const singleEpisodeEditFormSchema = z.object({
	name: z.string(),
	path: z.string(),
	bgm: z.string().nullable(),
	duration: z.number(),
	audiobookId: z.number(),
	episodeId: z.number(),
});

type EpisodesEditFormDataType = z.infer<typeof episodesEditFormSchema>;
type SingleEpisodeEditFormDataType = z.infer<typeof singleEpisodeEditFormSchema>;

export const EpisodesEditForm = ({
	audiobook,
	episodes,
	closeAssign,
}: {
	audiobook: Audiobook;
	episodes: Episode[];
	closeAssign: () => void;
}) => {
	const [loading, setLoading] = useState(false);
	const [resetImagePath, setResetImagePath] = useState(false);
	const [singleEpisode, setSingleEpisode] = useState<Episode | null>(null);

	const [editEpisodeOpened, { open: editEpisodeOpen, close: editEpisodeClose }] =
		useDisclosure(false);

	const {
		control,
		handleSubmit,
		register,
		setValue,
		watch,
		formState: { errors, isLoading, isSubmitting, touchedFields },
	} = useForm<EpisodesEditFormDataType>({
		resolver: zodResolver(episodesEditFormSchema),
		values: {
			episodeList: [],
			audiobookId: audiobook.id,
		},
	});
	const { fields, append, remove } = useFieldArray({
		name: 'episodeList',
		control,
	});

	const epForm = useForm<SingleEpisodeEditFormDataType>({
		resolver: zodResolver(singleEpisodeEditFormSchema),
		values: {
			name: singleEpisode?.name!,
			path: singleEpisode?.file_path!,
			bgm: singleEpisode?.bgm_filepath!,
			duration: singleEpisode?.duration!,
			audiobookId: audiobook.id,
			episodeId: singleEpisode?.id!,
		},
	});

	const handleToggle = (episodeId: number, isFree: null | number) => {
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, update it!',
		}).then(async result => {
			if (result.isConfirmed) {
				const data = await toggleEpisodeIsFree(episodeId, !isFree ? 1 : 0);
				if (data?.success) {
					Swal.fire({
						title: 'Updated!',
						text: 'Item has been updated.',
						icon: 'success',
					});
					closeAssign();
				}
			}
		});
	};

	const editEpisode = (episodeId: number) => {
		setSingleEpisode(episodes.find((ep: Episode) => ep.id === episodeId)!);
		editEpisodeOpen();
	};

	const handleSubmitEditEpisode = async (formData: SingleEpisodeEditFormDataType) => {
		const data = await updateSingleEpisodeWithBGM(formData);
		if (data?.statusCode === 200) {
			createToast2(data.message);
			editEpisodeClose();
		} else {
			createToast('Could not update episode');
		}
	};

	const handleSubmitEpisodes = async (formData: EpisodesEditFormDataType) => {
		const data = await addEpisodesWithBGM(formData);
		if (data?.success) {
			createToast2(data.message);
			closeAssign();
		} else {
			createToast('Could not add episodes');
		}
	};

	const rowsEpisodes = episodes?.map((element: Episode) => {
		return (
			<Table.Tr key={element.id}>
				<Table.Td style={{ fontSize: 14 }}>{element.id}</Table.Td>
				<Table.Td style={{ fontSize: 14 }}>{element.name}</Table.Td>
				<Table.Td style={{ fontSize: 14 }}>{element.audiobook_id}</Table.Td>
				<Table.Td style={{ fontSize: 14, textAlign: 'center' }}>
					<Flex gap="md" justify="flex-start" direction="row" wrap="wrap">
						<Switch
							checked={element.isfree === 1 ? true : false}
							onChange={() => handleToggle(element.id, element.isfree)}
							size="xs"
						/>
					</Flex>
				</Table.Td>
				<Table.Td style={{ fontSize: 14 }}>
					<Button onClick={() => editEpisode(element.id)}>Edit</Button>
				</Table.Td>
			</Table.Tr>
		);
	});

	return (
		<>
			<Paper shadow="sm" p="md">
				<Table>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Id</Table.Th>
							<Table.Th>Episode Name</Table.Th>
							<Table.Th>Audiobook Id</Table.Th>
							<Table.Th>Free</Table.Th>
							<Table.Th>Action</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rowsEpisodes}</Table.Tbody>
				</Table>
			</Paper>
			<form onSubmit={handleSubmit(handleSubmitEpisodes, err => console.error(err))}>
				{watch('episodeList').length ? (
					<Paper shadow="sm" p="md" mt={20}>
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
					</Paper>
				) : (
					<></>
				)}
				<Flex justify={'end'} my={20}>
					<Button
						style={{ flexGrow: 0 }}
						onClick={() => append({ name: '', path: '', bgm: '', duration: 0 })}
					>
						Add Episode
					</Button>
				</Flex>
				<Button fullWidth type="submit" 
					disabled={loading || isLoading || isSubmitting}
				>
					Submit
				</Button>
			</form>
			<Modal
				opened={editEpisodeOpened}
				onClose={editEpisodeClose}
				title="Update Episode"
				centered
				classNames={{ title: 'mantine-modal-title', close: 'mantine-modal-close' }}
			>
				<form onSubmit={epForm.handleSubmit(handleSubmitEditEpisode, err => console.error(err))}>
					<CustomInput
						label="Episode Name"
						name={`name`}
						placeholder="Episode name"
						control={epForm.control}
						error={(epForm.formState.errors.name && epForm.formState.errors.name.message) as string}
					/>
					<CustomFileInput
						label="Audio File"
						name={`path`}
						placeholder="Upload an audio"
						register={epForm.register}
						setValue={epForm.setValue}
						setLoading={setLoading}
						reset={resetImagePath}
						error={(epForm.formState.errors.path && epForm.formState.errors.path.message) as string}
						isTouched={`path` in epForm.formState.touchedFields}
					/>
					<CustomFileInput
						label="BGM File"
						name={`bgm`}
						placeholder="Upload an audio"
						register={epForm.register}
						setValue={epForm.setValue}
						setLoading={setLoading}
						reset={resetImagePath}
						error={(epForm.formState.errors.bgm && epForm.formState.errors.bgm.message) as string}
						isTouched={`bgm` in epForm.formState.touchedFields}
					/>
					<Button
						type="submit"
						fullWidth
						mt={10}
						disabled={loading || epForm.formState.isLoading || epForm.formState.isSubmitting}
					>
						Update
					</Button>
				</form>
			</Modal>
		</>
	);
};
