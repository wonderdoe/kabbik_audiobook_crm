'use client';

import {
	Box,
	Button,
	Card,
	CardContent,
	Stack,
	Typography,
} from '@mui/material';
import { DataSelect } from '@/components/Form/DataSelect';
import { IconArrowRight, IconArrowUp } from '@tabler/icons-react';
import classes from './Dashboard.module.css';
import { BalanceChart } from './BalanceChart';

const BalanceLeftStack = () => (
	<Stack spacing={2} style={{ flex: 1 }}>
		<Stack spacing={4}>
			<Typography variant="caption" color="gray.6">
				Availabel Balance
			</Typography>
			<Box sx={{ height: 2 }} />
			<Typography variant="h6" component="h3">$ 9572.23</Typography>
			<Typography variant="body2" color="gray.5">
				+ 0.0012.23(0.2%)
				<span>
					<IconArrowUp size={12} color="green" />
				</span>
			</Typography>
		</Stack>

		<Stack direction="row" alignItems="center">
			<Stack spacing={2}>
				<Typography variant="body2" color="gray.6">
					Income
				</Typography>
				<Typography variant="subtitle2" component="h5">$ 5729.28</Typography>
			</Stack>
			<Stack spacing={2}>
				<Typography variant="body2" color="gray.6">
					Expense
				</Typography>
				<Typography variant="subtitle2" component="h5">$ 1329.89</Typography>
			</Stack>
		</Stack>
		<Button size="small" sx={{ width: 140 }} endIcon={<IconArrowRight size={14} />}>
			View more
		</Button>
	</Stack>
);

const BalanceRightStack = () => (
	<Stack style={{ flex: 1 }}>
		<Stack alignItems="start" spacing={2}>
			<Typography variant="body2" color="gray.6">
				Etherum
			</Typography>
			<Typography variant="subtitle2" component="h5">
				1.5236 ETH ={' '}
				<Typography component="span" variant="body1" fontWeight="bold" color="gray.6">
					$1123.64
				</Typography>
			</Typography>
		</Stack>
		<Stack alignItems="start" spacing={2}>
			<Typography variant="body2" color="gray.6">
				Bitcoin
			</Typography>
			<Typography variant="subtitle2" component="h5">
				0.0236 BTC ={' '}
				<Typography component="span" variant="body1" fontWeight="bold" color="gray.6">
					$923.64
				</Typography>
			</Typography>
		</Stack>
		<Stack alignItems="start" spacing={2}>
			<Typography variant="body2" color="gray.6">
				Doge
			</Typography>
			<Typography variant="subtitle2" component="h5">
				2210 DOGE ={' '}
				<Typography component="span" variant="body1" fontWeight="bold" color="gray.6">
					$112.64
				</Typography>
			</Typography>
		</Stack>
	</Stack>
);

export function BalanceCard() {
	return (
		<Card sx={{ borderRadius: 2 }}>
			<CardContent className={classes.section}>
				<Typography variant="subtitle2" component="h5">Wallet Balance</Typography>
				<DataSelect
					value="march"
					data={[
						{ value: 'march', label: 'March' },
						{ value: 'april', label: 'April' },
					]}
				/>
			</CardContent>
			<CardContent className={classes.section}>
				<BalanceChart />
			</CardContent>
		</Card>
	);
}
