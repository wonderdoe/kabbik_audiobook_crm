'use client';

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material';
import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';

type ConfirmModalOptions = {
	title: string;
	children?: React.ReactNode;
	labels?: { confirm?: string; cancel?: string };
	onConfirm?: () => void;
	onCancel?: () => void;
};

function ConfirmDialogHost({
	options,
	onClose,
}: {
	options: ConfirmModalOptions;
	onClose: () => void;
}) {
	const [open, setOpen] = useState(true);

	const close = () => {
		setOpen(false);
		onClose();
	};

	return (
		<Dialog open={open} onClose={close} maxWidth="xs" sx={{ width: "100%" }} TransitionProps={{ timeout: 200 }}>
			<DialogTitle>{options.title}</DialogTitle>
			{options.children && (
				<DialogContent>
					{typeof options.children === 'string' ? (
						<DialogContentText>{options.children}</DialogContentText>
					) : (
						options.children
					)}
				</DialogContent>
			)}
			<DialogActions>
				<Button
					onClick={() => {
						options.onCancel?.();
						close();
					}}
				>
					{options.labels?.cancel ?? 'Cancel'}
				</Button>
				<Button
					variant="contained"
					onClick={() => {
						options.onConfirm?.();
						close();
					}}
					autoFocus
				>
					{options.labels?.confirm ?? 'Confirm'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

let container: HTMLDivElement | null = null;

export const modals = {
	openConfirmModal: (options: ConfirmModalOptions) => {
		if (typeof document === 'undefined') return;
		if (!container) {
			container = document.createElement('div');
			document.body.appendChild(container);
		}
		const root = createRoot(container);
		const unmount = () => {
			root.unmount();
		};
		root.render(<ConfirmDialogHost options={options} onClose={unmount} />);
	},
};
