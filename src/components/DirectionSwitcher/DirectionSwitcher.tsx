'use client';

import {
	FormControl,
	FormControlLabel,
	FormLabel,
	Radio,
	RadioGroup,
	Stack,
} from '@mui/material';
import { useEffect, useState } from 'react';

export const DirectionSwitcher = () => {
	const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');

	useEffect(() => {
		const stored = (typeof document !== 'undefined' && document.documentElement.dir) || 'ltr';
		setDir(stored === 'rtl' ? 'rtl' : 'ltr');
	}, []);

	const setDirection = (value: 'ltr' | 'rtl') => {
		setDir(value);
		if (typeof document !== 'undefined') {
			document.documentElement.dir = value;
		}
	};

	return (
		<FormControl>
			<FormLabel>Direction</FormLabel>
			<RadioGroup row value={dir} onChange={e => setDirection(e.target.value as 'ltr' | 'rtl')} name="direction">
				<Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
					<FormControlLabel value="ltr" control={<Radio />} label="LTR" />
					<FormControlLabel value="rtl" control={<Radio />} label="RTL" />
				</Stack>
			</RadioGroup>
		</FormControl>
	);
};
