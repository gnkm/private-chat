/**
 * SRS-FUNC-007: 投稿本文の最大長。単位は Unicode コードポイント。
 */
export const MESSAGE_BODY_MAX_CODE_POINTS = 12_000;

/**
 * SRS-FUNC-008: 本文に含めてはならない文字（U+0000）。
 */
export const NUL_CHARACTER = "\u0000";
