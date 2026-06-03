import { afterEach, describe, expect, it, vi } from "vitest";

const { createHighlighterMock } = vi.hoisted(() => ({
	createHighlighterMock: vi.fn(),
}));

vi.mock("shiki", () => ({
	createHighlighter: createHighlighterMock,
}));

vi.mock("../config/load-app-config.js", () => ({
	loadAppConfig: vi.fn(async () => ({
		shiki: { light: "github-light", dark: "github-dark" },
	})),
}));

import {
	highlightCode,
	resetShikiHighlighterCache,
} from "./shiki-highlighter.js";

describe("shiki-highlighter", () => {
	afterEach(() => {
		resetShikiHighlighterCache();
		vi.clearAllMocks();
	});

	it("clears cache when highlighter initialization fails", async () => {
		createHighlighterMock
			.mockRejectedValueOnce(new Error("init failed"))
			.mockResolvedValueOnce({
				getLoadedLanguages: () => ["javascript", "plaintext"],
				loadLanguage: vi.fn(),
				codeToHtml: () => "<pre class='shiki'>ok</pre>",
			});

		await expect(highlightCode("x", "javascript")).rejects.toThrow(
			"init failed",
		);
		await expect(highlightCode("x", "javascript")).resolves.toContain("shiki");
		expect(createHighlighterMock).toHaveBeenCalledTimes(2);
	});
});
