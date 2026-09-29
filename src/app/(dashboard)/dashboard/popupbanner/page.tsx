'use client';
import Loader from '@/components/Loader';
import { createActivityLog } from '@/helper/Commonfunction';
import {
	Button,
	Divider,
	Flex,
	Image,
	Modal,
	Paper,
	Select,
	Switch,
	Table,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconUpload } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function PopupBanner() {
	const [popupList, setPopupList] = useState([]);
	const [addImage, setAddImage] = useState<any>();
	const [audioBookId, setAudioBookId] = useState<any>();
	const [assignOpened, { open: openAddBanner, close: closeAddBanner }] = useDisclosure(false);
	const [value, setValue] = useState<any>();
	const [loading, setLoading] = useState(true);

	const getPopUpList = async () => {
		try {
			const response = await fetch('/api/routes/popup');
			const apidata = await response.json();
			setLoading(false);
			setPopupList(apidata);
		} catch (error) {}
	};

	const handleToggle = async (index: number) => {
		const tempArr: any = popupList; // Create a copy of the popupList array
		const item = tempArr[index];

		// Update the status of the clicked item

		if (tempArr[index].status == 0) {
			tempArr[index].status = 1;
			item.status = 1;
		} else {
			tempArr[index].status = 1;
			item.status = 0;
		}
		const data = {
			status: item.status,
		};
		// Turn off other items

		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, Update it!',
		}).then(async result => {
			if (result.isConfirmed) {
				try {
					const response = await fetch(`/api/routes/popup/${item.id}`, {
						method: 'POST',
						body: JSON.stringify(data),
					});
					let activityLogPayload = {
						name: 'handleToggle,popupbanner/page.tsx',
						action_type: 'update',
						payload: JSON.stringify({ id: item.id, status: item.status }),
						api_end_point: `/api/routes/popup/${item.id}`,
					};
					createActivityLog(activityLogPayload);

					if (!response.ok) {
						throw new Error('Failed to update data');
					}
					getPopUpList();

					Swal.fire({
						title: 'Updated!',
						text: 'Item has been updated.',
						icon: 'success',
					});
				} catch (error) {
					console.error('Error updating data:', error);
					Swal.fire({
						title: 'Error!',
						text: 'Failed to update item.',
						icon: 'error',
					});
				}
			}
		});
	};
	const handleAddImage = async (event: any) => {
		const formData = new FormData();
		formData.append('files', event.target.files[0]);
		formData.append('size', event.target.files[0].size);

		const response = await fetch('https://api.kabbik.com/v3/audiobooks/upload-image-in-stack', {
			method: 'POST',
			body: formData,
		});
		let activityLogPayload = {
			name: 'handleAddImage,popupbanner/page.tsx',
			action_type: 'create',
			payload: JSON.stringify({ fileName: event.target.files[0].name }),
			api_end_point: 'https://api.kabbik.com/v3/audiobooks/upload-image-in-stack',
		};
		createActivityLog(activityLogPayload);

		const res = await response.json();

		setAddImage(res.image_file_url);
	};

	const handleAddPopup = async (event: any) => {
		event.preventDefault();
		const formData = new FormData();
		formData.append('audiobook_id', audioBookId);
		formData.append('home_ad_type', value);
		formData.append('home_ad_image', addImage);

		try {
			const response = await fetch('/api/routes/addpopup', {
				method: 'POST',
				body: formData,
			});
			let activityLogPayload = {
				name: 'handleAddPopup',
				action_type: 'create',
				payload: JSON.stringify({ audiobook_id: audioBookId, home_ad_type: value,home_ad_image: addImage }),
				api_end_point: '/api/routes/addpopup',
			};
			createActivityLog(activityLogPayload);

			const res = await response.json();
			if (res.statusCode === 201) {
				closeAddBanner();
				getPopUpList();
			}
		} catch (error) {}
	};

	const handleImageChange = async (event: any, index: any) => {
		try {
			Swal.fire({
				title: 'Are you sure?',
				text: "You won't be able to revert this!",
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, update it!',
			}).then(async (result: any) => {
				if (result.isConfirmed) {
					const tempArray: any = popupList;
					const item = tempArray[index];
					const formData = new FormData();
					formData.append('files', event.target.files[0]);
					formData.append('size', event.target.files[0].size);

					const response = await fetch(
						'https://api.kabbik.com/v3/audiobooks/upload-image-in-stack',
						{
							method: 'POST',
							body: formData,
						},
					);

					let activityLogPayload = {
						name: 'handleImageChange',	
						action_type: 'create',
						payload: JSON.stringify({ fileName: event.target.files[0].name }),
						api_end_point: 'https://api.kabbik.com/v3/audiobooks/upload-image-in-stack',
					};
					createActivityLog(activityLogPayload);

					const res = await response.json();

					const data = {
						image_url: res.image_file_url,
					};

					if (res.image_file_url) {
						const getresponse = await fetch(`/api/routes/popup/${item.id}`, {
							method: 'PATCH',
							body: JSON.stringify(data),
						});
						let activityLogPayload = {
							name: 'handleImageChange,popupbanner/page.tsx',
							action_type: 'update',
							payload: JSON.stringify(data),
							api_end_point: `/api/routes/popup/${item.id}`,
						};
						createActivityLog(activityLogPayload);

						const res = await getresponse.json();

						if (res.statusCode === 200) {
							const updatedBannerData: any = popupList.map((element: any) => {
								if (element.id == item.id) {
									return { ...element, home_ad_image: res.image_file_url };
								}
								return element;
							});

							setPopupList(updatedBannerData);

							getPopUpList();
							Swal.fire({
								title: 'Updated!',
								text: 'Item has been updated.',
								icon: 'success',
							});
						}
					}
				}
			});
		} catch (error) {
			return;
		}
	};

	let fileInput: any;

	const rows = popupList.map((element: any, index: any) => (
		<Table.Tr key={element.id}>
			<Table.Td>{element.home_ad_type}</Table.Td>
			<div>
				<IconUpload
					type="file"
					size={20}
					onClick={() => fileInput.click()}
					style={{ cursor: 'pointer' }}
				/>

				<input
					type="file"
					accept="image/*"
					onChange={event => handleImageChange(event, index)}
					ref={input => {
						fileInput = input;
					}}
					style={{ display: 'none' }}
				/>

				{/* <input type="file" onChange={() => handleImageChange(event, index)} /> */}

				<Image
					radius="sm"
					h={150}
					w={150}
					fit="cover"
					p="6px"
					src={element.home_ad_image}
					alt={element.home_ad_image}
				/>
			</div>
			<Table.Td>
				<Switch
					checked={element.status == 1 ? true : false}
					onChange={() => handleToggle(index)}
					size="xs"
				/>
			</Table.Td>
		</Table.Tr>
	));
	useEffect(() => {
		getPopUpList();
	}, []);

	return (
		<>
			{loading ? (
				<Loader />
			) : (
				<>
					<Flex justify={'space-between'}>
						<Title order={1} style={{ marginBottom: 20 }}>
							Popup List
						</Title>
						<Button onClick={openAddBanner} variant="filled">
							Add Banner
						</Button>
					</Flex>
					<Paper withBorder radius="md" p="md">
						<Table>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Type</Table.Th>
									<Table.Th>Image</Table.Th>
									<Table.Th>Action</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>{rows}</Table.Tbody>
						</Table>
						<Divider my="sm" />
						{/* <Pagination color='#cc0099' total={20} siblings={1} defaultValue={10} /> */}
					</Paper>
					<Modal opened={assignOpened} onClose={closeAddBanner} title="" centered>
						<Text size="xl" fw={900} style={{ textAlign: 'center' }}>
							Add Banner
						</Text>
						<Paper shadow="xs" p="xl">
							<form onSubmit={handleAddPopup}>
								<Select
									py={10}
									data={[
										{ value: 'SUBSCRIPTION', label: 'SUBSCRIPTION' },
										{ value: 'AUDIOBOOK', label: 'AUDIOBOOK' },
									]}
									placeholder="Pick value"
									value={value}
									onChange={(option: any) => {
										setValue(option);
									}}
								/>
								{value == 'audiobook' && (
									<TextInput
										py={10}
										onChange={e => setAudioBookId(e.target.value)}
										required
										placeholder="Type Audiobook Id"
									/>
								)}

								<input
									style={{ paddingTop: 10, paddingBottom: 10 }}
									type="file"
									onChange={event => handleAddImage(event)}
								/>
								{addImage && (
									<Image
										style={{ paddingBottom: 10 }}
										src={addImage}
										height={200}
										width={200}
										alt="Uploaded"
									/>
								)}
								<Button type="submit">Add Popup</Button>
							</form>
						</Paper>
					</Modal>
				</>
			)}
		</>
	);
}
