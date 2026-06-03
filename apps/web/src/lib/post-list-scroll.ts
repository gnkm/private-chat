const DEFAULT_NEAR_BOTTOM_THRESHOLD_PX = 48;

/** 一覧末尾付近にいるか（新着の自動スクロール判定用） */
export function isNearScrollBottom(
	scrollTop: number,
	scrollHeight: number,
	clientHeight: number,
	thresholdPx = DEFAULT_NEAR_BOTTOM_THRESHOLD_PX,
): boolean {
	return scrollHeight - scrollTop - clientHeight <= thresholdPx;
}

export function scrollElementToBottom(element: HTMLElement): void {
	element.scrollTop = element.scrollHeight;
}
