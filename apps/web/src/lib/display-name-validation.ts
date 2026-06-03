export const DISPLAY_NAME_REQUIRED_ERROR =
	"表示名を入力してから送信してください。";

export const DISPLAY_NAME_EMPTY_HINT = "送信前に表示名を入力してください。";

export const DISPLAY_NAME_PLACEHOLDER = "例: 太郎";

/** 表示名が未入力（空白のみ含む）か */
export function isDisplayNameBlank(value: string): boolean {
	return value.trim().length === 0;
}
