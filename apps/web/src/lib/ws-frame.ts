import {
	type Participant,
	type ServerBroadcastPost,
	type ServerReactionsFrame,
	serverBroadcastPostSchema,
	serverParticipantsFrameSchema,
	serverReactionsFrameSchema,
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
	| { kind: "participants"; participants: Participant[] }
	| { kind: "reactions"; frame: ServerReactionsFrame }
	| { kind: "error"; message: string }
	| { kind: "invalid" };

export function parseWsFrame(raw: string): ParsedWsFrame {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw) as unknown;
	} catch {
		return { kind: "invalid" };
	}

	const participantsResult = serverParticipantsFrameSchema.safeParse(parsed);
	if (participantsResult.success) {
		return {
			kind: "participants",
			participants: participantsResult.data.participants,
		};
	}

	const reactionsResult = serverReactionsFrameSchema.safeParse(parsed);
	if (reactionsResult.success) {
		return { kind: "reactions", frame: reactionsResult.data };
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
