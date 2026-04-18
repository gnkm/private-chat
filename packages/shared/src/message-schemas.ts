import { z } from "zod";

import { postMessageBodySchema } from "./message-body.js";

/**
 * クライアント → サーバ（投稿）。architecture §7.2。
 * `id` / `sentAt` は含めない（`.strict()` で拒否）。
 */
export const clientPostPayloadSchema = z
	.object({
		displayName: z.string(),
		body: postMessageBodySchema,
	})
	.strict();

export type ClientPostPayload = z.infer<typeof clientPostPayloadSchema>;

const iso8601DateTimeSchema = z.string().datetime({
	message: "sentAt must be a parseable ISO 8601 date-time string",
});

/**
 * サーバ → クライアント（ブロードキャストの完成形）。architecture §7.2。
 */
export const serverBroadcastPostSchema = z
	.object({
		id: z.string().min(1),
		displayName: z.string(),
		body: postMessageBodySchema,
		sentAt: iso8601DateTimeSchema,
	})
	.strict();

export type ServerBroadcastPost = z.infer<typeof serverBroadcastPostSchema>;
