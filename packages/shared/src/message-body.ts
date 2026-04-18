import { z } from "zod";

import { MESSAGE_BODY_MAX_CODE_POINTS, NUL_CHARACTER } from "./constants.js";
import { countUnicodeCodePoints } from "./unicode.js";

/**
 * 投稿本文（クライアント送信・サーバ配信で共通の制約）。
 * SRS-FUNC-001（空でないとき送信）、SRS-FUNC-007〜008。
 */
export const postMessageBodySchema = z
	.string()
	.min(1)
	.refine(
		(body) => !body.includes(NUL_CHARACTER),
		"body must not contain NUL (U+0000)",
	)
	.refine(
		(body) => countUnicodeCodePoints(body) <= MESSAGE_BODY_MAX_CODE_POINTS,
		`body must be at most ${MESSAGE_BODY_MAX_CODE_POINTS} Unicode code points`,
	);

export type PostMessageBody = z.infer<typeof postMessageBodySchema>;
