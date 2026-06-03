import type { BundledLanguage } from "shiki";
import { createHighlighter } from "shiki";

import { loadAppConfig } from "../config/load-app-config.js";

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

type HighlighterCache = {
	configKey: string;
	highlighter: ShikiHighlighter;
};

let highlighterCache: Promise<HighlighterCache> | undefined;

function getConfigKey(
	config: Awaited<ReturnType<typeof loadAppConfig>>,
): string {
	return `${config.shiki.light}:${config.shiki.dark}`;
}

async function getHighlighterCache(): Promise<HighlighterCache> {
	const config = await loadAppConfig();
	const configKey = getConfigKey(config);

	if (highlighterCache) {
		try {
			const cached = await highlighterCache;
			if (cached.configKey === configKey) {
				return cached;
			}
		} catch {
			highlighterCache = undefined;
		}
	}

	const promise = createHighlighter({
		themes: [config.shiki.light, config.shiki.dark],
		langs: [...PRELOADED_LANGS, FALLBACK_LANG],
	}).then((highlighter) => ({ configKey, highlighter }));

	highlighterCache = promise.catch((error) => {
		highlighterCache = undefined;
		throw error;
	});

	return highlighterCache;
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
	const [config, { highlighter }] = await Promise.all([
		loadAppConfig(),
		getHighlighterCache(),
	]);
	const lang = await resolveLanguage(highlighter, language);

	return highlighter.codeToHtml(code, {
		lang: lang as BundledLanguage,
		themes: {
			light: config.shiki.light,
			dark: config.shiki.dark,
		},
	});
}

/** テスト用: ハイライタキャッシュを破棄する */
export function resetShikiHighlighterCache(): void {
	highlighterCache = undefined;
}
