/** 吹き出し行（本体 + 横向きしっぽ） */
export function getPostBubbleRowClassName(own: boolean): string {
	const side = own ? "own" : "other";
	return `post-bubble-row post-bubble-row--${side} flex w-[85%] items-end`;
}

/** 角丸のメッセージ本体 */
export function getPostBubbleBodyClassName(own: boolean): string {
	const side = own ? "own" : "other";
	return `post-bubble-body post-bubble-body--${side} min-w-0 flex-1 rounded-2xl px-3 py-2`;
}

/** 本体の横につく細い横向き三角形 */
export function getPostBubbleTailClassName(own: boolean): string {
	const side = own ? "own" : "other";
	return `post-bubble-tail post-bubble-tail--${side} shrink-0`;
}
