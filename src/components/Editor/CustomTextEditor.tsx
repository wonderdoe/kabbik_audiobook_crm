import { Group, Text } from '@mantine/core';
import {
	ContentBlock,
	convertFromRaw,
	convertToRaw,
	DraftHandleValue,
	Editor,
	EditorState,
	getDefaultKeyBinding,
	RichUtils,
} from 'draft-js';
import React, { Dispatch, SetStateAction } from 'react';

import 'draft-js/dist/Draft.css';
import './CustomTextEditor.css';
import { createToast } from 'helpers/SweetAlert';

const MAX_ALLOWED_CONTENT_LENGTH = 5000;

type TextEditorState = {
	editorState: EditorState;
	currentContentLength: number;
};

type StyleButtonProps = {
	label: string;
	style: string;
	active: boolean;
	onToggle: (style: string) => void;
};

class StyleButton extends React.Component<StyleButtonProps> {
	onToggle = (e: React.MouseEvent) => {
		e.preventDefault();
		this.props.onToggle(this.props.style);
	};

	render() {
		let className = 'RichEditor-styleButton';
		if (this.props.active) {
			className += ' RichEditor-activeButton';
		}

		return (
			<span className={className} onMouseDown={this.onToggle}>
				{this.props.label}
			</span>
		);
	}
}

const BLOCK_TYPES = [
	{ label: 'H1', style: 'header-one' },
	{ label: 'H2', style: 'header-two' },
	{ label: 'H3', style: 'header-three' },
	{ label: 'H4', style: 'header-four' },
	{ label: 'H5', style: 'header-five' },
	{ label: 'H6', style: 'header-six' },
	{ label: 'Blockquote', style: 'blockquote' },
	{ label: 'UL', style: 'unordered-list-item' },
	{ label: 'OL', style: 'ordered-list-item' },
	{ label: 'Code Block', style: 'code-block' },
];

type BlockStyleControlsProps = {
	editorState: EditorState;
	onToggle: (style: string) => void;
};

const BlockStyleControls = ({ editorState, onToggle }: BlockStyleControlsProps) => {
	const selection = editorState.getSelection();
	const blockType = editorState
		.getCurrentContent()
		.getBlockForKey(selection.getStartKey())
		.getType();

	return (
		<div className="RichEditor-controls">
			{BLOCK_TYPES.map(type => (
				<StyleButton
					key={type.label}
					active={type.style === blockType}
					label={type.label}
					onToggle={onToggle}
					style={type.style}
				/>
			))}
		</div>
	);
};

const INLINE_STYLES = [
	{ label: 'Bold', style: 'BOLD' },
	{ label: 'Italic', style: 'ITALIC' },
	{ label: 'Underline', style: 'UNDERLINE' },
	{ label: 'Monospace', style: 'CODE' },
];

type InlineStyleControlsProps = {
	editorState: EditorState;
	onToggle: (style: string) => void;
};

const InlineStyleControls = ({ editorState, onToggle }: InlineStyleControlsProps) => {
	const currentStyle = editorState.getCurrentInlineStyle();

	return (
		<div className="RichEditor-controls">
			{INLINE_STYLES.map(type => (
				<StyleButton
					key={type.label}
					active={currentStyle.has(type.style)}
					label={type.label}
					onToggle={onToggle}
					style={type.style}
				/>
			))}
		</div>
	);
};

export class CustomTextEditor extends React.Component<
	{
		rawBlogContent: any;
		setBlog: Dispatch<SetStateAction<any>>;
	},
	TextEditorState
> {
	private editorRef: React.RefObject<Editor>;

	constructor(props: { rawBlogContent: any; setBlog: Dispatch<SetStateAction<any>> }) {
		super(props);
		this.state = {
			editorState: EditorState.createWithContent(convertFromRaw(this.props.rawBlogContent)),
			currentContentLength: 0,
		};

		this.editorRef = React.createRef();

		this.onChange = this.onChange.bind(this);
		this.handleKeyCommand = this.handleKeyCommand.bind(this);
		this.mapKeyToEditorCommand = this.mapKeyToEditorCommand.bind(this);
		this.toggleBlockType = this.toggleBlockType.bind(this);
		this.toggleInlineStyle = this.toggleInlineStyle.bind(this);
	}

	focus = () => {
		this.editorRef.current?.focus();
	};

	onChange(editorState: EditorState) {
		const currentContent = editorState.getCurrentContent();
		const rawContent = convertToRaw(currentContent);
		const currentContentLength = rawContent.blocks.reduce((acc, b) => acc + b.text.length, 0);
		if (currentContentLength <= MAX_ALLOWED_CONTENT_LENGTH) {
			this.setState({
				editorState,
				currentContentLength,
			});
			this.props.setBlog((prev: any) => ({ ...prev, content_body: rawContent }));
		}
	}

	handleBeforeInput = (_: string, editorState: EditorState): DraftHandleValue => {
		const currentContent = editorState.getCurrentContent();
		const currentLength = currentContent.getPlainText().length;
		if (currentLength >= MAX_ALLOWED_CONTENT_LENGTH) {
			createToast('Content limit exceeded');
			return 'handled';
		}
		return 'not-handled';
	};

	handlePastedText = (
		text: string,
		_html: string | undefined,
		editorState: EditorState,
	): DraftHandleValue => {
		const currentLength = editorState.getCurrentContent().getPlainText().length;
		if (currentLength + text.length > MAX_ALLOWED_CONTENT_LENGTH) {
			createToast('Content limit exceeded');
			return 'handled';
		}
		return 'not-handled';
	};

	handleKeyCommand(command: string, editorState: EditorState): DraftHandleValue {
		const newState = RichUtils.handleKeyCommand(editorState, command);
		if (newState) {
			this.onChange(newState);
			return 'handled';
		}
		return 'not-handled';
	}

	mapKeyToEditorCommand(e: React.KeyboardEvent): string | null {
		if (e.key === 'Tab') {
			const newState = RichUtils.onTab(e, this.state.editorState, 4);
			if (newState !== this.state.editorState) {
				this.onChange(newState);
			}
			return null;
		}
		return getDefaultKeyBinding(e);
	}

	toggleBlockType(blockType: string) {
		this.onChange(RichUtils.toggleBlockType(this.state.editorState, blockType));
	}

	toggleInlineStyle(inlineStyle: string) {
		this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle));
	}

	render() {
		const { editorState } = this.state;
		let className = 'RichEditor-editor';
		const contentState = editorState.getCurrentContent();
		if (!contentState.hasText()) {
			if (contentState.getBlockMap().first()?.getType() !== 'unstyled') {
				className += ' RichEditor-hidePlaceholder';
			}
		}

		return (
			<>
				<Group justify="space-between" dir="row" mb={1}>
					<Text mb={-10} size="sm" c={'#222222'} style={{ fontWeight: '600' }}>
						Content
					</Text>
					<Text mb={-10} size="sm" c={'#222222'} style={{ fontWeight: '600' }}>
						{this.state.currentContentLength} / {MAX_ALLOWED_CONTENT_LENGTH}
					</Text>
				</Group>
				<div className="RichEditor-root">
					<BlockStyleControls editorState={editorState} onToggle={this.toggleBlockType} />
					<InlineStyleControls editorState={editorState} onToggle={this.toggleInlineStyle} />
					<div className={className} onClick={this.focus}>
						<Editor
							blockStyleFn={getBlockStyle}
							customStyleMap={styleMap}
							editorState={editorState}
							handleKeyCommand={this.handleKeyCommand}
							keyBindingFn={this.mapKeyToEditorCommand}
							handleBeforeInput={this.handleBeforeInput}
							handlePastedText={this.handlePastedText}
							onChange={this.onChange}
							placeholder="Write a blog..."
							ref={this.editorRef}
							spellCheck={true}
						/>
					</div>
				</div>
			</>
		);
	}
}

const styleMap: Record<string, React.CSSProperties> = {
	CODE: {
		backgroundColor: 'rgba(0, 0, 0, 0.05)',
		fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
		fontSize: 16,
		padding: 2,
	},
};

function getBlockStyle(block: ContentBlock): string {
	switch (block.getType()) {
		case 'blockquote':
			return 'RichEditor-blockquote';
		default:
			return '';
	}
}
