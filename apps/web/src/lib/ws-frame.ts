import {
	type ServerBroadcastPost,
	serverBroadcastPostSchema,
} from "@private-chat/shared";
import { z } from "zod";

const serverErrorFrameSchema = z
	.object({
		type: z.literal("error"),
		message: z.string().min(1),
	})
	.strict();

export type ParsedWsFrame =
	| { kind: "post"; post: ServerBroadcastPost }
	| { kind: "error"; message: string }
	| { kind: "invalid" };

export function parseWsFrame(raw: string): ParsedWsFrame {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw) as unknown;
	} catch {
		return { kind: "invalid" };
	}

	const postResult = serverBroadcastPostSchema.safeParse(parsed);
	if (postResult.success) {
		return { kind: "post", post: postResult.data };
	}

	const errorResult = serverErrorFrameSchema.safeParse(parsed);
	if (errorResult.success) {
		return { kind: "error", message: errorResult.data.message };
	}

	return { kind: "invalid" };
}
