import { z } from "zod";

import {
	DEFAULT_REACTION_EMOJIS,
	REACTION_EMOJIS,
	normalizeReactionEmojis,
} from "./reaction-config.js";

export { DEFAULT_REACTION_EMOJIS, REACTION_EMOJIS };

/** 設定で許可されたリアクション絵文字（実行時に決まる） */
export type ReactionEmoji = string;

export type ReactionCount = {
	emoji: ReactionEmoji;
	count: number;
};

export type ClientReactionPayload = {
	type: "reaction";
	postId: string;
	emoji: ReactionEmoji;
	displayName: string;
};

export type ServerReactionsFrame = {
	type: "reactions";
	postId: string;
	reactions: ReactionCount[];
};

export type ReactionRoster = Map<ReactionEmoji, Set<string>>;

export type ReactionSchemas = {
	readonly allowedEmojis: readonly string[];
	reactionEmojiSchema: z.ZodEnum<[string, ...string[]]>;
	reactionCountSchema: z.ZodObject<{
		emoji: z.ZodEnum<[string, ...string[]]>;
		count: z.ZodNumber;
	}>;
	clientReactionPayloadSchema: z.ZodObject<{
		type: z.ZodLiteral<"reaction">;
		postId: z.ZodString;
		emoji: z.ZodEnum<[string, ...string[]]>;
		displayName: z.ZodString;
	}>;
	serverReactionsFrameSchema: z.ZodObject<{
		type: z.ZodLiteral<"reactions">;
		postId: z.ZodString;
		reactions: z.ZodArray<
			z.ZodObject<{
				emoji: z.ZodEnum<[string, ...string[]]>;
				count: z.ZodNumber;
			}>
		>;
	}>;
};

export function createReactionSchemas(
	emojis: readonly string[] = DEFAULT_REACTION_EMOJIS,
): ReactionSchemas {
	const allowedEmojis = normalizeReactionEmojis(emojis);
	const tuple = allowedEmojis as [string, ...string[]];
	const reactionEmojiSchema = z.enum(tuple);

	const reactionCountSchema = z
		.object({
			emoji: reactionEmojiSchema,
			count: z.number().int().nonnegative(),
		})
		.strict();

	const clientReactionPayloadSchema = z
		.object({
			type: z.literal("reaction"),
			postId: z.string().min(1),
			emoji: reactionEmojiSchema,
			displayName: z.string(),
		})
		.strict();

	const serverReactionsFrameSchema = z
		.object({
			type: z.literal("reactions"),
			postId: z.string().min(1),
			reactions: z.array(reactionCountSchema),
		})
		.strict();

	return {
		allowedEmojis,
		reactionEmojiSchema,
		reactionCountSchema,
		clientReactionPayloadSchema,
		serverReactionsFrameSchema,
	};
}

const defaultReactionSchemas = createReactionSchemas();

export const {
	allowedEmojis: DEFAULT_ALLOWED_REACTION_EMOJIS,
	reactionEmojiSchema,
	reactionCountSchema,
	clientReactionPayloadSchema,
	serverReactionsFrameSchema,
} = defaultReactionSchemas;

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
	allowedEmojis: readonly string[] = defaultReactionSchemas.allowedEmojis,
): ReactionCount[] {
	const counts: ReactionCount[] = [];
	for (const emoji of allowedEmojis) {
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
