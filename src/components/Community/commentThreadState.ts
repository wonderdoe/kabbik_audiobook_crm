import type { CommunityCommentNode } from './CommentThread';

export type RepliesSlice = {
	items: CommunityCommentNode[];
	total: number;
	offset: number;
	loading: boolean;
	loadingMore: boolean;
	loaded: boolean;
	hasMore: boolean;
};

export type PostThreadState = {
	roots: CommunityCommentNode[];
	rootsTotal: number;
	rootsLoading: boolean;
	rootsLoadingMore: boolean;
	hasMoreRoots: boolean;
	repliesByParentId: Record<number, RepliesSlice>;
};

export function emptyPostThreadState(): PostThreadState {
	return {
		roots: [],
		rootsTotal: 0,
		rootsLoading: false,
		rootsLoadingMore: false,
		hasMoreRoots: false,
		repliesByParentId: {},
	};
}

export function mapApiComment(row: Record<string, unknown>): CommunityCommentNode {
	return {
		...(row as CommunityCommentNode),
		reply_count: Number(row.reply_count ?? 0),
		children: [],
	};
}

export function attachRepliesToTree(
	roots: CommunityCommentNode[],
	parentId: number,
	replies: CommunityCommentNode[],
	append: boolean,
): CommunityCommentNode[] {
	const walk = (nodes: CommunityCommentNode[]): CommunityCommentNode[] =>
		nodes.map(node => {
			if (node.id === parentId) {
				const prev = append ? node.children ?? [] : [];
				return { ...node, children: [...prev, ...replies] };
			}
			if (node.children?.length) {
				return { ...node, children: walk(node.children) };
			}
			return node;
		});
	return walk(roots);
}

export function removeCommentFromTree(
	roots: CommunityCommentNode[],
	commentId: number,
): CommunityCommentNode[] {
	const walk = (nodes: CommunityCommentNode[]): CommunityCommentNode[] =>
		nodes
			.filter(n => n.id !== commentId)
			.map(n => ({
				...n,
				children: n.children?.length ? walk(n.children) : [],
			}));
	return walk(roots);
}
