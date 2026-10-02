'use client';

import {
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	IconButton,
	Paper,
	Stack,
	Switch,
	Typography,
} from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconEdit, IconHeadphones, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useState } from 'react';
import { FieldErrors, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
	addEpisodesWithBGM,
	toggleEpisodeIsFree,
	updateSingleEpisodeWithBGM,
} from '@/services/services';
import { Audiobook, Episode } from '@/types/global';
import { confirmDialog, createToast, createToast2 } from 'helpers/SweetAlert';
import {
	AudiobookFormRoot,
	AudiobookFormSection,
} from './AudiobookFormLayout';
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

function formatDuration(seconds: number) {
	if (!seconds || seconds <= 0) return '—';
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${s.toString().padStart(2, '0')}`;
}

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
		confirmDialog({
			title: 'Change free access?',
			text: 'This updates whether listeners can play this episode for free.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, update',
		}).then(async result => {
			if (result.isConfirmed) {
				const data = await toggleEpisodeIsFree(episodeId, !isFree ? 1 : 0);
				if (data?.success) {
					confirmDialog({ title: 'Updated', text: 'Episode access updated.', icon: 'success' });
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
			closeAssign();
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

	const pendingCount = watch('episodeList').length;

	return (
		<>
			<Stack spacing={2.5}>
				<AudiobookFormSection
					title={`Published episodes (${episodes?.length ?? 0})`}
					description="Toggle free access or edit audio files."
				>
					{!episodes?.length ? (
						<Paper
							variant="outlined"
							sx={{ py: 4, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}
						>
							<Typography variant="body2" color="text.secondary">
								No episodes yet. Add one below.
							</Typography>
						</Paper>
					) : (
						<Stack spacing={1}>
							{episodes.map((element: Episode, index: number) => (
								<Paper
									key={element.id}
									variant="outlined"
									sx={{
										p: 1.5,
										borderRadius: 2,
										transition: 'box-shadow 0.2s ease',
										'&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
									}}
								>
									<Stack
										direction={{ xs: 'column', sm: 'row' }}
										spacing={1.5}
										alignItems={{ sm: 'center' }}
										justifyContent="space-between"
									>
										<Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
											<Box
												sx={{
													width: 36,
													height: 36,
													borderRadius: 1.5,
													bgcolor: 'primary.50',
													color: 'primary.main',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													flexShrink: 0,
													fontWeight: 700,
													fontSize: '0.75rem',
												}}
											>
												{index + 1}
											</Box>
											<Box sx={{ minWidth: 0 }}>
												<Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
													<Typography variant="subtitle2" fontWeight={600} noWrap title={element.name}>
														{element.name}
													</Typography>
													<Chip
														label={`#${element.id}`}
														size="small"
														variant="outlined"
														sx={{ height: 22, fontFamily: 'monospace', fontSize: '0.65rem' }}
													/>
													<Chip
														label={element.isfree === 1 ? 'Free' : 'Premium'}
														size="small"
														color={element.isfree === 1 ? 'success' : 'default'}
														sx={{ height: 22, fontWeight: 600, fontSize: '0.65rem' }}
													/>
												</Stack>
												<Stack direction="row" alignItems="center" spacing={0.5} mt={0.5} color="text.secondary">
													<IconHeadphones size={14} stroke={1.5} />
													<Typography variant="caption">{formatDuration(element.duration)}</Typography>
												</Stack>
											</Box>
										</Stack>

										<Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
											<FormControlLabel
												control={
													<Switch
														size="small"
														checked={element.isfree === 1}
														onChange={() => handleToggle(element.id, element.isfree)}
													/>
												}
												label={<Typography variant="caption">Free</Typography>}
												sx={{ m: 0 }}
											/>
											<Button
												size="small"
												variant="outlined"
												startIcon={<IconEdit size={14} />}
												onClick={() => editEpisode(element.id)}
											>
												Edit
											</Button>
										</Stack>
									</Stack>
								</Paper>
							))}
						</Stack>
					)}
				</AudiobookFormSection>

				<AudiobookFormRoot
					formId="episode-batch-add-form"
					onSubmit={handleSubmit(handleSubmitEpisodes, err => console.error(err))}
				>
					<AudiobookFormSection
						title="Add new episodes"
						description="Upload audio (and optional BGM) for episodes not listed above."
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
												New episode {index + 1}
											</Typography>
											<IconButton
												size="small"
												color="error"
												aria-label="Remove"
												onClick={() => remove(index)}
											>
												<IconTrash size={16} />
											</IconButton>
										</Stack>
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
											register={register}
											setValue={setValue}
											setLoading={setLoading}
											reset={resetImagePath}
											error={pathError}
											isTouched={`episodeList.${index}.bgm` in touchedFields}
										/>
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
								Add episode row
							</Button>
							{pendingCount > 0 ? (
								<Button
									type="submit"
									variant="contained"
									disabled={loading || isLoading || isSubmitting}
									sx={{ alignSelf: 'flex-end' }}
								>
									Upload {pendingCount} episode{pendingCount === 1 ? '' : 's'}
								</Button>
							) : null}
						</Stack>
					</AudiobookFormSection>
				</AudiobookFormRoot>
			</Stack>

			<Dialog
				open={editEpisodeOpened}
				onClose={editEpisodeClose}
				maxWidth="sm"
				fullWidth
				PaperProps={{ sx: { borderRadius: 2 } }}
			>
				<DialogTitle
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						fontWeight: 600,
						py: 1.5,
					}}
				>
					Update episode
					<IconButton size="small" aria-label="Close" onClick={editEpisodeClose}>
						<IconX size={18} />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers>
					<form id="episode-edit-form" onSubmit={epForm.handleSubmit(handleSubmitEditEpisode, err => console.error(err))}>
						<Stack spacing={0}>
							<CustomInput
								dense
								label="Episode Name"
								name="name"
								placeholder="Episode name"
								control={epForm.control}
								error={(epForm.formState.errors.name && epForm.formState.errors.name.message) as string}
							/>
							<CustomFileInput
								label="Audio File"
								name="path"
								placeholder="Upload an audio"
								register={epForm.register}
								setValue={epForm.setValue}
								setLoading={setLoading}
								reset={resetImagePath}
								error={(epForm.formState.errors.path && epForm.formState.errors.path.message) as string}
								isTouched={'path' in epForm.formState.touchedFields}
							/>
							<CustomFileInput
								label="BGM File (optional)"
								name="bgm"
								placeholder="Upload an audio"
								register={epForm.register}
								setValue={epForm.setValue}
								setLoading={setLoading}
								reset={resetImagePath}
								error={(epForm.formState.errors.bgm && epForm.formState.errors.bgm.message) as string}
								isTouched={'bgm' in epForm.formState.touchedFields}
							/>
						</Stack>
					</form>
				</DialogContent>
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button variant="outlined" color="inherit" onClick={editEpisodeClose}>
						Cancel
					</Button>
					<Button
						variant="contained"
						type="submit"
						form="episode-edit-form"
						disabled={loading || epForm.formState.isLoading || epForm.formState.isSubmitting}
					>
						Save episode
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};
