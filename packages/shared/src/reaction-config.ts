import { countUnicodeCodePoints } from "./unicode.js";

/** 設定未指定時のリアクション絵文字（Slack 風 4 種） */
export const DEFAULT_REACTION_EMOJIS = ["👍", "🙏", "👀", "✨"] as const;

/** @deprecated {@link DEFAULT_REACTION_EMOJIS} を利用してください */
export const REACTION_EMOJIS = DEFAULT_REACTION_EMOJIS;

export const MAX_REACTION_EMOJIS = 32;

/** 1 Unicode コードポイントの絵文字のみ許可し、重複を除いて順序を保つ（👍🏽・国旗・ZWJ 連結は除外） */
export function normalizeReactionEmojis(emojis: readonly string[]): string[] {
	const seen = new Set<string>();
	const result: string[] = [];

	for (const emoji of emojis) {
		if (countUnicodeCodePoints(emoji) !== 1) {
			continue;
		}
		if (seen.has(emoji)) {
			continue;
		}
		seen.add(emoji);
		result.push(emoji);
		if (result.length >= MAX_REACTION_EMOJIS) {
			break;
		}
	}

	if (result.length === 0) {
		return [...DEFAULT_REACTION_EMOJIS];
	}

	return result;
}
