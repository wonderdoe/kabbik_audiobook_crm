export const combineBanglaEnglishName = (bangla: string | null, english: string | null) => {
	if (bangla && english) return `${bangla} ${english}`;
	if (bangla) return bangla;
	return english;
};

export const imageLoader = ({ src, width, quality }: any) => {
	return `${src}?w=${width}&q=${quality || 75}`;
};

export const getTotalPageNumber = (noOfItems: number) => {
	const extra = Number((noOfItems / 10).toString().split('.')[1]);
	return noOfItems / 10 + (isNaN(extra) ? 0 : 1);
};

export const formatPhoneNumber = (phoneNumber: string) => {
	let refinedPhoneNumber = phoneNumber?.replace(/[^\w]/gi, '');
	if (refinedPhoneNumber?.startsWith('880')) {
		return refinedPhoneNumber?.slice(refinedPhoneNumber?.indexOf('0'));
	}
	return refinedPhoneNumber;
};

export const actualCharacterCountWithoutHTMLTagFromBlog = (s: string) => {
	const result = s?.replace(/<[^>]+>/g, '');
	return result?.length;
};
