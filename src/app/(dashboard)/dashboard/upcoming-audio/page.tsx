'use client';
import {
	Button,
	Divider,
	Flex,
	Image,
	Modal,
	Paper,
	ScrollArea,
	Table,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { createToast, createToast2 } from 'helpers/SweetAlert';
import Loader from '@/components/Loader';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CustomInput } from '@/components/Form/CustomInput';
import { CustomNumberInput } from '@/components/Form/CustomNumberInput';
import { CustomFileInput } from '@/components/Form/CustomFileInput';
import { CustomTextarea } from '@/components/Form/CustomTextarea';
import {
	addUpcomingAudiobook,
	deleteUpcomingAudiobook,
	editUpcomingAudiobook,
	getUpcomingAudiobook,
} from '@/services/services';

const UpcomingAudiobookFormSchema = z.object({
	name: z.string().min(1, { message: 'Name must be provided' }),
	description: z.string().min(1, { message: 'Description must provided' }),
	authorName: z.string().min(1, { message: 'Author name must be provided' }),
	price: z.number({ required_error: 'Price must be privded' }),
	imagePath: z.string().min(1, { message: 'Image must be uploaded' }),
});

type UpcomingAudiobookFormType = z.infer<typeof UpcomingAudiobookFormSchema>;

export default function UpcomingAudio() {
	const [data, setData] = useState<any>([]);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [authorName, setAuthorName] = useState('');
	const [price, setPrice] = useState('');
	const [addImage, setAddImage] = useState('');
	const [showLongDescription, setShowLongDescription] = useState<number | null>();
	const [isLoading, setIsLoading] = useState(true);
	const [loading, setLoading] = useState(false);
	const [resetImagePath, setResetImagePath] = useState(false);
	const [editUpcomingAudiobookDetails, setEditUpcomingAudiobookDetails] = useState<any>(null);
	const [
		createUpcomingModalOpened,
		{ open: openCreateUpcomingModal, close: closeCreateUpcomingModal },
	] = useDisclosure(false);
	const [editUpcomingModalOpened, { open: openEditUpcomingModal, close: closeEditUpcomingModal }] =
		useDisclosure(false);

	const {
		control: createControl,
		register: createRegister,
		handleSubmit: createHandleSubmit,
		setValue: createSetValue,
		reset: resetCreate,
		formState: {
			errors: createErrors,
			touchedFields: createTouchedFields,
			isSubmitting: createIsSubmitting,
		},
	} = useForm<UpcomingAudiobookFormType>({
		resolver: zodResolver(UpcomingAudiobookFormSchema),
		defaultValues: {
			name: '',
			description: '',
			authorName: '',
			price: 0,
			imagePath: '',
		},
	});

	const {
		control: editControl,
		register: editRegister,
		handleSubmit: editHandleSubmit,
		setValue: editSetValue,
		watch: editWatch,
		formState: {
			errors: editErrors,
			touchedFields: editTouchedFields,
			isSubmitting: editIsSubmitting,
		},
	} = useForm<UpcomingAudiobookFormType>({
		resolver: zodResolver(UpcomingAudiobookFormSchema),
		defaultValues: {
			name: '',
			description: '',
			authorName: '',
			price: 0,
			imagePath: '',
		},
		values: {
			name: editUpcomingAudiobookDetails?.name,
			description: editUpcomingAudiobookDetails?.description,
			authorName: editUpcomingAudiobookDetails?.author,
			price: editUpcomingAudiobookDetails?.price,
			imagePath: editUpcomingAudiobookDetails?.thumbPath,
		},
	});

	async function getData() {
		try {
			setIsLoading(true);
			const apidata = await getUpcomingAudiobook();
			setData(apidata);
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}

	const handleSubmitCreateUpcomingAudiobook = async (formData: UpcomingAudiobookFormType) => {
		try {
			const data = await addUpcomingAudiobook(formData);
			if (data?.statusCode === 201) {
				createToast2(data?.message);
				resetCreate({
					name: '',
					description: '',
					authorName: '',
					price: 0,
					imagePath: '',
				});
				closeCreateUpcomingModal();
				getData();
			} else {
				createToast(data?.message);
			}
		} catch (err) {
			console.error(err);
			createToast('Something went wrong');
		}
	};

	const handleDeleteUpcomingAudiobook = async (id: number) => {
		try {
			const data = await deleteUpcomingAudiobook(id);
			if (data?.statusCode === 200) {
				createToast2(data?.message);
				getData();
			} else {
				createToast(data?.message);
			}
		} catch (err) {
			console.error(err);
			createToast('Something went wrong');
		}
	};

	const handleSubmitEditUpcomingAudiobook = async (formData: UpcomingAudiobookFormType) => {
		try {
			const data = await editUpcomingAudiobook({
				...formData,
				id: editUpcomingAudiobookDetails?.id,
			});
			if (data?.statusCode === 200) {
				createToast2(data?.message);
				closeEditUpcomingModal();
				getData();
			} else {
				createToast(data?.message);
			}
		} catch (err) {
			console.error(err);
			createToast('Something went wrong');
		}
	};

	useEffect(() => {
		getData();
	}, []);

	const rows = data.map((element: any, index: number) => (
		<Table.Tr key={element.id}>
			<Table.Td>{element.id}</Table.Td>
			<Table.Td>{element.name}</Table.Td>

			<Table.Td>
				<div
					className={index === showLongDescription ? '' : 'three-line-ellipsis'}
					onClick={() => setShowLongDescription(index === showLongDescription ? null : index)}
					style={{ maxWidth: '500px' }}
				>
					{element.description}
				</div>
			</Table.Td>
			<Table.Td>
				<Image radius="md" src={element.thumbPath} alt={element.thumbPath} h={120} w={'auto'} />
			</Table.Td>
			<Table.Td>{element.author}</Table.Td>
			<Table.Td>{element.price}</Table.Td>

			<Table.Td>
				<Flex gap={10}>
					<Button
						onClick={() => {
							setEditUpcomingAudiobookDetails(element);
							openEditUpcomingModal();
						}}
					>
						Edit
					</Button>
					<Button onClick={() => handleDeleteUpcomingAudiobook(element.id)}>Delete</Button>
				</Flex>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<>
			{isLoading ? (
				<Loader />
			) : (
				<>
					<Flex justify={'space-between'}>
						<Title order={1} style={{ marginBottom: 20 }}>
							Upcoming Audio List
						</Title>
						<Button onClick={openCreateUpcomingModal}>Add Upcoming Audio</Button>
					</Flex>
					<Paper withBorder radius="md" p="md">
						<ScrollArea>
							<Table>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Id</Table.Th>
										<Table.Th>Name</Table.Th>
										<Table.Th>Description</Table.Th>
										<Table.Th>Image</Table.Th>
										<Table.Th>Author</Table.Th>
										<Table.Th>Price</Table.Th>
										<Table.Th>Action</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>{rows}</Table.Tbody>
							</Table>
						</ScrollArea>
						<Divider my="sm" />
					</Paper>

					<Modal
						opened={createUpcomingModalOpened}
						onClose={closeCreateUpcomingModal}
						title="Create Upcoming Audiobook"
						centered
						size={'lg'}
						classNames={{ title: 'mantine-modal-title', close: 'mantine-modal-close' }}
					>
						<form
							onSubmit={createHandleSubmit(handleSubmitCreateUpcomingAudiobook, err =>
								console.error(err),
							)}
							style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
						>
							<CustomInput
								label="Name"
								name="name"
								control={createControl}
								placeholder="Type audiobook name"
								error={(createErrors.name && createErrors.name.message) as string}
								withAsterisk
							/>
							<CustomTextarea
								label="Description"
								name="description"
								control={createControl}
								placeholder="Type audiobook description"
								error={(createErrors.description && createErrors.description.message) as string}
								withAsterisk
							/>
							<CustomInput
								label="Author Name"
								name="authorName"
								control={createControl}
								placeholder="Type author name"
								error={(createErrors.authorName && createErrors.authorName.message) as string}
								withAsterisk
							/>
							<CustomNumberInput
								label="Price"
								name="price"
								control={createControl}
								placeholder="Set audiobook price"
								error={(createErrors.price && createErrors.price.message) as string}
								withAsterisk
							/>
							<CustomFileInput
								label="Audiobook Image"
								name="imagePath"
								placeholder="Upload an image"
								multiple={true}
								register={createRegister}
								setValue={createSetValue}
								setLoading={setLoading}
								reset={resetImagePath}
								error={(createErrors.imagePath && createErrors.imagePath.message) as string}
								withAsterisk
								isTouched={'imagePath' in createTouchedFields}
							/>
							<Button type="submit" disabled={loading || isLoading || createIsSubmitting}>
								Create
							</Button>
						</form>
					</Modal>

					<Modal
						opened={editUpcomingModalOpened}
						onClose={closeEditUpcomingModal}
						title="Edit Upcoming Audiobook"
						centered
						size={'lg'}
						classNames={{ title: 'mantine-modal-title', close: 'mantine-modal-close' }}
					>
						<form
							onSubmit={editHandleSubmit(handleSubmitEditUpcomingAudiobook, err =>
								console.error(err),
							)}
							style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
						>
							<CustomInput
								label="Name"
								name="name"
								control={editControl}
								placeholder="Type audiobook name"
								error={(editErrors.name && editErrors.name.message) as string}
							/>
							<CustomTextarea
								label="Description"
								name="description"
								control={editControl}
								placeholder="Type audiobook description"
								error={(editErrors.description && editErrors.description.message) as string}
							/>
							<CustomInput
								label="Author Name"
								name="authorName"
								control={editControl}
								placeholder="Type author name"
								error={(editErrors.authorName && editErrors.authorName.message) as string}
							/>
							<CustomNumberInput
								label="Price"
								name="price"
								control={editControl}
								placeholder="Set audiobook price"
								error={(editErrors.price && editErrors.price.message) as string}
							/>
							<Flex justify={'space-between'} gap={15}>
								<div style={{ flexGrow: 1 }}>
									<CustomFileInput
										label="Audiobook Image"
										name="imagePath"
										placeholder="Upload an image"
										multiple={true}
										register={editRegister}
										setValue={editSetValue}
										setLoading={setLoading}
										reset={resetImagePath}
										error={(editErrors.imagePath && editErrors.imagePath.message) as string}
										isTouched={'imagePath' in editTouchedFields}
									/>
									<Button
										style={{ marginTop: 10 }}
										type="submit"
										disabled={loading || isLoading || editIsSubmitting}
									>
										Update
									</Button>
								</div>
								<Image
									src={editUpcomingAudiobookDetails?.thumbPath}
									alt={editUpcomingAudiobookDetails?.thumbPath}
									height={150}
									radius={7}
								/>
							</Flex>
						</form>
					</Modal>
				</>
			)}
		</>
	);
}
