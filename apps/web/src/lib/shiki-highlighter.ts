import type { BundledLanguage } from "shiki";
import { createHighlighter } from "shiki";

/** ライトモード用テーマ（GitHub 風・読みやすいコントラスト） */
export const SHIKI_LIGHT_THEME = "github-light";

/** ダークモード用テーマ（stone 背景と調和するダークトーン） */
export const SHIKI_DARK_THEME = "github-dark";

const PRELOADED_LANGS = [
	"javascript",
	"typescript",
	"python",
	"bash",
	"json",
	"css",
	"html",
	"markdown",
	"yaml",
] as const;

const FALLBACK_LANG = "plaintext";

const LANGUAGE_ALIASES: Record<string, string> = {
	js: "javascript",
	ts: "typescript",
	py: "python",
	sh: "bash",
	shell: "bash",
	yml: "yaml",
	md: "markdown",
};

type ShikiHighlighter = Awaited<ReturnType<typeof createHighlighter>>;

let highlighterPromise: Promise<ShikiHighlighter> | undefined;

function getHighlighter(): Promise<ShikiHighlighter> {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighter({
			themes: [SHIKI_LIGHT_THEME, SHIKI_DARK_THEME],
			langs: [...PRELOADED_LANGS, FALLBACK_LANG],
		});
	}
	return highlighterPromise;
}

async function resolveLanguage(
	highlighter: ShikiHighlighter,
	language: string | null,
): Promise<string> {
	if (!language) {
		return FALLBACK_LANG;
	}

	const normalized = language.trim().toLowerCase();
	const resolved = LANGUAGE_ALIASES[normalized] ?? normalized;

	if (highlighter.getLoadedLanguages().includes(resolved)) {
		return resolved;
	}

	try {
		await highlighter.loadLanguage(resolved as BundledLanguage);
		return resolved;
	} catch {
		return FALLBACK_LANG;
	}
}

export async function highlightCode(
	code: string,
	language: string | null,
): Promise<string> {
	const highlighter = await getHighlighter();
	const lang = await resolveLanguage(highlighter, language);

	return highlighter.codeToHtml(code, {
		lang: lang as BundledLanguage,
		themes: {
			light: SHIKI_LIGHT_THEME,
			dark: SHIKI_DARK_THEME,
		},
	});
}
