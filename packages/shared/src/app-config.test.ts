import { describe, expect, it } from "vitest";

import {
	DEFAULT_APP_CONFIG,
	parseAppConfig,
	parseAppConfigText,
} from "./app-config.js";

describe("parseAppConfig", () => {
	it("uses defaults when reactions are omitted", () => {
		expect(parseAppConfig({ shiki: { light: "a", dark: "b" } })).toEqual({
			shiki: { light: "a", dark: "b" },
			reactions: { emojis: [...DEFAULT_APP_CONFIG.reactions.emojis] },
		});
	});

	it("merges custom reaction emojis and deduplicates", () => {
		expect(
			parseAppConfig({
				reactions: { emojis: ["🔥", "👍", "🔥", "abc"] },
			}),
		).toEqual({
			shiki: { ...DEFAULT_APP_CONFIG.shiki },
			reactions: { emojis: ["🔥", "👍"] },
		});
	});

	it("ignores multi-code-point emoji sequences", () => {
		expect(
			parseAppConfig({
				reactions: { emojis: ["👍🏽", "🇺🇸", "👍"] },
			}),
		).toEqual({
			shiki: { ...DEFAULT_APP_CONFIG.shiki },
			reactions: { emojis: ["👍"] },
		});
	});

	it("falls back to defaults when reactions list is empty after normalization", () => {
		expect(parseAppConfig({ reactions: { emojis: ["ab", ""] } })).toEqual(
			DEFAULT_APP_CONFIG,
		);
	});
});

describe("parseAppConfigText", () => {
	it("parses JSONC with comments", () => {
		expect(
			parseAppConfigText(`{
				// reactions
				"reactions": { "emojis": ["🎉", "👍"] }
			}`),
		).toEqual({
			shiki: { ...DEFAULT_APP_CONFIG.shiki },
			reactions: { emojis: ["🎉", "👍"] },
		});
	});
});
