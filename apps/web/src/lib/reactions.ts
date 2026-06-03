import type {
	ReactionCount,
	ReactionEmoji,
	ServerReactionsFrame,
} from "@private-chat/shared";

export type ReactionsByPostId = Record<string, ReactionCount[]>;

export function applyReactionsFrame(
	prev: ReactionsByPostId,
	frame: ServerReactionsFrame,
): ReactionsByPostId {
	return { ...prev, [frame.postId]: frame.reactions };
}

export function countForEmoji(
	reactions: ReactionCount[] | undefined,
	emoji: ReactionEmoji,
): number {
	return reactions?.find((entry) => entry.emoji === emoji)?.count ?? 0;
}

export function toggleMyReaction(
	prev: ReadonlySet<ReactionEmoji>,
	emoji: ReactionEmoji,
): Set<ReactionEmoji> {
	const next = new Set(prev);
	if (next.has(emoji)) {
		next.delete(emoji);
	} else {
		next.add(emoji);
	}
	return next;
}
