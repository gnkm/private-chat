/** localStorage キー（ライト／ダークのユーザー設定） */
export const COLOR_SCHEME_STORAGE_KEY = "private-chat.colorScheme";

export type ColorScheme = "light" | "dark";

export function loadColorScheme(): ColorScheme | null {
	try {
		const raw = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
		if (raw === "light" || raw === "dark") {
			return raw;
		}
		return null;
	} catch {
		return null;
	}
}

export function saveColorScheme(scheme: ColorScheme): void {
	try {
		localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
	} catch {
		// quota / private mode — 永続化はベストエフォート
	}
}

export function getPreferredColorScheme(): ColorScheme {
	const stored = loadColorScheme();
	if (stored) {
		return stored;
	}
	if (
		typeof window === "undefined" ||
		typeof window.matchMedia !== "function"
	) {
		return "light";
	}
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

export function applyColorSchemeToDocument(scheme: ColorScheme): void {
	const root = document.documentElement;
	if (scheme === "dark") {
		root.classList.add("dark");
		return;
	}
	root.classList.remove("dark");
}

export function toggleColorScheme(current: ColorScheme): ColorScheme {
	return current === "dark" ? "light" : "dark";
}

export function getThemeToggleLabel(scheme: ColorScheme): string {
	return scheme === "dark"
		? "ライトモードに切り替え"
		: "ダークモードに切り替え";
}
