'use client';
import Loader from '@/components/Loader';
import { useState } from 'react';
import Cookies from 'js-cookie';
export default function MapBin({ searchParams }: any) {
	let token = Cookies.get('token');
	const [loading, setLoading] = useState(false);
	const [dummy, setDummy] = useState([]);

	const [promoType, setPromoType] = useState('');
	const [binNumber, setBinNumber] = useState('');
	const [insertedData, setInsertedData] = useState<any>([]);

	const handleAddSingleBinNumber = async () => {};

	const handleRemoveItem = (index: any) => {
		const tempArr = dummy;

		const item: any = tempArr[index];

		let removeItem = dummy.filter((el: any) => el.bin_number !== item.bin_number);

		setDummy(removeItem);
	};

	return <>{loading ? <Loader /> : <></>}</>;
}
