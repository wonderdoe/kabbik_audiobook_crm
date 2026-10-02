'use client';

import {
	Autocomplete,
	Box,
	InputAdornment,
	TextField,
	Typography,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
	filterNavSearchOptions,
	formatNavSearchLabel,
	NavSearchOption,
} from '@/helper/flatten-nav-links';

type NavMenuSearchProps = {
	options: NavSearchOption[];
	fullWidth?: boolean;
	sx?: object;
	onNavigate?: () => void;
};

export function NavMenuSearch({ options, fullWidth = false, sx, onNavigate }: NavMenuSearchProps) {
	const router = useRouter();
	const [inputValue, setInputValue] = useState('');
	const [value, setValue] = useState<NavSearchOption | null>(null);

	const filteredOptions = useMemo(
		() => filterNavSearchOptions(options, inputValue),
		[options, inputValue],
	);

	return (
		<Autocomplete
			value={value}
			inputValue={inputValue}
			onInputChange={(_, newInput, reason) => {
				if (reason === 'reset') {
					setInputValue('');
					return;
				}
				setInputValue(newInput);
			}}
			onChange={(_, option) => {
				if (!option) return;
				setValue(null);
				setInputValue('');
				onNavigate?.();
				router.push(option.link);
			}}
			options={inputValue.trim() ? filteredOptions : options}
			filterOptions={(opts, state) => filterNavSearchOptions(opts, state.inputValue)}
			getOptionLabel={formatNavSearchLabel}
			isOptionEqualToValue={(a, b) => a.link === b.link}
			noOptionsText="No matching pages"
			autoHighlight
			clearOnBlur
			handleHomeEndKeys
			size="small"
			fullWidth={fullWidth}
			sx={{
				width: fullWidth ? '100%' : { xs: '100%', md: 220, lg: 280 },
				minWidth: 0,
				flex: fullWidth ? undefined : { xs: 1, md: 'none' },
				...sx,
			}}
			slotProps={{
				popper: {
					modifiers: [{ name: 'offset', options: { offset: [0, 4] } }],
				},
			}}
			renderOption={(props, option) => {
				const { key, ...rest } = props;
				return (
					<Box component="li" key={key} {...rest}>
						<Box>
							<Typography variant="body2">{option.label}</Typography>
							{option.group && (
								<Typography variant="caption" color="text.secondary">
									{option.group}
								</Typography>
							)}
						</Box>
					</Box>
				);
			}}
			renderInput={params => (
				<TextField
					{...params}
					placeholder="Search pages…"
					InputProps={{
						...params.InputProps,
						startAdornment: (
							<>
								<InputAdornment position="start">
									<SearchOutlinedIcon fontSize="small" color="action" />
								</InputAdornment>
								{params.InputProps.startAdornment}
							</>
						),
					}}
					sx={{
						'& .MuiOutlinedInput-root': { bgcolor: 'grey.100', borderRadius: 1 },
					}}
				/>
			)}
		/>
	);
}
