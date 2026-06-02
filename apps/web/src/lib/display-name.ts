/** localStorage キー（SRS-UI-004） */
export const DISPLAY_NAME_STORAGE_KEY = "private-chat.displayName";

export function loadDisplayName(): string {
	try {
		return localStorage.getItem(DISPLAY_NAME_STORAGE_KEY) ?? "";
	} catch {
		return "";
	}
}

export function saveDisplayName(name: string): void {
	try {
		localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, name);
	} catch {
		// quota / private mode — 永続化はベストエフォート
	}
}
