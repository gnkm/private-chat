import { z } from "zod";

/** Slack 風リアクションで利用可能な絵文字（固定 4 種） */
export const REACTION_EMOJIS = ["👍", "🙏", "👀", "✨"] as const;

export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

export const reactionEmojiSchema = z.enum(REACTION_EMOJIS);

export const reactionCountSchema = z
	.object({
		emoji: reactionEmojiSchema,
		count: z.number().int().nonnegative(),
	})
	.strict();

export type ReactionCount = z.infer<typeof reactionCountSchema>;

/** クライアント → サーバ（リアクションのトグル） */
export const clientReactionPayloadSchema = z
	.object({
		type: z.literal("reaction"),
		postId: z.string().min(1),
		emoji: reactionEmojiSchema,
		displayName: z.string(),
	})
	.strict();

export type ClientReactionPayload = z.infer<typeof clientReactionPayloadSchema>;

/** サーバ → クライアント（投稿ごとのリアクション集計） */
export const serverReactionsFrameSchema = z
	.object({
		type: z.literal("reactions"),
		postId: z.string().min(1),
		reactions: z.array(reactionCountSchema),
	})
	.strict();

export type ServerReactionsFrame = z.infer<typeof serverReactionsFrameSchema>;

export type ReactionRoster = Map<ReactionEmoji, Set<string>>;

export function toggleReactionOnRoster(
	roster: ReactionRoster,
	emoji: ReactionEmoji,
	displayName: string,
): ReactionRoster {
	const next = new Map(roster);
	const users = new Set(next.get(emoji) ?? []);
	if (users.has(displayName)) {
		users.delete(displayName);
	} else {
		users.add(displayName);
	}
	if (users.size === 0) {
		next.delete(emoji);
	} else {
		next.set(emoji, users);
	}
	return next;
}

export function reactionCountsFromRoster(
	roster: ReactionRoster,
): ReactionCount[] {
	const counts: ReactionCount[] = [];
	for (const emoji of REACTION_EMOJIS) {
		const size = roster.get(emoji)?.size ?? 0;
		if (size > 0) {
			counts.push({ emoji, count: size });
		}
	}
	return counts;
}

/**
 * 投稿 payload（`type` なし）と判別するため、引数は `ClientInboundMessage` ではなく
 * `unknown` とする。`{ type?: string }` だと TypeScript が投稿型を引数に渡せず
 * サーバビルドが失敗する。
 */
export function isReactionMessage(
	message: unknown,
): message is ClientReactionPayload {
	return (
		typeof message === "object" &&
		message !== null &&
		"type" in message &&
		(message as { type: unknown }).type === "reaction"
	);
}
