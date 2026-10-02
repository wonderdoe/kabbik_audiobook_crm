import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import { getNavLinks } from '@/config';
import { DRAWER_WIDTH, DRAWER_WIDTH_MINI } from '@/styles/muiTheme';
import { Navbar } from './Navbar';

const meta: Meta<typeof Navbar> = {
	title: 'Components/Navbar',
	component: Navbar,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
	},
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
	render: () => (
		<Box sx={{ width: DRAWER_WIDTH, bgcolor: 'background.paper', minHeight: 400, borderRight: 1, borderColor: 'divider' }}>
			<Navbar toggle={() => {}} data={getNavLinks()} />
		</Box>
	),
};

export const Mini: Story = {
	render: () => (
		<Box
			sx={{
				width: DRAWER_WIDTH_MINI,
				bgcolor: 'background.paper',
				minHeight: 400,
				borderRight: 1,
				borderColor: 'divider',
			}}
		>
			<Navbar toggle={() => {}} data={getNavLinks()} mini />
		</Box>
	),
};
