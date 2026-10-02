import Cookies from 'js-cookie';
import { Blog } from '@/types/global';
import {
	addBinMappingUrl,
	addListOfBinsUrl,
	artistsUrl,
	audiobookUrl,
	audioCategoryUrl,
	authorNameUrl,
	baseUrl,
	blogsUrl,
	categoryForSingleAudiobookUrl,
	editAudiobookWithBGMUrl,
	episodesUrl,
	findOnePromocodeUrl,
	findPromocodeDetailsUrl,
	getGroupwiseFilteredPromoCountUrl,
	getPackageWiseRevenueUrl,
	getSingleDayTotalPaymentUrl,
	getTopMostUsedPromosUrl,
	productOrderUrl,
	promocodeListUrl,
	publisherNameUrl,
	publisherRequestsUrl,
	pushNotificationToallUsersUrl,
	pushNotificationToSpecificUsersUrl,
	rentReportUrl,
	searchAudiobookUrl,
	toggleEpisodeIsFreeUrl,
	togglePromocodeActivityUrl,
	upcomingAudiobookUrl,
	updateApprovalStatus,
	updateSingleEpisodeWithBGMUrl,
	uploadAudiobookWithBGMUrl,
} from '@/utils/constant';
import { addEpisodesWithBGMUrl } from '@/utils/constant';
import { createActivityLog } from '@/helper/Commonfunction';

export const fetchProductOrders = async () => {
	const response = await fetch(productOrderUrl);
	if (!response.ok) {
		return null;
	}
	const result = await response.json();
	return result;
};

export const updateDeliveryStatus = async (body: {
	newDeliveryStatus: string;
	productId: string;
}) => {
	const response = await fetch(productOrderUrl, {
		method: 'PUT',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify(body),
	});
	let activityLogPayload = {
		name: 'updateDeliveryStatus',
		action_type: 'update',
		payload: JSON.stringify(body),
		api_end_point: productOrderUrl,
	};
	createActivityLog(activityLogPayload);
	if (!response.ok) {
		return null;
	}
	const result = await response.json();
	return result;
};

export const getAuthorList = async () => {
	const response = await fetch(authorNameUrl, { cache: 'no-store' });
	if (!response.ok) {
		return [];
	}
	const result = await response.json();
	return result;
};

export const getPublisherList = async () => {
	const response = await fetch(publisherNameUrl, { cache: 'no-store' });
	if (!response.ok) {
		return [];
	}
	const result = await response.json();
	return result;
};

export const getArtistList = async () => {
	const response = await fetch(artistsUrl, { cache: 'no-store' });
	if (!response.ok) {
		return [];
	}
	const result = await response.json();
	if (Array.isArray(result)) {
		return result;
	}
	return result.data ?? [];
};

export const getAudiobookCategories = async () => {
	const response = await fetch(baseUrl + audioCategoryUrl, { cache: 'no-store' });
	if (!response.ok) {
		return [];
	}
	const result = await response.json();
	return result;
};

export const createAudiobookWithBGM = async (payload: any) => {
	try {
		const response = await fetch(uploadAudiobookWithBGMUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});
		let activityLogPayload = {
			name: 'createAudiobookWithBGM',
			action_type: 'create',
			payload:JSON.stringify({ payload }),
			api_end_point: uploadAudiobookWithBGMUrl,
		}
		createActivityLog(activityLogPayload);
		if (!response.ok) {
			throw new Error(`Error duing fetching, ${response}`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const getCategoryForSingleAudiobook = async (audiobookId: number) => {
	try {
		const response = await fetch(`${categoryForSingleAudiobookUrl}?audiobookId=${audiobookId}`);
		if (!response.ok) {
			throw new Error(`Error during fetching, ${response}`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const editAudiobookWithBGM = async (payload: any) => {
	try {
		const response = await fetch(editAudiobookWithBGMUrl, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
		let activityLogPayload = {
			name: 'editAudiobookWithBGM, services.ts',
			action_type: 'update',
			payload:JSON.stringify({ payload }),
			api_end_point: editAudiobookWithBGMUrl,
		}
		createActivityLog(activityLogPayload);
		if (!response.ok) {
			throw new Error(`Error during editing audiobook, ${response}`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const addEpisodesWithBGM = async (payload: any) => {
	try {
		
		const response = await fetch(addEpisodesWithBGMUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				authorization: `Bearer ${Cookies.get('admin_token')?.trim()}`,
			},
			body: JSON.stringify(payload),
		});
		
		let activityLogPayload = {
			name: 'addEpisodesWithBGM',
			action_type: 'create',
			payload:JSON.stringify({ payload }),
			api_end_point: addEpisodesWithBGMUrl,
		}
		createActivityLog(activityLogPayload);
		if (!response.ok) {
			throw new Error(`Error during fetching, ${response}`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const updateSingleEpisodeWithBGM = async (payload: any) => {
	try {
		const response = await fetch(updateSingleEpisodeWithBGMUrl, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});
		let activityLogPayload = {
			name: 'updateSingleEpisodeWithBGM, services.ts',
			action_type: 'update',
			payload:JSON.stringify({ payload }),
			api_end_point: updateSingleEpisodeWithBGMUrl,
		}
		createActivityLog(activityLogPayload);
		if (!response.ok) {
			throw new Error(`Error during fetching, ${response}`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const getEpisodes = async (payload: any) => {
	try {
		const response = await fetch(episodesUrl, {
			method: 'POST',
			body: JSON.stringify({ audiobook_id: payload }),
		});

		let activityLogPayload = {
			name: 'getEpisodes',
			action_type: 'create',
			payload:JSON.stringify({ audiobook_id: payload }),
			api_end_point: episodesUrl,
		}
		createActivityLog(activityLogPayload);

		if (!response.ok) {
			throw new Error('Failed to fetch data');
		}
		const apidata = await response.json();
		return apidata;
	} catch (err) {
		console.error(err);
		return [];
	}
};

export const updateApproveAudiobook = async (audiobookId: number, action: string) => {
	try {
		const response = await fetch(
			`${updateApprovalStatus}?audiobookId=${audiobookId}&action=${action}`,
			{
				method: 'PUT',
				headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
			},
		);
		let activityLogPayload = {
			name: 'updateApproveAudiobook, services.ts',
			action_type: 'update',
			payload: JSON.stringify({ audiobookId, action }),
			api_end_point: `${updateApprovalStatus}?audiobookId=${audiobookId}&action=${action}`,
		};
		createActivityLog(activityLogPayload);
		if (!response) {
			throw new Error(`Request failed when updating approval status ${response}`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const deleteAudiobook = async (audiobookId: number) => {
	try {
		const response = await fetch(`${audiobookUrl}?audiobookId=${audiobookId}`, {
			method: 'DELETE',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});
		let activityLogPayload = {
			name: 'deleteAudiobook, services.ts',
			action_type: 'delete',
			payload: JSON.stringify({ audiobookId }),
			api_end_point: `${audiobookUrl}?audiobookId=${audiobookId}`,
		};
		createActivityLog(activityLogPayload);
		if (!response.ok) {
			throw new Error(`Request failed when deleting audiobook ${response}`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		return false;
	}
};

export const searchAudiobooks = async (searchQuery: string) => {
	try {
		const response = await fetch(`${searchAudiobookUrl}?search=${searchQuery}`);
		if (!response) {
			throw new Error(`Request failed when searching for audiobooks ${response}`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const toggleEpisodeIsFree = async (episodeId: number, isFree: number) => {
	try {
		const response = await fetch(
			`${toggleEpisodeIsFreeUrl}?episodeId=${episodeId}&isFree=${isFree}`,
			{
				method: 'PUT',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			},
		);
		let activityLogPayload = {
			name: 'toggleEpisodeIsFree,services.ts',
			action_type: 'update',
			payload: JSON.stringify({ episodeId, isFree }),
			api_end_point: `${toggleEpisodeIsFreeUrl}?episodeId=${episodeId}&isFree=${isFree}`,
		};
		createActivityLog(activityLogPayload);
		if (!response.ok) {
			throw new Error(`Error occurred during toggling episode data ${response}`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const getPromocodeList = async (
	type: string,
	limit: number,
	offset: number,
	startDate: string,
	endDate: string,
) => {
	try {
		const response = await fetch(
			`${promocodeListUrl}?type=${type}&limit=${limit}&offset=${offset}&startDate=${startDate}&endDate=${endDate}`,
			{ cache: 'no-store' },
		);
		if (!response.ok) {
			throw new Error(`Error occured during fetching promocode list ${response}`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const getAllPromocode = async () => {
	try {
		const response = await fetch(baseUrl + '/api/routes/promocode');
		if (!response.ok) {
			throw new Error(`Error during fetching promocode list ${response}`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const togglePromocodeActivity = async (id: number) => {
	try {
		const response = await fetch(`${togglePromocodeActivityUrl}?id=${id}`, {
			method: 'PUT',
		});
		let activityLogPayload = {
			name: 'togglePromocodeActivity,services.ts',
			action_type: 'update',
			payload: JSON.stringify({ id }),
			api_end_point: `${togglePromocodeActivityUrl}?id=${id}`,
		};
		createActivityLog(activityLogPayload);
		if (!response.ok) {
			throw new Error(`Error during toggling promocode activity ${response}`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const getGroupwiseFilteredPromoCount = async (searchParams: {
	limit: number;
	offset: number;
	startDate: string;
	endDate: string;
	promocode: string | null;
	promocodeType: 'all' | 'activated' | 'deactivated';
}) => {
	try {
		const { promocode, startDate, endDate, limit, offset, promocodeType } = searchParams;
		const response = await fetch(
			`${getGroupwiseFilteredPromoCountUrl}?promocodeType=${promocodeType}&promocode=${promocode}&startDate=${startDate}&endDate=${endDate}&limit=${limit}&offset=${offset}`,
		);
		if (!response.ok) {
			throw new Error(`Error during fetching groupwise filtered promo count ${response}`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		return [];
	}
};

export const getTotalReceivedPayment = async (day: string) => {
	try {
		const response = await fetch(`${getSingleDayTotalPaymentUrl}?day=${day}`, {
			cache: 'no-store',
		});
		if (!response.ok) {
			throw new Error(`Error during fetching total received payments ${response}`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		return 0;
	}
};

export const getTopMostUsedPromoList = async (day: string) => {
	try {
		const response = await fetch(`${getTopMostUsedPromosUrl}?day=${day}`, { cache: 'no-store' });
		if (!response.ok) {
			throw new Error(`Error during fetching top most used promocodes ${response}`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
	}
};

export const getRentRevenueReport = async (data: {
	startDate: string;
	endDate: string;
	limit: number;
	offset: number;
}) => {
	try {
		const response = await fetch(
			`${rentReportUrl}?startDate=${data.startDate}&endDate=${data.endDate}&limit=${data.limit}&offset=${data.offset}`,
		);
		if (!response.ok) {
			throw new Error('Failed to fetch data');
		}
		const result = await response.json();
		return result;
	} catch (error) {
		console.error(error);
		return error;
	}
};

export const getUpcomingAudiobook = async () => {
	try {
		const response = await fetch(upcomingAudiobookUrl, { next: { revalidate: 5 * 60 } });
		if (!response.ok) {
			throw new Error(`Error occurred during fetching upcoming audiobook`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const addUpcomingAudiobook = async (payload: any) => {
	try {
		const response = await fetch(upcomingAudiobookUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify(payload),
		});
		let activityLogPayload = {
			name: 'addUpcomingAudiobook',
			action_type: 'create',
			payload:JSON.stringify({ payload }),
			api_end_point: upcomingAudiobookUrl,
		}
		createActivityLog(activityLogPayload);
		if (!response.ok) {
			throw new Error(`Error occurred during creating upcoming audiobook`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const editUpcomingAudiobook = async (payload: any) => {
	try {
		const response = await fetch(upcomingAudiobookUrl, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify(payload),
		});
		let activityLogPayload = {
			name: 'editUpcomingAudiobook',
			action_type: 'update',
			payload:JSON.stringify({ payload }),
			api_end_point: upcomingAudiobookUrl,
		}
		createActivityLog(activityLogPayload);
		if (!response.ok) {
			throw new Error(`Error occurred during creating upcoming audiobook`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const deleteUpcomingAudiobook = async (id: number) => {
	try {
		const response = await fetch(`${upcomingAudiobookUrl}?id=${id}`, {
			method: 'DELETE',
		});
		let activityLogPayload = {
			name: 'deleteUpcomingAudiobook',
			action_type: 'delete',
			payload:JSON.stringify({ id }),
			api_end_point: `${upcomingAudiobookUrl}?id=${id}`,
		}
		createActivityLog(activityLogPayload);
		if (!response.ok) {
			throw new Error(`Error occurred during deleting upcoming audiobook`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const getPublisherRequests = async (activeTab: string) => {
	try {
		const response = await fetch(`${publisherRequestsUrl}?status=${activeTab}`);
		if (!response.ok) {
			throw new Error(`Error occurred during fetching publisher requests`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const acceptPublisherRequest = async (payload: any) => {
	try {
		const response = await fetch(publisherRequestsUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify(payload),
		});
		let activityLogPayload = {
			name: 'acceptPublisherRequest',
			action_type: 'create',
			payload:JSON.stringify({ payload }),
			api_end_point: publisherRequestsUrl,
		}
		createActivityLog(activityLogPayload);
		if (!response.ok) {
			throw new Error(`Error occurred during accepting publisher request`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const sendPushNotification = async (payload: any) => {
	try {
		let url = payload.type === 'allUsers'
				? pushNotificationToallUsersUrl
				: pushNotificationToSpecificUsersUrl
		const response = await fetch(
			url,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body: JSON.stringify(payload),
			},
		);
		let activityLogPayload = {
			name: 'sendPushNotification',
			action_type: 'create',
			payload:JSON.stringify({ payload }),
			api_end_point: url,
		}
		createActivityLog(activityLogPayload);
		if (!response.ok) {
			throw new Error('Error occurred during sending common push notification');
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const findOnePromocode = async (promocode: string) => {
	try {
		const response = await fetch(`${findOnePromocodeUrl}?promocode=${promocode}`);
		if (!response.ok) {
			throw new Error(`Error occurred during finding one promocode`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const findPromocodeDetails = async (promocode: string, forPackage: string) => {
	try {
		const response = await fetch(
			`${findPromocodeDetailsUrl}?promocode=${promocode}&packageId=${forPackage}`,
		);
		if (!response.ok) {
			throw new Error(`Error occurred during finding promocode details`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const addBinMapping = async (payload: any, withCardType = true) => {
	try {
		if (withCardType) {
			const response = await fetch(addBinMappingUrl, {
				method: 'POST',
				body: JSON.stringify(payload),
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${Cookies.get('token')}`,
				},
			});
			let activityLogPayload = {
				name: 'addBinMapping',
				action_type: 'create',
				payload:JSON.stringify({ payload }),
				api_end_point: addBinMappingUrl,
			}
			createActivityLog(activityLogPayload);
			if (!response.ok) {
				throw new Error(`Error occurred during creating bin mapping with card type`);
			}
			const result = await response.json();
			return result;
		} else {
			const response = await fetch(addListOfBinsUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body: JSON.stringify(payload),
			});
			let activityLogPayload = {
				name: 'addBinMapping',
				action_type: 'create',
				payload:JSON.stringify({ payload }),
				api_end_point: addListOfBinsUrl,
			}
			createActivityLog(activityLogPayload);
			if (!response.ok) {
				throw new Error(`Error occurred during creating bin mapping without card type`);
			}
			const result = await response.json();
			return result;
		}
	} catch (err) {
		throw err;
	}
};

export const getBlogs = async (
	type: string = 'all',
	offset: number,
	limit: number,
): Promise<{ list: Blog[]; count: number }> => {
	try {
		const response = await fetch(`${blogsUrl}?type=${type}&offset=${offset}&limit=${limit}`);
		if (!response.ok) {
			throw new Error(`Error occurred during fetching blogs`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const updateBlog = async (blog: any): Promise<any> => {
	try {
		const response = await fetch(`${blogsUrl}/update/${blog.id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(blog),
		});
		let activityLogPayload = {
			name: 'updateBlog, services.ts',
			action_type: 'update',
			payload: JSON.stringify(blog),
			api_end_point: `${blogsUrl}/update/${blog.id}`,
		};
		createActivityLog(activityLogPayload);
		if (!response.ok) {
			throw new Error(`Error occurred during updating blog`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const togglePublishBlog = async (id: number) => {
	try {
		const response = await fetch(`${blogsUrl}/toggle-approved/${id}`, {
			method: 'PATCH',
		});
		let activityLogPayload = {
			name: 'togglePublishBlog, services.ts',
			action_type: 'update',
			payload: JSON.stringify({ id }),
			api_end_point: `${blogsUrl}/toggle-approved/${id}`,
		};
		createActivityLog(activityLogPayload);
		if (!response.ok) {
			throw new Error(`Error occurred during toggling approval of blog`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const uploadFile = async (file: any) => {
	try {
		const formData = new FormData();
		formData.append('files', file);
		formData.append('size', file.size);
		const response = await fetch('https://api.kabbik.com/v3/audiobooks/upload-image-in-stack', {
			method: 'POST',
			body: formData,
		});
		let activityLogPayload = {
			name: 'upload File',
			action_type: 'create',
			payload:JSON.stringify({ formData }),
			api_end_point: `api.kabbik.com/v3/audiobooks/upload-image-in-stack`,
		}
		createActivityLog(activityLogPayload);
		const res = await response.json();
		return res.image_file_url;
	} catch (err) {
		console.error(err);
		return false;
	}
};

export const getPackageWiseRevenue = async (startDate: string, endDate: string) => {
	try {
		const response = await fetch(
			`${getPackageWiseRevenueUrl}?startDate=${startDate}&endDate=${endDate}`,
		);
		if (!response.ok) {
			throw new Error(`Error occurred during fetching package wise revenue`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const postBlog = async (payload: any) => {
	try {
		const response = await fetch(`${blogsUrl}/create`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ ...payload, userId: 2820 }),
		});
		let activityLogPayload = {
			name: 'Create Blog',
			action_type: 'create',
			payload:JSON.stringify({ ...payload, userId: 2820 }),
			api_end_point: `${blogsUrl}/create`,
		}
		createActivityLog(activityLogPayload);
		if (!response.ok) {
			throw new Error(`Error occurred during creating blog`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err);
	}
};
