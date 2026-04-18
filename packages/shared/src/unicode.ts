/**
 * SRS-FUNC-007 に合わせ、JavaScript の文字列を Unicode コードポイント単位で数える。
 */
export function countUnicodeCodePoints(input: string): number {
	return [...input].length;
}
