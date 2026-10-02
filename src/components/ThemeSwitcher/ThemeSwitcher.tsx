'use client';

import {
	FormControl,
	FormControlLabel,
	FormLabel,
	Radio,
	RadioGroup,
	Stack,
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

export const ThemeSwitcher = () => {
	const { mode, setMode } = useColorScheme();

	return (
		<FormControl>
			<FormLabel>Theme Mode</FormLabel>
			<RadioGroup
				row
				value={mode ?? 'light'}
				onChange={e => setMode(e.target.value as 'light' | 'dark')}
				name="theme"
			>
				<Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
					<FormControlLabel value="light" control={<Radio />} label="Light" />
					<FormControlLabel value="dark" control={<Radio />} label="Dark" />
				</Stack>
			</RadioGroup>
		</FormControl>
	);
};
