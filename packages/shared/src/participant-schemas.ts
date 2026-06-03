import { z } from "zod";

import { clientPostPayloadSchema } from "./message-schemas.js";

/** クライアント → サーバ（表示名登録）。blur / 接続時に送信。 */
export const clientSetDisplayNameSchema = z
	.object({
		type: z.literal("setDisplayName"),
		displayName: z.string(),
	})
	.strict();

export type ClientSetDisplayNamePayload = z.infer<
	typeof clientSetDisplayNameSchema
>;

export const participantSchema = z
	.object({
		id: z.string().min(1),
		displayName: z.string().min(1),
	})
	.strict();

export type Participant = z.infer<typeof participantSchema>;

/** サーバ → クライアント（参加者一覧スナップショット）。 */
export const serverParticipantsFrameSchema = z
	.object({
		type: z.literal("participants"),
		participants: z.array(participantSchema),
	})
	.strict();

export type ServerParticipantsFrame = z.infer<
	typeof serverParticipantsFrameSchema
>;

export const clientInboundMessageSchema = z.union([
	clientSetDisplayNameSchema,
	clientPostPayloadSchema,
]);

export type ClientInboundMessage = z.infer<typeof clientInboundMessageSchema>;

export function isSetDisplayNameMessage(
	message: ClientInboundMessage,
): message is ClientSetDisplayNamePayload {
	return "type" in message && message.type === "setDisplayName";
}
