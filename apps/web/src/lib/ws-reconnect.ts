/** 指数バックオフのベース待機上限（ジッター前）。architecture §7.3 */
export const RECONNECT_BASE_CAP_MS = 30_000;

/** ジッター上限（一様乱数 0〜500ms） */
export const RECONNECT_JITTER_MAX_MS = 500;

const RECONNECT_INITIAL_BASE_MS = 1_000;

/**
 * 再接続までの待機ミリ秒（ベース＋ジッター）。
 * @param attempt 0 始まりの試行回数（切断ごとに増える）
 */
export function computeReconnectDelayMs(
	attempt: number,
	randomFloat: () => number = Math.random,
): number {
	const exponentialBase = RECONNECT_INITIAL_BASE_MS * 2 ** attempt;
	const base = Math.min(exponentialBase, RECONNECT_BASE_CAP_MS);
	const jitter = Math.min(
		RECONNECT_JITTER_MAX_MS,
		Math.floor(randomFloat() * (RECONNECT_JITTER_MAX_MS + 1)),
	);
	return base + jitter;
}
