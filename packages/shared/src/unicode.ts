import { MESSAGE_BODY_MAX_CODE_POINTS } from "./constants.js";

/**
 * SRS-FUNC-007 に合わせ、JavaScript の文字列を Unicode コードポイント単位で数える。
 */
export function countUnicodeCodePoints(input: string): number {
	return [...input].length;
}

/** コードポイント数が max を超えないよう先頭から切り詰める（SRS-FUNC-007） */
export function truncateToMaxCodePoints(
	input: string,
	max = MESSAGE_BODY_MAX_CODE_POINTS,
): string {
	const codePoints = [...input];
	if (codePoints.length <= max) {
		return input;
	}
	return codePoints.slice(0, max).join("");
}
