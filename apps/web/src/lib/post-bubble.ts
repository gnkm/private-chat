/** 投稿者名 + 吹き出しの縦並びコンテナ */
export function getPostMessageColumnClassName(own: boolean): string {
	const side = own ? "own" : "other";
	return `post-message post-message--${side} flex w-[85%] flex-col ${
		own ? "items-end" : "items-start"
	}`;
}

/** 投稿者名・投稿日（吹き出しの外） */
export function getPostMetaClassName(own: boolean): string {
	return `post-meta mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0 px-0.5 text-xs ${
		own ? "justify-end" : "justify-start"
	}`;
}

export function getPostAuthorNameClassName(): string {
	return "post-author-name font-semibold text-stone-600 dark:text-stone-400";
}

export function getPostSentAtClassName(): string {
	return "post-sent-at text-stone-500 dark:text-stone-500";
}

/** 吹き出し行（本体 + 横向きしっぽ） */
export function getPostBubbleRowClassName(own: boolean): string {
	const side = own ? "own" : "other";
	return `post-bubble-row post-bubble-row--${side} flex w-full items-end`;
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
